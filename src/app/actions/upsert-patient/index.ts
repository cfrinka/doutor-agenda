"use server";
import { z } from "zod";
import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db";
import { patientsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const upsertPatientSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  phoneNumber: z.string().min(1, "Telefone é obrigatório"),
  sex: z.enum(["male", "female"]),
  clinicId: z.string().uuid(),
});

export const upsertPatient = actionClient
  .schema(upsertPatientSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    if (!session?.user.clinic?.id) {
      throw new Error("Clinic not found");
    }

    if (parsedInput.id) {
      const patient = await db.query.patientsTable.findFirst({
        where: eq(patientsTable.id, parsedInput.id),
      });

      if (!patient) {
        throw new Error("Paciente não encontrado");
      }

      if (patient.clinicId !== session.user.clinic.id) {
        throw new Error("Paciente não encontrado");
      }

      await db
        .update(patientsTable)
        .set({
          name: parsedInput.name,
          email: parsedInput.email,
          phoneNumber: parsedInput.phoneNumber,
          sex: parsedInput.sex,
          updatedAt: new Date(),
        })
        .where(eq(patientsTable.id, parsedInput.id));
    } else {
      await db.insert(patientsTable).values({
        name: parsedInput.name,
        email: parsedInput.email,
        phoneNumber: parsedInput.phoneNumber,
        sex: parsedInput.sex,
        clinicId: session.user.clinic.id,
      });
    }

    revalidatePath("/patients");
    return { success: true };
  });
