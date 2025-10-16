// src/components/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Pen, Trash } from "lucide-react";

export const columnsCuti: ColumnDef<any, any>[] = [
  {
    accessorKey: "created_at",
    header: "Tanggal Pengajuan",
    cell: ({ getValue }) => (
      <span>
        {new Date(getValue() as string).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })}
      </span>
    ),
  },
  {
    accessorKey: "alasan",
    header: "Alasan",
    cell: ({ getValue }) => (
      <span className="bg-red-100 text-red-600 px-2 py-1 rounded">
        {getValue() as string}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => {
      const status = getValue() as string;
      return (
        <span
          className={
            status === "pending"
              ? "bg-yellow-100 text-yellow-700 px-2 py-1 rounded"
              : status === "disetujui"
              ? "bg-green-100 text-green-700 px-2 py-1 rounded"
              : "bg-red-100 text-red-700 px-2 py-1 rounded"
          }
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      );
    },
  },
  {
    accessorKey: "tgl_mulai",
    header: "Mulai Cuti",
    cell: ({ getValue }) => (
      <span>
        {new Date(getValue() as string).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })}
      </span>
    ),
  },
  {
    accessorKey: "tgl_selesai",
    header: "Akhir Cuti",
    cell: ({ getValue }) => (
      <span>
        {new Date(getValue() as string).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })}
      </span>
    ),
  },
];

// Struktur data absensi
export type AbsensiData = {
  id: number;
  name: string;
  date: string;
  tanggal: string;
  status: "Hadir";
  waktu_masuk: string | null;
  waktu_keluar: string | null;
  lokasi?: string;
  checkin_status?: "tepat_waktu" | "telat";
  checkout_status?: "normal" | "lembur" | "setengah_hari";
};

