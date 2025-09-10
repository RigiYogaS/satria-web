"use client";

import { AlertCircle } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebarUser from "@/components/app-sidebarUser";
import AppBreadcrumb from "@/components/AppBreadcrumb";
import AbsenCard from "./ui/absenCard";
import StatusAbsen from "./ui/statusAbsen";
import LaporanHarian, { LaporanHarianHandle } from "./ui/laporanHarian";
import { useState, useRef, RefObject } from "react";

interface AbsenData {
  jamDatang: string;
  tanggal: string;
  lokasi: string;
  latitude: number;
  longitude: number;
  accuracy: number;
}

const AbsenToday = () => {
  const [isCheckedIn, setIsCheckedIn] = useState<boolean>(false);
  const [isCheckedOut, setIsCheckedOut] = useState<boolean>(false);
  const [checkInTime, setCheckInTime] = useState<string>("");
  const [checkOutTime, setCheckOutTime] = useState<string>("");

  const statusAbsenRef = useRef<{
    triggerCheckIn: (data: AbsenData) => void;
    triggerCheckOut: (data: AbsenData) => void;
  }>(null);

  const laporanRef = useRef<LaporanHarianHandle>(null) as React.RefObject<LaporanHarianHandle>;

  const handleCheckIn = (absenData: AbsenData): void => {
    setIsCheckedIn(true);
    setCheckInTime(absenData.jamDatang);

    setTimeout(() => {
      if (statusAbsenRef.current) {
        statusAbsenRef.current.triggerCheckIn(absenData);
      }
    }, 100);
  };

  const handleCheckOut = (absenData: AbsenData): void => {
    // Validate laporan before checkout
    if (!laporanRef.current?.hasContent()) {
      alert("❌ Laporan harian harus diisi sebelum check out!");
      return;
    }

    const laporanContent = laporanRef.current.getLaporan();
    console.log("📝 Laporan Harian:", laporanContent);

    setIsCheckedOut(true);
    setCheckOutTime(absenData.jamDatang);

    setTimeout(() => {
      if (statusAbsenRef.current) {
        statusAbsenRef.current.triggerCheckOut(absenData);
      }
    }, 100);
  };

  return (
    <SidebarProvider className="font-montserrat">
      <AppSidebarUser />
      <main className="flex-1 p-6">
        <div className="flex items-center gap-3 mb-6">
          <SidebarTrigger />
          <AppBreadcrumb />
        </div>
        <div className="mt-4 space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Absensi Hari Ini</h1>
            <div className="flex items-start gap-3 p-4 bg-amber-100 border border-amber-200 rounded-lg">
              <AlertCircle
                className="text-amber-700 mt-0.5 flex-shrink-0"
                size={20}
              />
              <p className="text-sm text-amber-700">
                Absensi hanya dapat dilakukan melalui jaringan WiFi kantor. Jika
                menggunakan jaringan luar (seperti Telkomsel, Indosat, atau
                provider lain), maka absensi tidak akan tercatat
              </p>
            </div>
          </div>

          {/* Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* AbsenCard - Always show */}
            <div className="w-full">
              <AbsenCard
                onCheckIn={handleCheckIn}
                onCheckOut={handleCheckOut}
                isCheckedIn={isCheckedIn}
                isCheckedOut={isCheckedOut}
                checkInTime={checkInTime}
              />
            </div>

            {/* StatusAbsen - Show after check in */}
            {isCheckedIn && (
              <div className="w-full">
                <StatusAbsen
                  ref={statusAbsenRef}
                  checkOutTime={checkOutTime}
                  isCheckedOut={isCheckedOut}
                />
              </div>
            )}

            {/* Sebelum Checkin */}
            {!isCheckedIn && (
              <div className="w-full bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center h-full flex flex-col justify-center">
                <p className="text-navy-500 text-3xl font-bold mb-2">
                  📋 Status Absensi
                </p>
                <p className="text-neutral-500 text-sm">
                  Status akan muncul setelah Anda melakukan check in
                </p>
              </div>
            )}
          </div>

          {/* Laporan Harian - Show after check in */}
          {isCheckedIn && !isCheckedOut && <LaporanHarian ref={laporanRef} />}

          {/* Completion Message */}
          {isCheckedOut && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <h3 className="text-green-800 font-semibold text-lg mb-2">
                🎉 Absensi Hari Ini Selesai!
              </h3>
              <p className="text-green-700 text-sm">
                Terima kasih telah menyelesaikan absensi dan laporan harian.
                Semoga hari Anda menyenangkan!
              </p>
            </div>
          )}
        </div>
      </main>
    </SidebarProvider>
  );
};

export default AbsenToday;
