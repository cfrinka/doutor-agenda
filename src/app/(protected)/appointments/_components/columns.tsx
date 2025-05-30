"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/_components/ui/button";
import { Trash2 } from "lucide-react";
import { Appointment } from "./appointments-table";
import { ArrowUpDown } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export const columns: ColumnDef<Appointment>[] = [
  {
    accessorFn: (row) => row.patient.name,
    id: "patientName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="px-4 text-left"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Paciente
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="px-4">{row.original.patient.name}</div>,
  },
  {
    accessorFn: (row) => row.doctor.name,
    id: "doctorName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="px-4 text-left"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Médico
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="px-4">{row.original.doctor.name}</div>,
  },
  {
    accessorFn: (row) => row.doctor.speciality,
    id: "doctorSpeciality",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="px-4 text-left"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Especialidade
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="px-4">{row.original.doctor.speciality}</div>
    ),
  },
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="px-4 text-left"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Data
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date =
        typeof row.getValue("date") === "string"
          ? parseISO(row.getValue("date"))
          : new Date(row.getValue("date"));
      return (
        <div className="px-4">{format(date, "PPP", { locale: ptBR })}</div>
      );
    },
  },
  {
    accessorKey: "time",
    header: () => <div className="px-4 text-left">Horário</div>,
    cell: ({ row }) => {
      const date =
        typeof row.original.date === "string"
          ? parseISO(row.original.date)
          : new Date(row.original.date);
      return (
        <div className="px-4">{format(date, "HH:mm", { locale: ptBR })}</div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="pr-4 text-right">Ações</div>,
    cell: ({ row, table }) => {
      const appointment = row.original;
      const meta = table.options.meta as {
        onDelete: (appointment: Appointment) => void;
      };

      return (
        <div className="flex items-center justify-end gap-2 pr-4 text-right">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => meta.onDelete(appointment)}
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
