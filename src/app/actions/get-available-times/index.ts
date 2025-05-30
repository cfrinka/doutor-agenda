"use server";
import { db } from "@/db";
import { appointmentsTable, doctorsTable } from "@/db/schema";
import { generateTimeSlots } from "@/helpers/time";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import dayjs from "dayjs";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export const getAvailableTimes = actionClient
  .schema(
    z.object({
      doctorId: z.string(),
      date: z.string(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Unauthorized");
    }

    if (!session.user.clinic) {
      throw new Error("Clínica não encontrada");
    }

    if (!parsedInput.doctorId || !parsedInput.date) {
      return { data: [] };
    }

    const doctor = await db.query.doctorsTable.findFirst({
      where: eq(doctorsTable.id, parsedInput.doctorId),
    });

    if (!doctor) {
      throw new Error("Médico não encontado");
    }

    const selectedDayOfWeek = dayjs(parsedInput.date).day();

    const doctorIsAvailable =
      selectedDayOfWeek >= doctor.availableFromWeekday &&
      selectedDayOfWeek <= doctor.availableToWeekday;

    if (!doctorIsAvailable) {
      return { data: [] };
    }

    const appointments = await db.query.appointmentsTable.findMany({
      where: eq(appointmentsTable.doctorId, parsedInput.doctorId),
    });

    const appointmentsOnSelectedDate = appointments
      .filter((appointment) => {
        return dayjs(appointment.date).isSame(parsedInput.date, "day");
      })
      .map((appointment) => dayjs(appointment.date).format("HH:mm:ss"));

    const timeSlots = generateTimeSlots();

    const doctorAvailbleFrom = dayjs()
      .utc()
      .set("hour", Number(doctor.availableFromTime.split(":")[0]))
      .set("minute", Number(doctor.availableFromTime.split(":")[1]))
      .set("second", 0)
      .local();

    const doctorAvailbleTo = dayjs()
      .utc()
      .set("hour", Number(doctor.availableToTime.split(":")[0]))
      .set("minute", Number(doctor.availableToTime.split(":")[1]))
      .set("second", 0)
      .local();

    const doctorTimeSlots = timeSlots.filter((time) => {
      const date = dayjs()
        .utc()
        .set("hour", Number(time.split(":")[0]))
        .set("minute", Number(time.split(":")[1]))
        .set("second", 0);

      const isAvailable =
        date.format("HH:mm:ss") >= doctorAvailbleFrom.format("HH:mm:ss") &&
        date.format("HH:mm:ss") <= doctorAvailbleTo.format("HH:mm:ss");

      return isAvailable;
    });

    const availableSlots = doctorTimeSlots.map((time) => ({
      value: time,
      available: !appointmentsOnSelectedDate.includes(time),
    }));

    return { data: availableSlots };
  });
