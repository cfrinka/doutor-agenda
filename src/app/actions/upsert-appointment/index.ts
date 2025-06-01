"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { upsertAppointmentSchema } from "./schema";
import { getAvailableTimes } from "../get-available-times";
import dayjs from "dayjs";

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

    const availableTimes = await getAvailableTimes({
      doctorId: parsedInput.doctorId,
      date: dayjs(parsedInput.date).format("YYYY-MM-DD"),
    });

    if (!availableTimes?.data) {
      throw new Error("No available times");
    }

    const isTimeAvailable = availableTimes.data?.data?.some(
      (time) => time.value === parsedInput.time && time.available,
    );

    if (!isTimeAvailable) {
      throw new Error("Time is not available");
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
        appointmentPriceInCents: parsedInput.appointmentPriceInCents,
        date,
        clinicId: session.user.clinic.id,
      });
    }

    revalidatePath("/appointments");
    revalidatePath("/dashboard");
  });
