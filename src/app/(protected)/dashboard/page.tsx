import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import React from "react";
import { redirect } from "next/navigation";
import {
  PageContainer,
  PageHeader,
  PageHeaderContent,
  PageTitle,
  PageDescription,
  PageActions,
  PageContent,
} from "@/_components/ui/page-container";
import { DatePicker } from "./_components/date-picker";
import { appointmentsTable, doctorsTable, patientsTable } from "@/db/schema";
import { db } from "@/db";
import { and, gte, lte, eq, sum, count } from "drizzle-orm";
import StatsCards from "./_components/stats-cards";
import dayjs from "dayjs";

interface DashboardPageProps {
  searchParams: Promise<{ from: string; to: string }>;
}

const DashboardPage = async ({ searchParams }: DashboardPageProps) => {
  const { from, to } = await searchParams;

  if (!from || !to) {
    redirect(
      `/dashboard?from=${dayjs().format("YYYY-MM-DD")}&to=${dayjs().add(1, "month").format("YYYY-MM-DD")}`,
    );
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/authentication");
  }

  if (!session.user.clinic) {
    redirect("/clinic-form");
  }

  const [totalRevenue, totalAppointments, totalPatients, totalDoctors] =
    await Promise.all([
      db
        .select({
          total: sum(appointmentsTable.appointmentPriceInCents),
        })
        .from(appointmentsTable)
        .where(
          and(
            eq(appointmentsTable.clinicId, session.user.clinic.id),
            gte(appointmentsTable.date, new Date(from)),
            lte(appointmentsTable.date, new Date(to)),
          ),
        ),
      db
        .select({
          total: count(),
        })
        .from(appointmentsTable)
        .where(
          and(
            eq(appointmentsTable.clinicId, session.user.clinic.id),
            gte(appointmentsTable.date, new Date(from)),
            lte(appointmentsTable.date, new Date(to)),
          ),
        ),
      db
        .select({
          total: count(),
        })
        .from(patientsTable)
        .where(and(eq(patientsTable.clinicId, session.user.clinic.id))),
      db
        .select({
          total: count(),
        })
        .from(doctorsTable)
        .where(and(eq(doctorsTable.clinicId, session.user.clinic.id))),
    ]);

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Dashboard</PageTitle>
          <PageDescription>Visão geral da sua clínica</PageDescription>
        </PageHeaderContent>
        <PageActions>
          <DatePicker />
        </PageActions>
      </PageHeader>
      <PageContent>
        <StatsCards
          totalRevenue={
            totalRevenue[0]?.total ? Number(totalRevenue[0].total) : null
          }
          totalAppointments={totalAppointments[0]?.total}
          totalPatients={totalPatients[0]?.total}
          totalDoctors={totalDoctors[0]?.total}
        />
      </PageContent>
    </PageContainer>
  );
};

export default DashboardPage;
