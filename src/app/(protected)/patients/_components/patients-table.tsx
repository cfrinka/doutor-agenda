"use client";

import { useState } from "react";
import { UpsertPatientForm } from "./upsert-patient-form";
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
import { deletePatient } from "@/app/actions/delete-patient";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { DataTable } from "@/app/_components/ui/data-table";
import { columns } from "./columns";

export interface Patient {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  sex: "male" | "female";
  clinicId: string;
}

interface PatientsTableProps {
  patients: Patient[];
  clinicId: string;
}

export function PatientsTable({ patients, clinicId }: PatientsTableProps) {
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [deletingPatient, setDeletingPatient] = useState<Patient | null>(null);
  const router = useRouter();

  const deletePatientAction = useAction(deletePatient, {
    onSuccess: () => {
      toast.success("Paciente excluído com sucesso");
      setDeletingPatient(null);
      router.refresh();
    },
    onError: () => {
      toast.error("Erro ao excluir paciente");
    },
  });

  return (
    <>
      <DataTable
        columns={columns}
        data={patients}
        meta={{
          onEdit: setEditingPatient,
          onDelete: setDeletingPatient,
        }}
      />

      <Dialog
        open={!!editingPatient}
        onOpenChange={() => setEditingPatient(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Paciente</DialogTitle>
          </DialogHeader>
          {editingPatient && (
            <UpsertPatientForm
              defaultValues={editingPatient}
              onSuccess={() => setEditingPatient(null)}
              clinicId={clinicId}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deletingPatient}
        onOpenChange={() => setDeletingPatient(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Paciente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este paciente? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingPatient) {
                  deletePatientAction.execute({ id: deletingPatient.id });
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