// Kolom untuk tabel absensi
export const columns: ColumnDef<AbsensiData>[] = [
  {
    accessorKey: "tanggal",
    header: "Tanggal Absen",
    cell: ({ row }) => {
      const date = new Date(row.getValue("tanggal"));
      return date.toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },
  },
  {
    accessorKey: "status",
    header: "Status Absen",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;

      const getStatusColor = (status: string) => {
        switch (status) {
          case "Hadir":
            return "bg-green-100 text-green-800 hover:bg-green-200";
          case "Terlambat":
            return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
          case "Sakit":
            return "bg-blue-100 text-blue-800 hover:bg-blue-200";
          case "Izin":
            return "bg-purple-100 text-purple-800 hover:bg-purple-200";
          case "Alpha":
            return "bg-red-100 text-red-800 hover:bg-red-200";
          default:
            return "bg-gray-100 text-gray-800 hover:bg-gray-200";
        }
      };

      return <Badge className={getStatusColor(status)}>{status}</Badge>;
    },
  },
  {
    accessorKey: "waktu_absensi",
    header: "Waktu Absensi",
    cell: ({ row }) => {
      const waktuMasuk = row.original.waktu_masuk;
      const waktuKeluar = row.original.waktu_keluar;

      if (!waktuMasuk) return <span className="text-gray-400">-</span>;

      const formatWaktu = (waktu: string) => {
        return new Date(waktu).toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        });
      };

      return (
        <div className="flex flex-col items-center justify-center gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Masuk:</span>
            <span className="font-medium text-green-600">
              {formatWaktu(waktuMasuk)}
            </span>
          </div>
          {waktuKeluar && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Keluar:</span>
              <span className="font-medium text-blue-600">
                {formatWaktu(waktuKeluar)}
              </span>
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "checkin_status",
    header: "Status Masuk",
    cell: ({ row }) => {
      const status = row.original.checkin_status;
      return (
        <Badge
          className={
            status === "telat"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-green-100 text-green-800"
          }
        >
          {status === "tepat_waktu"
            ? "Tepat Waktu"
            : status === "telat"
            ? "Terlambat"
            : "-"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "checkout_status",
    header: "Setengah Hari",
    cell: ({ row }) => {
      const status = row.original.checkout_status;
      return (
        <Badge
          className={
            status === "setengah_hari"
              ? "bg-yellow-100 text-yellow-800"
              : status === "lembur"
              ? "bg-blue-100 text-blue-800"
              : "bg-green-100 text-green-800"
          }
        >
          {status === "setengah_hari"
            ? "Ya"
            : status === "lembur"
            ? "Lembur"
            : status === "normal"
            ? "Tidak"
            : "-"}
        </Badge>
      );
    },
  },
];

// Struktur data user/anggota
export type UserData = {
  id_user: number;
  nama: string;
  email: string;
  jabatan: string;
  bagian: string;
};

// Kolom untuk tabel user/anggota
export const columnsUser = (
  handleEdit: (row: UserData) => void,
  handleDelete: (row: UserData) => void
): ColumnDef<UserData>[] => [
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

// Struktur data absensi admin
export type AbsensiAdminData = {
  id: number;
  nama: string; // Nama Pegawai
  tanggal: string;
  status: string;
  waktu_masuk: string | null;
  waktu_keluar: string | null;
  checkin_status?: "tepat_waktu" | "telat";
  checkout_status?: "normal" | "lembur" | "setengah_hari";
};

export const columnsAbsensiAdmin: ColumnDef<AbsensiAdminData>[] = [
  {
    accessorKey: "nama",
    header: "Nama Pegawai",
    cell: ({ row }) => row.original.nama,
  },
  {
    accessorKey: "tanggal",
    header: "Tanggal Absen",
    cell: ({ row }) => {
      const date = new Date(row.getValue("tanggal"));
      return date.toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },
  },
  {
    accessorKey: "status",
    header: "Status Absen",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const getStatusColor = (status: string) => {
        switch (status) {
          case "Hadir":
            return "bg-green-100 text-green-800 hover:bg-green-200";
          case "Terlambat":
            return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
          case "Sakit":
            return "bg-blue-100 text-blue-800 hover:bg-blue-200";
          case "Izin":
            return "bg-purple-100 text-purple-800 hover:bg-purple-200";
          case "Alpha":
            return "bg-red-100 text-red-800 hover:bg-red-200";
          default:
            return "bg-gray-100 text-gray-800 hover:bg-gray-200";
        }
      };
      return <Badge className={getStatusColor(status)}>{status}</Badge>;
    },
  },
  {
    accessorKey: "waktu_absensi",
    header: "Waktu Absensi",
    cell: ({ row }) => {
      const waktuMasuk = row.original.waktu_masuk;
      const waktuKeluar = row.original.waktu_keluar;
      if (!waktuMasuk) return <span className="text-gray-400">-</span>;
      const formatWaktu = (waktu: string) => {
        return new Date(waktu).toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        });
      };
      return (
        <div className="flex flex-col items-center justify-center gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Masuk:</span>
            <span className="font-medium text-green-600">
              {formatWaktu(waktuMasuk)}
            </span>
          </div>
          {waktuKeluar && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Keluar:</span>
              <span className="font-medium text-blue-600">
                {formatWaktu(waktuKeluar)}
              </span>
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "checkin_status",
    header: "Status Masuk",
    cell: ({ row }) => {
      const status = row.original.checkin_status;
      return (
        <Badge
          className={
            status === "telat"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-green-100 text-green-800"
          }
        >
          {status === "tepat_waktu"
            ? "Tepat Waktu"
            : status === "telat"
            ? "Terlambat"
            : "-"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "checkout_status",
    header: "Setengah Hari",
    cell: ({ row }) => {
      const status = row.original.checkout_status;
      return (
        <Badge
          className={
            status === "setengah_hari"
              ? "bg-yellow-100 text-yellow-800"
              : status === "lembur"
              ? "bg-blue-100 text-blue-800"
              : "bg-green-100 text-green-800"
          }
        >
          {status === "setengah_hari"
            ? "Ya"
            : status === "lembur"
            ? "Lembur"
            : status === "normal"
            ? "Tidak"
            : "-"}
        </Badge>
      );
    },
  },
];
