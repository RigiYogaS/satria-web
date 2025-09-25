"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "./ui/button";
import Link from "next/link";
import AppSidebarUser from "./app-sidebarUser";
import AppBreadcrumb from "./AppBreadcrumb";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface User {
  id_user: number;
  nama: string;
}

const DashboardUser = () => {
  const { data: session, status } = useSession();

  const router = useRouter();

  useEffect(() => {
    console.log("Session:", session, "Status:", status);
    console.log("DashboardUser rendered, session:", session, "status:", status);
  }, [session, status]);

  if (status === "unauthenticated") {
    console.log("Redirecting to login, session:", session);
    router.push("/auth/login");
    return null;
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-navy-500"></div>
      </div>
    );
  }

  if (!session?.user) {
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
          <h1 className="text-3xl font-bold">
            Selamat datang {session.user.name}!
          </h1>
          <p className="my-3">
            Jangan lupa melakukan absensi dan upload laporan mingguanmu
          </p>
          <Button asChild className="bg-navy-200 hover:bg-navy-400 mt-2">
            <Link href={"/user-routing/absensi/hari-ini"}>Absen Disini</Link>
          </Button>
        </div>
      </main>
    </SidebarProvider>
  );
};

export default DashboardUser;
