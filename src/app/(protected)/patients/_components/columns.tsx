"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/_components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { Patient } from "./patients-table";
import { ArrowUpDown } from "lucide-react";

export const columns: ColumnDef<Patient>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nome
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phoneNumber",
    header: "Telefone",
  },
  {
    accessorKey: "sex",
    header: "Sexo",
    cell: ({ row }) => {
      return row.getValue("sex") === "male" ? "Masculino" : "Feminino";
    },
  },
  {
    id: "actions",
    header: () => <div className="pr-4 text-right">Ações</div>,
    cell: ({ row, table }) => {
      const patient = row.original;
      const meta = table.options.meta as {
        onEdit: (patient: Patient) => void;
        onDelete: (patient: Patient) => void;
      };

      return (
        <div className="flex items-center justify-end gap-2 pr-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => meta.onEdit(patient)}
            className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => meta.onDelete(patient)}
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
