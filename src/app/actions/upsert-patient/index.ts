"use server";
import { z } from "zod";
import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db";
import { patientsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

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
    try {
      if (parsedInput.id) {
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
          clinicId: parsedInput.clinicId,
        });
      }

      revalidatePath("/patients");
      return { success: true };
    } catch (error) {
      return { success: false, error: "Erro ao salvar paciente" };
    }
  });
