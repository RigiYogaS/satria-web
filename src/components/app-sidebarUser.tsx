"use client";

import {
  Calendar,
  Home,
  Files,
  Clock7,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import * as Collapsible from "@radix-ui/react-collapsible";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import Image from "next/image";

import { useState } from "react";

const AppSidebarUser = () => {
  const [absensiOpen, setAbsensiOpen] = useState(false);
  const [cutiOpen, setCutiOpen] = useState(false);
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
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Dashboard */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="w-full text-navy-700 hover:text-navy-900 group-data-[collapsible=icon]:justify-center"
                  tooltip="Dashboard"
                >
                  <a
                    href="/user/dashboard"
                    className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center"
                  >
                    <Home />
                    <span className="group-data-[collapsible=icon]:hidden">
                      Dashboard
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
                      className={`w-full group-data-[collapsible=icon]:justify-center transition-colors ${
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
                          href="/user/absensi/hari-ini"
                          className="text-navy-600 hover:text-navy-800 text-sm"
                        >
                          <span>Absensi Hari Ini</span>
                        </a>
                      </SidebarMenuButton>
                      <SidebarMenuButton asChild size="sm">
                        <a
                          href="/user/absensi/riwayat"
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
                    href="/user/laporan"
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
                          href="/user/cuti/pengajuan"
                          className="text-navy-600 hover:text-navy-800 text-sm"
                        >
                          <span>Pengajuan Cuti</span>
                        </a>
                      </SidebarMenuButton>
                      <SidebarMenuButton asChild size="sm">
                        <a
                          href="/user/cuti/riwayat"
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
    </Sidebar>
  );
};

export default AppSidebarUser;
