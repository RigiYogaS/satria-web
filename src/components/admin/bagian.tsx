"use client";

import { useEffect, useState, useCallback } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebarAdmin from "./app-sidebarAdmin";
import AppBreadcrumb from "../ui/AppBreadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import { DataTableBagian } from "@/components/ui/dataTableBagian";
import { columnsDivisi, DivisiRow } from "@/components/ui/columsTable";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Bagian = () => {
  const [search, setSearch] = useState("");
  const [divisi, setDivisi] = useState<DivisiRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [newNama, setNewNama] = useState("");

  const fetchDivisi = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/divisi?limit=100&page=1");
      const json = await res.json();
      if (res.ok && json?.data) {
        setDivisi(json.data);
      } else {
        console.error("fetch divisi error", json);
        setDivisi([]);
      }
    } catch (err) {
      console.error("fetch divisi failed", err);
      setDivisi([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDivisi();
  }, [fetchDivisi]);

  // submit new bagian from dialog
  const handleAdd = async (nama: string) => {
    if (!nama || !nama.trim()) return { ok: false };
    try {
      const res = await fetch("/api/divisi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama_divisi: nama.trim() }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        return { ok: false, error: j?.error || "Gagal tambah bagian" };
      }
      await fetchDivisi();
      return { ok: true };
    } catch (e) {
      console.error(e);
      return { ok: false, error: "Gagal menambah bagian" };
    }
  };

  const handleEdit = async (row: DivisiRow) => {
    const nama = window.prompt("Edit nama bagian:", row.nama_divisi);
    if (nama === null) return;
    if (nama.trim() === "") {
      alert("Nama tidak boleh kosong");
      return;
    }
    try {
      const res = await fetch("/api/divisi", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_divisi: row.id_divisi,
          nama_divisi: nama.trim(),
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        alert(j?.error || "Gagal update bagian");
        return;
      }
      fetchDivisi();
    } catch (e) {
      console.error(e);
      alert("Gagal update bagian");
    }
  };

  const handleDelete = async (row: DivisiRow) => {
    if (!window.confirm(`Hapus bagian "${row.nama_divisi}"?`)) return;
    try {
      const res = await fetch("/api/divisi", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_divisi: row.id_divisi }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        alert(j?.error || "Gagal hapus bagian");
        return;
      }
      fetchDivisi();
    } catch (e) {
      console.error(e);
      alert("Gagal hapus bagian");
    }
  };

  const filtered = divisi.filter((d) =>
    d.nama_divisi?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SidebarProvider className="font-montserrat bg-neutral-100">
      <AppSidebarAdmin />
      <main className="flex-1 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <SidebarTrigger />
          <AppBreadcrumb />
        </div>

        <h1 className="md:text-3xl text-2xl font-bold text-neutral-800 mb-4">
          Daftar Bagian
        </h1>
        <p className="text-sm mb-2">
          Tambahkan bagian dengan tombol dibawah ini
        </p>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="w-fit bg-navy-200 hover:bg-navy-500">
                Tambah Bagian
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Bagian</DialogTitle>
                <DialogDescription>
                  Masukkan nama bagian baru.
                </DialogDescription>
              </DialogHeader>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const res = await handleAdd(newNama);
                  if (res.ok) {
                    setNewNama("");
                    setOpen(false);
                  } else {
                    alert(res.error || "Gagal menambah bagian");
                  }
                }}
              >
                <div className="mt-2">
                  <Input
                    id="nama_divisi"
                    value={newNama}
                    onChange={(e) => setNewNama(e.target.value)}
                    placeholder="Nama bagian"
                    required
                    className="w-full mb-10"
                  />
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="ghost" type="button">
                      Batal
                    </Button>
                  </DialogClose>
                  <Button
                    type="submit"
                    className="bg-navy-200 hover:bg-navy-500"
                  >
                    Simpan
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <div className="relative md:w-72	w-full ml-auto">
            <Input
              id="search"
              type="search"
              placeholder="Cari Bagian..."
              className="pr-10 md:text-sm text-xs bg-white w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
          </div>
        </div>

        <DataTableBagian
          columns={columnsDivisi(handleEdit, handleDelete)}
          data={filtered}
          loading={loading}
          pageSize={7}
        />
      </main>
    </SidebarProvider>
  );
};

export default Bagian;
