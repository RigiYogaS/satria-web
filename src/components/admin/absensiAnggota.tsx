"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebarAdmin from "./app-sidebarAdmin";
import AppBreadcrumb from "../AppBreadcrumb";

const AbsensiAnggota = () => {
  return (
    <SidebarProvider className="font-montserrat bg-neutral-100">
      <AppSidebarAdmin />
      <main className="flex-1 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <SidebarTrigger />
          <AppBreadcrumb />
        </div>
        <h1 className="text-2xl font-bold text-navy-600 mb-4">
          Absensi Anggota
        </h1>
      </main>
    </SidebarProvider>
  );
};

export default AbsensiAnggota;
