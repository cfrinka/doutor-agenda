import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/_components/ui/page-container";
import { AddPatientButton } from "./_components/add-patient-button";
import { db } from "@/db";
import { patientsTable } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { PatientsTable } from "./_components/patients-table";

export default async function PatientsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/authentication");
  }

  if (!session.user.clinic?.id) {
    redirect("/clinic-form");
  }

  const patients = await db.query.patientsTable.findMany({
    where: eq(patientsTable.clinicId, session.user.clinic.id),
    orderBy: [desc(patientsTable.createdAt)],
  });

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Pacientes</PageTitle>
          <PageDescription>
            Gerencie os pacientes da sua clínica
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <AddPatientButton clinicId={session.user.clinic.id} />
        </PageActions>
      </PageHeader>
      <PageContent>
        {patients.length === 0 ? (
          <div className="text-muted-foreground text-center">
            Nenhum paciente cadastrado
          </div>
        ) : (
          <PatientsTable
            patients={patients}
            clinicId={session.user.clinic.id}
          />
        )}
      </PageContent>
    </PageContainer>
  );
}
