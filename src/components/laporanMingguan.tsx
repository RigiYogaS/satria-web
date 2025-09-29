"use client";

import React, { useState, useEffect } from "react";
import AppBreadcrumb from "@/components/AppBreadcrumb";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebarUser from "@/components/app-sidebarUser";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import { Button } from "./ui/button";
import {
  DataTableLaporanMingguan,
  columnsLaporanMingguan,
  LaporanMingguan,
} from "./ui/dataTableLaporanMingguan";
import { useSession } from "next-auth/react";

const LaporanMingguanPage = () => {
  const [data, setData] = useState<LaporanMingguan[]>([]);
  const [loading, setLoading] = useState(false);
  const [judul, setJudul] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const { data: session } = useSession();

  useEffect(() => {
    const fetchLaporan = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/laporan");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const userId = session?.user?.id;
          setData(
            json.data
              .filter(
                (item: any) => item.user_id?.toString() === userId?.toString()
              ) // <-- filter sesuai user login
              .map((item: any) => ({
                id_laporan: item.id_laporan,
                judul: item.judul,
                tanggal_upload: item.tanggal_upload,
                nilai_admin: item.nilai_admin,
                file_path: item.file_path,
              }))
          );
        } else {
          setData([]);
        }
      } catch (e) {
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    if (session?.user?.id) fetchLaporan();
  }, [session]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const filteredData = search.trim()
    ? data.filter((item) => {
        const judulMatch = item.judul
          ?.toLowerCase()
          .includes(search.toLowerCase());
        const tanggalStr = new Date(item.tanggal_upload)
          .toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })
          .toLowerCase();
        const tanggalMatch = tanggalStr.includes(search.toLowerCase());
        return judulMatch || tanggalMatch;
      })
    : data;

  const handleUpload = async () => {
    if (!file || !judul.trim() || !session?.user?.id) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("judul", judul);
    formData.append("user_id", session.user.id);
    formData.append("file_path", `/uploads/${file.name}`);

    try {
      const res = await fetch("/api/laporan", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (json.success) {
        setFile(null);
        setJudul("");
        // fetchLaporan();
      } else {
        alert(json.error || "Upload gagal");
      }
    } catch (e) {
      alert("Upload gagal");
    } finally {
      setUploading(false);
    }
  };

  return (
    <SidebarProvider className="font-montserrat bg-neutral-50">
      <AppSidebarUser />
      <main className="flex-1 md:p-6 p-2">
        <div className="flex items-center gap-3 md:mb-6 mb-3">
          <SidebarTrigger />
          <AppBreadcrumb />
        </div>
        <div className="mt-4">
          <h1 className="md:text-3xl text-2xl font-bold mb-8">
            Laporan Mingguan
          </h1>
          {/* Container Input & Search */}
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6 w-full">
            <div className="flex flex-col max-w-xs gap-2">
              <div className="flex flex-col md:flex-row gap-2">
                <Label
                  htmlFor="judul"
                  className="md:text-base text-sm mb-2 md:w-2/3 w-full"
                >
                  Judul Laporan
                </Label>
                <Input
                  id="judul"
                  type="text"
                  placeholder="Masukkan judul laporan"
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  disabled={uploading}
                  className="mb-2 md:text-sm text-xs"
                />
              </div>
              <div className="flex flex-col md:flex-row gap-2">
                <Label
                  htmlFor="file"
                  className="md:text-base text-sm mb-2 md:w-2/3 w-full"
                >
                  Masukkan File
                </Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="md:text-sm text-xs"
                />
              </div>
              <Button
                size="default"
                className="bg-navy-200 hover:bg-navy-500 mt-2 md:text-base text-sm"
                onClick={handleUpload}
                disabled={!file || !judul.trim() || uploading}
              >
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </div>
            <div className="flex items-end flex-1 max-w-xs">
              <Label htmlFor="search" className="mb-2 invisible">
                Cari Laporan
              </Label>
              <div className="relative w-full">
                <Input
                  id="search"
                  type="search"
                  placeholder="Cari Laporan..."
                  className="pr-10 md:text-sm text-xs"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
            </div>
          </div>
          {/* Table di bawahnya */}
          <div className="w-full">
            <DataTableLaporanMingguan
              columns={columnsLaporanMingguan}
              data={filteredData}
              loading={loading}
            />
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
};

export default LaporanMingguanPage;
