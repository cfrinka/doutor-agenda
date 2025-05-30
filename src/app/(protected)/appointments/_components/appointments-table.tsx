"use client";

import { useState } from "react";
import { UpsertAppointmentForm } from "./upsert-appointment-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/_components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/_components/ui/alert-dialog";
import { useAction } from "next-safe-action/hooks";
import { deleteAppointment } from "@/app/actions/delete-appointment";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { DataTable } from "@/app/_components/ui/data-table";
import { columns } from "./columns";
import { doctorsTable, patientsTable } from "@/db/schema";

export interface Appointment {
  id: string;
  date: Date;
  patient: typeof patientsTable.$inferSelect;
  doctor: typeof doctorsTable.$inferSelect;
  clinicId: string;
}

interface AppointmentsTableProps {
  appointments: Appointment[];
  doctors: (typeof doctorsTable.$inferSelect)[];
  patients: (typeof patientsTable.$inferSelect)[];
}

export function AppointmentsTable({
  appointments,
  doctors,
  patients,
}: AppointmentsTableProps) {
  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null);
  const [deletingAppointment, setDeletingAppointment] =
    useState<Appointment | null>(null);
  const router = useRouter();

  const deleteAppointmentAction = useAction(deleteAppointment, {
    onSuccess: () => {
      toast.success("Agendamento excluído com sucesso");
      setDeletingAppointment(null);
      router.refresh();
    },
    onError: () => {
      toast.error("Erro ao excluir agendamento");
    },
  });

  return (
    <>
      <DataTable
        columns={columns}
        data={appointments}
        meta={{
          onEdit: setEditingAppointment,
          onDelete: setDeletingAppointment,
        }}
      />

      <Dialog
        open={!!editingAppointment}
        onOpenChange={() => setEditingAppointment(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Agendamento</DialogTitle>
          </DialogHeader>
          {editingAppointment && (
            <UpsertAppointmentForm
              doctors={doctors}
              patients={patients}
              onSuccess={() => setEditingAppointment(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deletingAppointment}
        onOpenChange={() => setDeletingAppointment(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Agendamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este agendamento? Esta ação não
              pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingAppointment) {
                  deleteAppointmentAction.execute({
                    id: deletingAppointment.id,
                  });
                }
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
