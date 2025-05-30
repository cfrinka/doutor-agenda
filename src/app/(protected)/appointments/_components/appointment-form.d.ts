import { doctorsTable, patientsTable } from "@/db/schema";
import { ReactElement } from "react";

export interface AppointmentFormProps {
  doctors: (typeof doctorsTable.$inferSelect)[];
  patients: (typeof patientsTable.$inferSelect)[];
  onSuccess?: () => void;
}

export function AppointmentForm(props: AppointmentFormProps): ReactElement;
