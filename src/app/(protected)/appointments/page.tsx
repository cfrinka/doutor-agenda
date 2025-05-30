import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/_components/ui/page-container";
import { db } from "@/db";
import { doctorsTable, patientsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppointmentsTable } from "./_components/appointments-table";
import { AddAppointmentButton } from "./_components/add-appointment-button";
import { eq } from "drizzle-orm";

export default async function AppointmentsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/authentication");
  }

  if (!session.user.clinic?.id) {
    redirect("/clinic-form");
  }

  const [appointments, doctors, patients] = await Promise.all([
    db.query.appointmentsTable.findMany({
      where: (appointments, { eq }) =>
        eq(appointments.clinicId, session.user.clinic!.id),
      with: {
        patient: true,
        doctor: true,
      },
    }),
    db.query.doctorsTable.findMany({
      where: eq(doctorsTable.clinicId, session.user.clinic.id),
    }),
    db.query.patientsTable.findMany({
      where: eq(patientsTable.clinicId, session.user.clinic.id),
    }),
  ]);

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Agendamentos</PageTitle>
          <PageDescription>
            Gerencie os agendamentos da sua clínica
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <AddAppointmentButton doctors={doctors} patients={patients} />
        </PageActions>
      </PageHeader>
      <PageContent>
        <AppointmentsTable
          appointments={appointments as any}
          doctors={doctors}
          patients={patients}
        />
      </PageContent>
    </PageContainer>
  );
}
