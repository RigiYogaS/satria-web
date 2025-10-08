"use client";

import { AlertCircle } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebarUser from "@/components/user/app-sidebarUser";
import AppBreadcrumb from "@/components/AppBreadcrumb";
import AbsenCard from "../ui/absenCard";
import StatusAbsen from "../ui/statusAbsen";
import LaporanHarian, { LaporanHarianHandle } from "../ui/laporanHarian";
import { useState, useRef, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useSession } from "next-auth/react";
import { Skeleton } from "@/components/ui/skeleton";

import { AbsenData } from "@/types/absen";

const AbsenToday = () => {
  const { data: session } = useSession();
  const [absenDataFromAPI, setAbsenDataFromAPI] = useState<AbsenData | null>(
    null
  );
  const [isCheckedIn, setIsCheckedIn] = useState<boolean>(false);
  const [isCheckedOut, setIsCheckedOut] = useState<boolean>(false);
  const [checkInTime, setCheckInTime] = useState<string>("");
  const [checkOutTime, setCheckOutTime] = useState<string>("");
  const [laporanComplete, setLaporanComplete] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [showLaporanAlert, setShowLaporanAlert] = useState<boolean>(false);
  const [isLoadingAbsenStatus, setIsLoadingAbsenStatus] =
    useState<boolean>(true);
  const [wifiName, setWifiName] = useState<string>("");

  const statusAbsenRef = useRef<{
    triggerCheckIn: (data: AbsenData) => void;
    triggerCheckOut: (data: AbsenData) => void;
  }>(null);

  const laporanRef = useRef<LaporanHarianHandle>(null);

  // Fetch status absensi hari ini dari API
  const checkTodayAbsensiStatus = async () => {
    setIsLoadingAbsenStatus(true);
    try {
      const response = await fetch("/api/absensi/hari-ini", {
        credentials: "include",
      });
      const result = await response.json();
      if (result && result.success && result.data) {
        const absensi = result.data;
        setIsCheckedIn(Boolean(absensi.hasCheckedIn));
        setIsCheckedOut(Boolean(absensi.hasCheckedOut));
        setCheckInTime(
          absensi.absensi?.waktu
            ? new Date(absensi.absensi.waktu).toLocaleTimeString("id-ID")
            : ""
        );
        setCheckOutTime(
          absensi.absensi?.checkoutTime
            ? new Date(absensi.absensi.checkoutTime).toLocaleTimeString("id-ID")
            : ""
        );

        setAbsenDataFromAPI(
          absensi.absensi
            ? {
                jamDatang: absensi.absensi.waktu
                  ? formatToHourMinute(absensi.absensi.waktu)
                  : "",
                jamKeluar: absensi.absensi.checkoutTime
                  ? formatToHourMinute(absensi.absensi.checkoutTime)
                  : "",
                tanggal: absensi.absensi.waktu,
                lokasi: absensi.absensi.lokasi || "",
                latitude: absensi.absensi.latitude || "",
                longitude: absensi.absensi.longitude || "",
                accuracy: absensi.absensi.accuracy || "",
                ipAddress: absensi.absensi.ipAddress || "",
                wifiName: absensi.absensi.namaWifi || "",
                checkinStatus: absensi.absensi.checkinStatus || "",
                checkoutStatus: absensi.absensi.checkoutStatus || "",
              }
            : null
        );
        setWifiName(result.nama_wifi || "");
      } else {
        setIsCheckedIn(false);
        setIsCheckedOut(false);
        setCheckInTime("");
        setCheckOutTime("");
        setAbsenDataFromAPI(null);
        setWifiName("");
        console.log("RESET STATE: isCheckedIn", false, "isCheckedOut", false);
      }
    } finally {
      setIsLoadingAbsenStatus(false);
    }
  };

  useEffect(() => {
    checkTodayAbsensiStatus();
  }, []);

  // Handler setelah check-in
  const handleCheckIn = async (absenData: AbsenData) => {
    setLoading(true);
    try {
      const res = await fetch("/api/absensi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          type: "checkin",
          jamDatang: absenData.jamDatang,
          jamKeluar: absenData.jamKeluar || "",
          tanggal: absenData.tanggal,
          latitude: absenData.latitude,
          longitude: absenData.longitude,
          accuracy: absenData.accuracy,
          lokasi: absenData.lokasi,
          ipAddress: absenData.ipAddress,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        alert(result.error || "Gagal check-in");
        return;
      }

      await checkTodayAbsensiStatus();
    } finally {
      setLoading(false);
    }
  };

  // Handler setelah check-out
  const handleCheckOut = async (absenData: AbsenData) => {
    if (!laporanComplete) {
      setShowLaporanAlert(true);
      return;
    }
    setLoading(true);
    try {
      // Kirim request checkout ke API
      const res = await fetch("/api/absensi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          type: "checkout",
          latitude: absenData.latitude,
          longitude: absenData.longitude,
          accuracy: absenData.accuracy,
          laporanHarian: laporanRef?.current?.getLaporan() || "",
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        alert(result.error || "Gagal check-out");
        return;
      }
      // Setelah sukses, refetch status absensi
      await checkTodayAbsensiStatus();
    } finally {
      setLoading(false);
    }
  };

  const handleLaporanContentChange = (hasContent: boolean): void => {
    setLaporanComplete(hasContent);
  };

  const formatToHourMinute = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <SidebarProvider className="font-montserrat bg-neutral-100">
      <AppSidebarUser />
      <main className="flex-1 p-6">
        <div className="flex items-center gap-3 mb-6">
          <SidebarTrigger />
          <AppBreadcrumb />
        </div>

        <div className="mt-4 space-y-6 ">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Absensi Hari Ini
            </h1>
            <div className="flex items-start gap-3 p-4 bg-amber-100 border border-amber-200 rounded-lg">
              <AlertCircle className="text-amber-700 mt-0.5 flex-shrink-0 md:size-6 size-4" />
              <p className="md:text-sm text-amber-700 text-xs">
                Absensi hanya dapat dilakukan melalui jaringan WiFi kantor. Jika
                menggunakan jaringan luar (seperti Telkomsel, Indosat, atau
                provider lain), maka absensi tidak akan tercatat
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            <div className="w-full h-full">
              {isLoadingAbsenStatus ? (
                <div className="bg-white rounded-lg shadow p-6">
                  <Skeleton className="h-8 w-1/2 mb-4" />
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-10 w-full mb-2" />
                  <Skeleton className="h-10 w-full mb-2" />
                  <Skeleton className="h-12 w-full mt-4" />
                </div>
              ) : (
                <AbsenCard
                  key={isCheckedIn + "-" + isCheckedOut}
                  onCheckIn={handleCheckIn}
                  onCheckOut={handleCheckOut}
                  isCheckedIn={isCheckedIn}
                  isCheckedOut={isCheckedOut}
                  checkInTime={checkInTime}
                  laporanRef={laporanRef}
                  laporanComplete={laporanComplete}
                  loading={loading}
                />
              )}
            </div>

            {!isLoadingAbsenStatus && isCheckedIn && (
              <div className="w-full h-full">
                <StatusAbsen
                  absenData={absenDataFromAPI}
                  visible={!!absenDataFromAPI}
                  checkOutTime={checkOutTime}
                  isCheckedOut={isCheckedOut}
                />
              </div>
            )}

            {!isLoadingAbsenStatus && !isCheckedIn && (
              <div className="w-full bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center min-h-[500px] flex flex-col justify-center">
                <p className="text-navy-500 text-3xl font-bold mb-2">
                  📋 Status Absensi
                </p>
                <p className="text-neutral-500 text-sm">
                  Status akan muncul setelah Anda melakukan check in
                </p>
              </div>
            )}
          </div>

          {!isLoadingAbsenStatus && isCheckedIn && !isCheckedOut && (
            <div className="space-y-4">
              <LaporanHarian
                ref={laporanRef}
                onContentChange={handleLaporanContentChange}
              />
            </div>
          )}

          {!isLoadingAbsenStatus && isCheckedOut && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <h3 className="text-green-800 font-semibold md:text-lg text-base mb-2">
                🎉 Absensi Hari Ini Selesai!
              </h3>
              <p className="text-green-700 md:text-sm text-xs">
                Terima kasih telah menyelesaikan absensi dan laporan harian.
                Semoga hari Anda menyenangkan!
              </p>
            </div>
          )}
        </div>

        <AlertDialog open={showLaporanAlert} onOpenChange={setShowLaporanAlert}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Laporan Harian Belum Diisi</AlertDialogTitle>
              <AlertDialogDescription>
                Silakan isi laporan harian terlebih dahulu sebelum melakukan
                check-out.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setShowLaporanAlert(false)}>
                Oke
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </SidebarProvider>
  );
};

export default AbsenToday;
