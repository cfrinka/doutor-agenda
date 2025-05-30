"use client";

import { Button } from "@/_components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/_components/ui/dialog";
import { Plus } from "lucide-react";
import { UpsertPatientForm } from "./upsert-patient-form";
import { useState } from "react";

interface AddPatientButtonProps {
  clinicId: string;
}

export function AddPatientButton({ clinicId }: AddPatientButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Paciente
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Paciente</DialogTitle>
        </DialogHeader>
        <UpsertPatientForm
          onSuccess={() => setOpen(false)}
          clinicId={clinicId}
        />
      </DialogContent>
    </Dialog>
  );
}
