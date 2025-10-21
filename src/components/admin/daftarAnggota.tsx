"use client";

import { useEffect, useState } from "react";
import { SearchIcon, Eye, EyeOff, X } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebarAdmin from "./app-sidebarAdmin";
import AppBreadcrumb from "../ui/AppBreadcrumb";
import { DataTableDaftarAnggota } from "@/components/ui/dataTableDaftarAnggota";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@radix-ui/react-label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { columnsUser } from "@/components/ui/columsTable";
import AlertUsage from "@/components/ui/alertUsage";

interface Anggota {
  id_user: number;
  nama: string;
  email: string;
  jabatan: string;
  bagian: string;
  pangkat?: string;
}

function validatePassword(password: string): string[] {
  const errors: string[] = [];
  if (password.length < 8) errors.push("Minimal 8 karakter");
  if (!/[A-Z]/.test(password)) errors.push("Minimal 1 huruf besar");
  if (!/[a-z]/.test(password)) errors.push("Minimal 1 huruf kecil");
  if (!/[0-9]/.test(password)) errors.push("Minimal 1 angka");
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
    errors.push("Minimal 1 karakter khusus");
  return errors;
}

const DaftarAnggota = () => {
  const [data, setData] = useState<Anggota[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const [nama, setNama] = useState("");
  const [jabatan, setJabatan] = useState("");
  const [email, setEmail] = useState("");
  const [bagian, setBagian] = useState("");
  const [password, setPassword] = useState("");
  const [konfirmasiPassword, setKonfirmasiPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showKonfirmasi, setShowKonfirmasi] = useState(false);

  const [openEdit, setOpenEdit] = useState(false);
  const [editUser, setEditUser] = useState<Anggota | null>(null);

  const [deleteUser, setDeleteUser] = useState<Anggota | null>(null);
  const [openDelete, setOpenDelete] = useState(false);

  const [divisiList, setDivisiList] = useState<
    {
      id_divisi: number;
      nama_divisi: string;
    }[]
  >([]);
  const [loadingDivisi, setLoadingDivisi] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [editPassword, setEditPassword] = useState("");
  const [editPasswordConfirm, setEditPasswordConfirm] = useState("");
  const [editFormError, setEditFormError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await fetch("/api/users");
      const users = await res.json();
      setData(users);
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchDivisi = async () => {
      setLoadingDivisi(true);
      const res = await fetch("/api/divisi?limit=100");
      const json = await res.json();
      if (json.success) {
        setDivisiList(json.data);
      }
      setLoadingDivisi(false);
    };
    fetchDivisi();
  }, []);

  const filteredData = data
    .filter((item) => item.jabatan.toLowerCase() !== "admin")
    .filter((item) => item.nama.toLowerCase().includes(search.toLowerCase()));

  // Reset form saat modal ditutup
  const handleDialogChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setNama("");
      setJabatan("");
      setEmail("");
      setBagian("");
      setPassword("");
      setKonfirmasiPassword("");
      setShowPassword(false);
      setShowKonfirmasi(false);
    }
  };

  // Handler submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      setFormError("Password tidak valid: " + passwordErrors.join(", "));
      return;
    }
    if (password !== konfirmasiPassword) {
      setFormError("Konfirmasi password tidak sama.");
      return;
    }

    if (!nama || !jabatan || !email || !bagian) {
      setFormError("Semua field harus diisi.");
      return;
    }

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama,
          jabatan,
          email,
          divisi_id: bagian,
          password,
          fromAdmin: true,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        setFormError(result.error || "Gagal menambah anggota.");
        return;
      }

      setOpen(false);
      setNama("");
      setJabatan("");
      setEmail("");
      setBagian("");
      setPassword("");
      setKonfirmasiPassword("");
      setShowPassword(false);
      setShowKonfirmasi(false);

      setLoading(true);
      const usersRes = await fetch("/api/users");
      const users = await usersRes.json();
      setData(users);
      setLoading(false);
    } catch (err) {
      setFormError("Terjadi kesalahan server.");
    }
  };

  const handleEdit = (user: Anggota) => {
    const divisi = divisiList.find((d) => d.nama_divisi === user.bagian);
    setEditUser({
      ...user,
      bagian: divisi ? divisi.id_divisi.toString() : "",
    });
    setOpenEdit(true);
  };

  const handleDelete = (user: Anggota) => {
    setDeleteUser(user);
    setOpenDelete(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteUser) return;
    try {
      const res = await fetch(`/api/users/${deleteUser.id_user}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        alert("Gagal menghapus user");
        return;
      }
      setData((prev) => prev.filter((u) => u.id_user !== deleteUser.id_user));
      setOpenDelete(false);
      setDeleteUser(null);
    } catch {
      alert("Terjadi kesalahan server");
    }
  };

  return (
    <SidebarProvider className="font-montserrat bg-neutral-100 overflow-x-auto">
      <AppSidebarAdmin />
      <main className="flex-1 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <SidebarTrigger />
          <AppBreadcrumb />
        </div>
        <h1 className="md:text-3xl text-2xl font-bold text-neutral-800 mb-4">
          Daftar Anggota
        </h1>
        <p className="text-sm mb-2">
          Tambahkan anggota dengan tombol dibawah ini
        </p>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
          <Button
            className="w-fit bg-navy-200 hover:bg-navy-500"
            onClick={() => setOpen(true)}
          >
            Tambah Anggota
          </Button>
          <div className="relative md:w-72 w-full ml-auto">
            <Input
              id="search"
              type="search"
              placeholder="Cari Anggota..."
              className="pr-10 md:text-sm text-xs bg-white w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
          </div>
        </div>

        {/* MODAL TAMBAH ANGGOTA */}
        <Dialog open={open} onOpenChange={handleDialogChange}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                Tambah Anggota
              </DialogTitle>
              <DialogClose asChild></DialogClose>
            </DialogHeader>
            <form className="space-y-3" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium mb-1">Nama</label>
                <Input
                  placeholder="Masukkan Nama"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  placeholder="Masukkan Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Jabatan
                </label>
                <Input
                  placeholder="Masukkan Jabatan"
                  value={jabatan}
                  onChange={(e) => setJabatan(e.target.value)}
                />
              </div>
              <div className="relative flex flex-col w-full gap-1">
                <Label htmlFor="bagian" className="text-sm">
                  Bagian
                </Label>
                <Select onValueChange={setBagian} value={bagian} required>
                  <SelectTrigger className="w-full text-sm">
                    <SelectValue
                      placeholder={loadingDivisi ? "Memuat..." : "Pilih Bagian"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {divisiList.map((divisi) => (
                      <SelectItem
                        key={divisi.id_divisi}
                        value={divisi.id_divisi.toString()}
                        className="text-sm"
                      >
                        {divisi.nama_divisi}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Buat Kata Sandi
                </label>
                <div className="relative">
                  <Input
                    placeholder="Masukkan Kata Sandi"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Konfirmasi Sandi Baru
                </label>
                <div className="relative">
                  <Input
                    placeholder="Konfirmasi Kata Sandi"
                    type={showKonfirmasi ? "text" : "password"}
                    value={konfirmasiPassword}
                    onChange={(e) => setKonfirmasiPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    onClick={() => setShowKonfirmasi((v) => !v)}
                    tabIndex={-1}
                  >
                    {showKonfirmasi ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              {formError && (
                <div className="text-red-500 text-sm">{formError}</div>
              )}
              <Button
                type="submit"
                className="w-full bg-navy-400 hover:bg-navy-600"
              >
                Tambahkan Anggota
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={openEdit} onOpenChange={setOpenEdit}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                Edit Anggota
              </DialogTitle>
              <DialogClose asChild />
            </DialogHeader>
            {editUser && (
              <form
                className="space-y-3"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setEditFormError(null);

                  // Validasi password jika diisi
                  if (editPassword) {
                    const passwordErrors = validatePassword(editPassword);
                    if (passwordErrors.length > 0) {
                      setEditFormError(
                        "Password tidak valid: " + passwordErrors.join(", ")
                      );
                      return;
                    }
                    if (editPassword !== editPasswordConfirm) {
                      setEditFormError("Konfirmasi password tidak sama.");
                      return;
                    }
                  }

                  const body: any = {
                    nama: editUser.nama,
                    jabatan: editUser.jabatan,
                    divisi_id: editUser.bagian,
                    email: editUser.email,
                    pangkat: editUser.pangkat ?? null,
                  };
                  if (editPassword) body.password = editPassword;

                  const res = await fetch(`/api/users/${editUser.id_user}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                  });
                  if (res.ok) {
                    const usersRes = await fetch("/api/users");
                    const users = await usersRes.json();
                    setData(users);
                    setOpenEdit(false);
                    setEditUser(null);
                    setEditPassword("");
                    setEditPasswordConfirm("");
                  } else {
                    alert("Gagal update user");
                  }
                }}
              >
                <div>
                  <label className="block text-sm font-medium mb-1">Nama</label>
                  <Input
                    placeholder="Masukkan Nama"
                    value={editUser.nama}
                    onChange={(e) =>
                      setEditUser({ ...editUser, nama: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <Input
                    placeholder="Masukkan Email"
                    value={editUser.email || ""}
                    onChange={(e) =>
                      setEditUser({ ...editUser, email: e.target.value })
                    }
                    type="email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Jabatan
                  </label>
                  <Input
                    placeholder="Masukkan Jabatan"
                    value={editUser.jabatan}
                    onChange={(e) =>
                      setEditUser({ ...editUser, jabatan: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Pangkat
                  </label>
                  <Input
                    placeholder="Masukkan Pangkat"
                    value={editUser.pangkat ?? ""}
                    onChange={(e) =>
                      setEditUser({ ...editUser, pangkat: e.target.value })
                    }
                  />
                </div>

                <div className="relative flex flex-col w-full gap-1">
                  <Label htmlFor="bagian" className="text-sm">
                    Bagian
                  </Label>
                  <Select
                    onValueChange={(val) =>
                      setEditUser({ ...editUser, bagian: val })
                    }
                    value={editUser.bagian}
                    required
                  >
                    <SelectTrigger className="w-full text-sm">
                      <SelectValue
                        placeholder={
                          loadingDivisi ? "Memuat..." : "Pilih Bagian"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {divisiList.map((divisi) => (
                        <SelectItem
                          key={divisi.id_divisi}
                          value={divisi.id_divisi.toString()}
                          className="text-sm"
                        >
                          {divisi.nama_divisi}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Password Baru
                  </label>
                  <Input
                    placeholder="Kosongkan jika tidak ingin ganti"
                    type="password"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Konfirmasi Password Baru
                  </label>
                  <Input
                    placeholder="Ulangi Password Baru"
                    type="password"
                    value={editPasswordConfirm}
                    onChange={(e) => setEditPasswordConfirm(e.target.value)}
                  />
                </div>
                {editFormError && (
                  <div className="text-red-500 text-sm">{editFormError}</div>
                )}
                <Button
                  type="submit"
                  className="w-full bg-navy-400 hover:bg-navy-600"
                >
                  Simpan Perubahan
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>

        <DataTableDaftarAnggota
          columns={columnsUser(handleEdit, handleDelete)}
          data={filteredData}
          loading={loading}
        />

        <AlertUsage
          open={openDelete}
          onOpenChange={setOpenDelete}
          title="Konfirmasi Hapus"
          description={`Yakin ingin menghapus ${deleteUser?.nama}?`}
          onConfirm={handleDeleteConfirm}
        />
      </main>
    </SidebarProvider>
  );
};

export default DaftarAnggota;
