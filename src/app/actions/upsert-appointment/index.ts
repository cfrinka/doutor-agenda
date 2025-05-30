"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { upsertAppointmentSchema } from "./schema";

export const upsertAppointment = actionClient
  .schema(upsertAppointmentSchema)
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

    const date = new Date(parsedInput.date);
    const [hours, minutes] = parsedInput.time.split(":").map(Number);
    date.setHours(hours, minutes, 0, 0);

    if (parsedInput.id) {
      await db
        .update(appointmentsTable)
        .set({
          patientId: parsedInput.patientId,
          doctorId: parsedInput.doctorId,
          date,
          updatedAt: new Date(),
        })
        .where(eq(appointmentsTable.id, parsedInput.id));
    } else {
      await db.insert(appointmentsTable).values({
        patientId: parsedInput.patientId,
        doctorId: parsedInput.doctorId,
        date,
        clinicId: session.user.clinic.id,
      });
    }

    revalidatePath("/appointments");
  });
