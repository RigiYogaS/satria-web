"use client";

import AppBreadcrumb from "@/components/ui/AppBreadcrumb";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebarUser from "@/components/user/app-sidebarUser";
import { AlertCircleIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RangeDatePicker } from "../ui/rangeDatePicker";
import { DateRange } from "react-day-picker";
import { useSession } from "next-auth/react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "../ui/alert-dialog";

const PengajuanCutiPage = () => {
  const { data: session } = useSession();
  const [alasan, setAlasan] = useState("");
  const [lebihSehari, setLebihSehari] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [file, setFile] = useState<File | null>(null);
  const [keterangan, setKeterangan] = useState("");
  const [loading, setLoading] = useState(false);

  // State untuk Alert Dialog
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !alasan ||
      !lebihSehari ||
      !dateRange?.from ||
      !dateRange?.to ||
      !session?.user?.id
    ) {
      showAlert("Data Tidak Lengkap", "Lengkapi semua data!");
      return;
    }
    setLoading(true);

    const tglSelesai =
      lebihSehari === "ya" ? new Date(dateRange.to) : new Date(dateRange.from);

    const formatDateForDB = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}T00:00:00.000Z`;
    };

    const formData = new FormData();
    formData.append("user_id", session.user.id);
    formData.append("alasan", alasan);
    formData.append(
      "lebih_dari_sehari",
      lebihSehari === "ya" ? "true" : "false"
    );
    formData.append("tgl_mulai", formatDateForDB(dateRange.from));
    formData.append("tgl_selesai", formatDateForDB(tglSelesai));
    formData.append("keterangan", keterangan);
    if (file) formData.append("file", file);

    try {
      const res = await fetch("/api/cuti", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (json.success) {
        showAlert("Berhasil", "Pengajuan cuti berhasil!");
        setAlasan("");
        setLebihSehari("");
        setDateRange(undefined);
        setFile(null);
        setKeterangan("");
      } else {
        showAlert("Gagal", json.error || "Pengajuan gagal");
      }
    } catch {
      showAlert("Error", "Pengajuan gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarProvider className="font-montserrat bg-neutral-100">
      <AppSidebarUser />
      <main className="flex-1 p-6">
        <div className="flex items-center gap-3 mb-6">
          <SidebarTrigger />
          <AppBreadcrumb />
        </div>
        <header>
          <h1 className="md:text-3xl text-2xl font-bold">Pengajuan Cuti</h1>
          <div className="text-red-600 flex bg-red-100 p-4 rounded-md mt-4">
            <AlertCircleIcon className="mb-1 mr-2 hidden md:inline" />
            <ul className="md:text-sm text-xs">
              <li>
                Izin Sakit hanya bisa diajukan maksimal H+3 sejak tanggal{" "}
              </li>
              <li>
                Izin Cuti harus diajukan minimal 1 hari sebelum tanggal cuti dan
                tanggal cuti harus lebih dari hari ini.
              </li>
            </ul>
          </div>
          <section className="md:mt-6 mt-2 flex justify-center items-center ">
            <form
              className="flex flex-col gap-4 w-full max-w-md border p-6 rounded-md bg-white shadow"
              onSubmit={handleSubmit}
            >
              {/* Alasan */}
              <div>
                <Label htmlFor="alasan" className="mb-1">
                  Alasan
                </Label>
                <Select value={alasan} onValueChange={setAlasan}>
                  <SelectTrigger className="w-full md:text-sm text-xs">
                    <SelectValue placeholder="Masukkan Alasan cuti" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sakit">Sakit</SelectItem>
                    <SelectItem value="cuti">Cuti</SelectItem>
                    <SelectItem value="izin">Izin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Lebih dari sehari */}
              <div>
                <Label htmlFor="lebihSehari" className="mb-1">
                  Lebih dari sehari
                </Label>
                <Select value={lebihSehari} onValueChange={setLebihSehari}>
                  <SelectTrigger className="w-full md:text-sm text-xs">
                    <SelectValue placeholder="Ya/Tidak" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ya">Ya</SelectItem>
                    <SelectItem value="tidak">Tidak</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Rentang Tanggal */}
              <div>
                <Label htmlFor="tanggal" className="mb-1">
                  Rentang Tanggal
                </Label>
                <RangeDatePicker
                  selectedRange={dateRange}
                  onDateChange={setDateRange}
                  className="bg-white hover:bg-white w-full text-neutral-600 hover:text-neutral-800 md:text-sm text-xs"
                />
              </div>
              {/* File Bukti */}
              <div>
                <Label htmlFor="file" className="mb-1">
                  File Bukti
                </Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  className="w-full md:text-sm text-xs"
                />
              </div>
              {/* Keterangan */}
              <div>
                <Label htmlFor="keterangan" className="mb-1">
                  Keterangan
                </Label>
                <Textarea
                  id="keterangan"
                  placeholder="Keterangan Cuti..."
                  className="placeholder:text-sm text-sm"
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                />
              </div>
              {/* Button */}
              <Button
                type="submit"
                className="w-full bg-navy-200 hover:bg-navy-500 mt-2"
                disabled={loading}
              >
                {loading ? "Mengajukan..." : "Ajukan"}
              </Button>
            </form>
          </section>
        </header>

        {/* Alert Dialog */}
        <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{alertTitle}</AlertDialogTitle>
              <AlertDialogDescription>{alertMessage}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setAlertOpen(false)}>
                OK
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </SidebarProvider>
  );
};

export default PengajuanCutiPage;
