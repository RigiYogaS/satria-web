"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "./ui/button";
import Link from "next/link";
import AppSidebarUser from "./app-sidebarUser";
import AppBreadcrumb from "./AppBreadcrumb";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/router";


interface User {
  id_user: number;
  nama: string;
}

const DashboardUser = () => {
  const {user, loading} = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-400 mx-auto mb-4"></div>
          <p>Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <SidebarProvider className="font-montserrat">
      <AppSidebarUser />
      <main className="flex-1 p-6">
        <div className="flex items-center gap-3 mb-6">
          <SidebarTrigger />
          <AppBreadcrumb />
        </div>
        <div className="mt-4">
          <h1 className="text-3xl font-bold">Selamat datang {user.nama}!</h1>
          <p className="my-3">
            Jangan lupa melakukan absensi dan upload laporan mingguanmu
          </p>
          <Button asChild className="bg-navy-200 hover:bg-navy-400 mt-2">
            <Link href={"/user/absensi/hari-ini"}>Absen Disini</Link>
          </Button>
        </div>
      </main>
    </SidebarProvider>
  );
};

export default DashboardUser;
