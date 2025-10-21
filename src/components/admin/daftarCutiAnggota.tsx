"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebarAdmin from "./app-sidebarAdmin";
import AppBreadcrumb from "../ui/AppBreadcrumb";
import { DataTableCutiAnggota } from "@/components/ui/dataTableCutiAnggota";
import { getColumnsCuti } from "@/components/ui/columsTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import AlertUsage from "@/components/ui/alertUsage";

const DaftarCutiAnggota = () => {
  const [search, setSearch] = useState("");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);
  const [statusVal, setStatusVal] = useState<
    "pending" | "disetujui" | "ditolak"
  >("pending");

  // Alert delete state
  const [alertOpen, setAlertOpen] = useState(false);
  const [toDelete, setToDelete] = useState<any | null>(null);

  const fetchData = useCallback(async (q?: string) => {
    setLoading(true);
    try {
      const url = new URL("/api/cuti", window.location.origin);
      url.searchParams.set("limit", "100");
      if (q) url.searchParams.set("search", q);
      const res = await fetch(url.toString());
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setData(json.data);
      } else {
        setData([]);
      }
    } catch (err) {
      console.error(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const t = setTimeout(() => fetchData(search.trim() || undefined), 300);
    return () => clearTimeout(t);
  }, [search, fetchData]);

  // edit handler opens dialog
  const handleEdit = (row: any) => {
    setSelected(row);
    setStatusVal((row.status as any) || "pending");
    setOpenEdit(true);
  };

  const handleSaveStatus = async () => {
    if (!selected) return;
    try {
      const res = await fetch("/api/cuti", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selected.id_cuti ?? selected.id,
          status: statusVal,
        }),
      });
      const json = await res.json();
      setOpenEdit(false);
      setSelected(null);
      if (json.success) fetchData(search.trim() || undefined);
      else console.error("Gagal update status", json);
    } catch (err) {
      console.error(err);
    }
  };

  // open alert (instead of window.confirm)
  const handleDelete = (row: any) => {
    setToDelete(row);
    setAlertOpen(true);
  };

  // called when user confirms delete in AlertUsage
  const confirmDelete = async () => {
    if (!toDelete) return;
    const id = toDelete.id_cuti ?? toDelete.id;
    try {
      const res = await fetch("/api/cuti", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      setAlertOpen(false);
      setToDelete(null);
      if (json.success) fetchData(search.trim() || undefined);
      else console.error("Gagal hapus", json);
    } catch (err) {
      console.error(err);
      setAlertOpen(false);
      setToDelete(null);
    }
  };

  const cancelDelete = () => {
    setAlertOpen(false);
    setToDelete(null);
  };

  const columns = getColumnsCuti(handleEdit, handleDelete);

  return (
    <SidebarProvider className="font-montserrat bg-neutral-100">
      <AppSidebarAdmin />
      <main className="flex-1 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <SidebarTrigger />
          <AppBreadcrumb />
        </div>

        <div>
          <h1 className="md:text-3xl text-2xl font-bold text-neutral-800 mb-4">
            Daftar Cuti Anggota
          </h1>
          <p className="text-neutral-600">
            Halaman ini menampilkan daftar cuti anggota.
          </p>
        </div>

        <div className="relative md:w-72 w-full ml-auto mb-4">
          <Input
            id="search"
            type="search"
            placeholder="Cari Nama Anggota..."
            className="pr-10 md:text-sm text-xs bg-white w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
        </div>

        <DataTableCutiAnggota columns={columns} data={data} loading={loading} />

        {/* Edit Status Dialog */}
        <Dialog open={openEdit} onOpenChange={setOpenEdit}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ubah Status Cuti</DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-600">Nama</div>
                <div className="font-medium">
                  {selected?.user?.nama ?? selected?.nama}
                </div>
              </div>
              <div>
                <label className="block text-sm mb-2">Status</label>
                <select
                  value={statusVal}
                  onChange={(e) => setStatusVal(e.target.value as any)}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="pending">Pending</option>
                  <option value="disetujui">Disetujui</option>
                  <option value="ditolak">Ditolak</option>
                </select>
              </div>
            </div>

            <DialogFooter>
              <div className="flex gap-2 justify-end w-full">
                <button
                  onClick={() => setOpenEdit(false)}
                  className="px-4 py-2 bg-gray-100 rounded"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveStatus}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Simpan
                </button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertUsage
          open={alertOpen}
          onOpenChange={setAlertOpen}
          title="Hapus Pengajuan Cuti"
          description="Yakin ingin menghapus pengajuan cuti ini? Tindakan ini tidak dapat dikembalikan."
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      </main>
    </SidebarProvider>
  );
};

export default DaftarCutiAnggota;
