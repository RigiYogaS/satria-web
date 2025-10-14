"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Pen, Trash } from "lucide-react";

export interface UserRow {
  id_user: number;
  nama: string;
  jabatan: string;
  bagian: string;
}

export const columnsUser = (
  handleEdit: (row: UserRow) => void,
  handleDelete: (row: UserRow) => void
): ColumnDef<UserRow>[] => [
  {
    accessorKey: "nama",
    header: "Nama",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "jabatan",
    header: "Jabatan",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "bagian",
    header: "Bagian",
    cell: (info) => info.getValue(),
  },
  {
    id: "actions",
    header: "Action",
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-2">
        <button
          className="text-blue-500 hover:text-blue-700"
          title="Edit"
          onClick={() => handleEdit(row.original)}
          type="button"
        >
          <Pen size={18} />
        </button>
        <button
          className="text-red-500 hover:text-red-700"
          title="Delete"
          onClick={() => handleDelete(row.original)}
          type="button"
        >
          <Trash size={18} />
        </button>
      </div>
    ),
    enableSorting: false,
  },
];