"use client";

import { SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import { Button } from "./ui/button";
import Link from "next/link";
import AppSidebarUser from "./app-sidebarUser";
import AppBreadcrumb from "./AppBreadcrumb";

const DashboardUser = () => {
  return (
    <SidebarProvider className="font-montserrat">
      <AppSidebarUser />
      <main className="flex-1 p-6">
        <div className="flex items-center gap-3 mb-6">
          <SidebarTrigger />
          <AppBreadcrumb />
        </div>
        <div className="mt-4">
          <h1 className="text-3xl font-bold">Selamat datang NAMA</h1>
          <p className="my-3">Jangan lupa melakukan absensi dan upload laporan mingguanmu</p>
         <Button 
            asChild
            className="bg-navy-200 hover:bg-navy-400 mt-2"
            >
            <Link href={"/AbsenToday"}>Absen Disini</Link>
          </Button>
        </div>
      </main>
    </SidebarProvider>
  );
};

export default DashboardUser;
