import { PageContainer } from "@/_components/ui/page-container";
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pacientes</h1>
        <AddPatientButton clinicId={session.user.clinic.id} />
      </div>

      <div className="mt-8">
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
      </div>
    </PageContainer>
  );
}
