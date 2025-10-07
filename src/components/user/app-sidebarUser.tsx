"use client";

import {
  Calendar,
  Home,
  Files,
  Clock7,
  ChevronDown,
  ChevronRight,
  LogOut,
} from "lucide-react";
import * as Collapsible from "@radix-ui/react-collapsible";
import { useEffect, useState } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";

import Image from "next/image";

import { useAuth } from "@/hooks/useAuth";

import { Button } from "../ui/button";

const AppSidebarUser = () => {
  const { user, logout } = useAuth();
  const [absensiOpen, setAbsensiOpen] = useState(false);
  const [cutiOpen, setCutiOpen] = useState(false);

  useEffect(() => {
    console.log("SidebarProvider rendered");
  }, []);

  return (
    <Sidebar
      className="font-montserrat [&_svg]:!w-5 [&_svg]:!h-5 [&_svg]:!stroke-[1.5] group-data-[collapsible=icon]:[&_[data-sidebar=menu-button]]:justify-center"
      collapsible="icon"
    >
      <SidebarContent>
        <SidebarGroup>
          {/* LOGO */}
          <div className="flex w-full justify-center items-center text-3xl font-bold gap-2 my-4 text-navy-600 px-2 h-8">
            <Image src="/logo/divhub.png" alt="Logo" width={40} height={40} />
            <span className="group-data-[collapsible=icon]:hidden">SATRIA</span>
          </div>

          {/* ISI SIDEBAR */}
          <SidebarGroupContent className="mt-3 ">
            <SidebarMenu>
              {/* Dashboard */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="w-full text-navy-700 hover:text-navy-900 group-data-[collapsible=icon]:justify-center"
                  tooltip="Dashboard"
                >
                  <a
                    href="/user-routing/dashboardUser"
                    className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center"
                  >
                    <Home />
                    <span className="group-data-[collapsible=icon]:hidden">
                      Beranda
                    </span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Absensi dengan dropdown */}
              <SidebarMenuItem>
                <Collapsible.Root
                  open={absensiOpen}
                  onOpenChange={setAbsensiOpen}
                >
                  <Collapsible.Trigger asChild>
                    <SidebarMenuButton
                      className={`w-2/3 group-data-[collapsible=icon]:justify-center transition-colors ${
                        absensiOpen
                          ? "text-neutral-500 hover:text-neutral-600"
                          : "text-navy-700 hover:text-navy-900"
                      }`}
                      tooltip="Absensi"
                    >
                      <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
                        <Clock7 />
                        <span className="group-data-[collapsible=icon]:hidden">
                          Absensi
                        </span>
                      </div>
                      <span className="group-data-[collapsible=icon]:hidden">
                        {absensiOpen ? <ChevronDown /> : <ChevronRight />}
                      </span>
                    </SidebarMenuButton>
                  </Collapsible.Trigger>
                  <Collapsible.Content className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down group-data-[collapsible=icon]:hidden">
                    <div className="ml-6 mt-1 space-y-1">
                      <SidebarMenuButton asChild size="sm">
                        <a
                          href="/user-routing/absensi/hari-ini"
                          className="text-navy-600 hover:text-navy-800 text-sm"
                        >
                          <span>Absensi Hari Ini</span>
                        </a>
                      </SidebarMenuButton>
                      <SidebarMenuButton asChild size="sm">
                        <a
                          href="/user-routing/absensi/riwayat"
                          className="text-navy-600 hover:text-navy-800 text-sm"
                        >
                          <span>Riwayat Absensi</span>
                        </a>
                      </SidebarMenuButton>
                    </div>
                  </Collapsible.Content>
                </Collapsible.Root>
              </SidebarMenuItem>

              {/* Laporan Mingguan */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="w-full text-navy-700 hover:text-navy-900 group-data-[collapsible=icon]:justify-center"
                  tooltip="Laporan Mingguan"
                >
                  <a
                    href="/user-routing/laporan"
                    className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center"
                  >
                    <Files />
                    <span className="group-data-[collapsible=icon]:hidden">
                      Laporan Mingguan
                    </span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Cuti dengan dropdown */}
              <SidebarMenuItem>
                <Collapsible.Root open={cutiOpen} onOpenChange={setCutiOpen}>
                  <Collapsible.Trigger asChild>
                    <SidebarMenuButton
                      className={`w-full group-data-[collapsible=icon]:justify-center transition-colors ${
                        cutiOpen
                          ? "text-neutral-500 hover:text-neutral-600"
                          : "text-navy-700 hover:text-navy-900"
                      }`}
                      tooltip="Cuti"
                    >
                      <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
                        <Calendar />
                        <span className="group-data-[collapsible=icon]:hidden">
                          Cuti
                        </span>
                      </div>
                      <span className="group-data-[collapsible=icon]:hidden">
                        {cutiOpen ? <ChevronDown /> : <ChevronRight />}
                      </span>
                    </SidebarMenuButton>
                  </Collapsible.Trigger>
                  <Collapsible.Content className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down group-data-[collapsible=icon]:hidden">
                    <div className="ml-6 mt-1 space-y-1">
                      <SidebarMenuButton asChild size="sm">
                        <a
                          href="/user-routing/cuti/pengajuan"
                          className="text-navy-600 hover:text-navy-800 text-sm"
                        >
                          <span>Pengajuan Cuti</span>
                        </a>
                      </SidebarMenuButton>
                      <SidebarMenuButton asChild size="sm">
                        <a
                          href="/user-routing/cuti/riwayat"
                          className="text-navy-600 hover:text-navy-800 text-sm"
                        >
                          <span>Riwayat Cuti</span>
                        </a>
                      </SidebarMenuButton>
                    </div>
                  </Collapsible.Content>
                </Collapsible.Root>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="flex justify-center">
        <Button
          onClick={logout}
          variant="outline"
          className="w-2/3 flex mx-auto bg-red-200 text-white hover:bg-red-400 hover:text-white"
        >
          <LogOut className="group-data-[collapsible=icon]:block group-data-[collapsible=icon]:w-5 group-data-[collapsible=icon]:h-5 " />
          <span className="group-data-[collapsible=icon]:hidden">Logout</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebarUser;
