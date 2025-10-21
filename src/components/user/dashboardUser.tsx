"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "../ui/button";
import Link from "next/link";
import AppSidebarUser from "./app-sidebarUser";
import AppBreadcrumb from "../ui/AppBreadcrumb";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";

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

  // Tunggu loading selesai baru check authentication
  useEffect(() => {
    if (status === "unauthenticated") {
      console.log("Redirecting to login, session:", session);
      router.push("/auth-routing/login");
    }
  }, [status, router]);

  // Show loading spinner while checking authentication
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-navy-500"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
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
    <SidebarProvider className="font-montserrat bg-neutral-100">
      <AppSidebarUser />
      <main className="flex-1 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <SidebarTrigger />
          <AppBreadcrumb />
        </div>

        {/* Content Section */}
        <div className="flex flex-col items-center justify-center text-center flex-1 relative">
          {/* Text Content */}
          <div className="mb-8 z-10 absolute ">
            <h1 className="md:text-4xl text-navy-600 text-2xl font-bold mb-4 text-shadow-md">
              Selamat datang {session.user.name}!
            </h1>
            <p className="my-3 md:text-base text-sm mb-6 text-shadow-md">
              Jangan lupa melakukan absensi dan upload laporan mingguanmu
            </p>
            <Button asChild className="bg-navy-200 hover:bg-navy-400 shadow-md">
              <Link href={"/user-routing/absensi/hari-ini"}>Absen Disini</Link>
            </Button>
          </div>

          {/* Image Section */}
          <div className="w-full max-w-4xl mx-auto">
            <Image
              src="/img/continent.png"
              alt="Hero"
              width={900}
              height={600}
              className="w-full h-auto opacity-40"
              priority
            />
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
};

export default DashboardUser;
