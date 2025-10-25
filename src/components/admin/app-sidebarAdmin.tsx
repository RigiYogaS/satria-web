"use client";

import {
  Home,
  Users,
  Settings,
  FileBarChart,
  ChevronDown,
  ChevronRight,
  LogOut,
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
  SidebarFooter,
} from "@/components/ui/sidebar";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

const AppSidebarAdmin = () => {
  const { user, logout } = useAuth();
  const [managementOpen, setManagementOpen] = useState(false);
  const [kelolaOpen, setKelolaOpen] = useState(false);

  return (
    <Sidebar
      className="font-montserrat [&_svg]:!w-5 [&_svg]:!h-5 [&_svg]:!stroke-[1.5]"
      collapsible="icon"
    >
      <SidebarContent>
        <SidebarGroup>
          {/* LOGO */}
          <div className="flex w-full justify-center items-center text-3xl font-bold gap-2 my-4 text-navy-600 px-2 h-8">
            <Image src="/logo/divhub.png" alt="Logo" width={40} height={40} />
            <span className="group-data-[collapsible=icon]:hidden">SATRIA</span>
          </div>
          {/* ISI SIDEBAR ADMIN */}
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
                    href="/admin-routing/dashboardAdmin"
                    className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center"
                  >
                    <Home />
                    <span className="group-data-[collapsible=icon]:hidden">
                      Beranda
                    </span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Anggota dengan dropdown */}
              <SidebarMenuItem>
                <Collapsible.Root
                  open={managementOpen}
                  onOpenChange={setManagementOpen}
                >
                  <Collapsible.Trigger asChild>
                    <SidebarMenuButton
                      className={`w-full group-data-[collapsible=icon]:justify-center transition-colors ${
                        managementOpen
                          ? "text-neutral-500 hover:text-neutral-600"
                          : "text-navy-700 hover:text-navy-900"
                      }`}
                      tooltip="Management"
                    >
                      <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
                        <Users />
                        <span className="group-data-[collapsible=icon]:hidden">
                          Anggota
                        </span>
                      </div>
                      <span className="group-data-[collapsible=icon]:hidden">
                        {managementOpen ? <ChevronDown /> : <ChevronRight />}
                      </span>
                    </SidebarMenuButton>
                  </Collapsible.Trigger>
                  <Collapsible.Content className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down group-data-[collapsible=icon]:hidden">
                    <div className="ml-6 mt-1 space-y-1">
                      <SidebarMenuButton asChild size="sm">
                        <a
                          href="/admin-routing/anggota/daftar-anggota"
                          className="text-navy-600 hover:text-navy-800 text-sm"
                        >
                          <span>Daftar Anggota</span>
                        </a>
                      </SidebarMenuButton>
                      <SidebarMenuButton asChild size="sm">
                        <a
                          href="/admin-routing/anggota/absensi-anggota"
                          className="text-navy-600 hover:text-navy-800 text-sm"
                        >
                          <span>Absensi Anggota</span>
                        </a>
                      </SidebarMenuButton>
                      <SidebarMenuButton asChild size="sm">
                        <a
                          href="/admin-routing/anggota/laporan-mingguan"
                          className="text-navy-600 hover:text-navy-800 text-sm"
                        >
                          <span>Laporan Mingguan</span>
                        </a>
                      </SidebarMenuButton>
                    </div>
                  </Collapsible.Content>
                </Collapsible.Root>
              </SidebarMenuItem>

              {/* Daftar Cuti */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="w-full text-navy-700 hover:text-navy-900 group-data-[collapsible=icon]:justify-center"
                  tooltip="Daftar Cuti"
                >
                  <a
                    href="/admin-routing/cuti"
                    className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center"
                  >
                    <FileBarChart />
                    <span className="group-data-[collapsible=icon]:hidden">
                      Daftar Cuti
                    </span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Kelola dengan dropdown */}
              <SidebarMenuItem>
                <Collapsible.Root
                  open={kelolaOpen}
                  onOpenChange={setKelolaOpen}
                >
                  <Collapsible.Trigger asChild>
                    <SidebarMenuButton
                      className={`w-full group-data-[collapsible=icon]:justify-center transition-colors ${
                        kelolaOpen
                          ? "text-neutral-500 hover:text-neutral-600"
                          : "text-navy-700 hover:text-navy-900"
                      }`}
                      tooltip="Kelola"
                    >
                      <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
                        <Settings />
                        <span className="group-data-[collapsible=icon]:hidden">
                          Kelola
                        </span>
                      </div>
                      <span className="group-data-[collapsible=icon]:hidden">
                        {kelolaOpen ? <ChevronDown /> : <ChevronRight />}
                      </span>
                    </SidebarMenuButton>
                  </Collapsible.Trigger>
                  <Collapsible.Content className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down group-data-[collapsible=icon]:hidden">
                    <div className="ml-6 mt-1 space-y-1">
                      <SidebarMenuButton asChild size="sm">
                        <a
                          href="/admin-routing/kelola/data-admin"
                          className="text-navy-600 hover:text-navy-800 text-sm rounded"
                        >
                          <span>Data Admin</span>
                        </a>
                      </SidebarMenuButton>
                      <SidebarMenuButton asChild size="sm">
                        <a
                          href="/admin-routing/kelola/ip-lokasi"
                          className="text-navy-600 hover:text-navy-800 text-sm"
                        >
                          <span>Jaringan</span>
                        </a>
                      </SidebarMenuButton>
                      <SidebarMenuButton asChild size="sm">
                        <a
                          href="/admin-routing/kelola/bagian"
                          className="text-navy-600 hover:text-navy-800 text-sm"
                        >
                          <span>Bagian</span>
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

export default AppSidebarAdmin;
