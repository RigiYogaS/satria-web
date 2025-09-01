"use client";

import { AlertCircle } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebarUser from "@/components/app-sidebarUser";
import AppBreadcrumb from "@/components/AppBreadcrumb";
import AbsenCard from "./ui/absenCard";
import StatusAbsen from "./ui/statusAbsen";
import { useState, useRef } from "react";

const AbsenToday = () => {
  const [hasCheckedIn, setHasCheckedIn] = useState<boolean>(false);
  const statusAbsenRef = useRef<{ triggerCheckIn: () => void }>(null);

  const handleCheckIn = (): void => {
    setHasCheckedIn(true);
    // Trigger check-in di StatusAbsen component
    if (statusAbsenRef.current) {
      statusAbsenRef.current.triggerCheckIn();
    }
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

          {/* Form Absensi - Area untuk Anda kembangkan */}
          {!hasCheckedIn && <AbsenCard onCheckIn={handleCheckIn} />}

          {/* Status Absensi */}
          {hasCheckedIn && <StatusAbsen ref={statusAbsenRef} />}
        </div>
      </main>
    </SidebarProvider>
  );
};

export default AbsenToday;
