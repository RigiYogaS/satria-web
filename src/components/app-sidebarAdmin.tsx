"use client";

import {
  Home,
  Users,
  Settings,
  FileBarChart,
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

const AppSidebarAdmin = () => {
  const [managementOpen, setManagementOpen] = useState(false);
  const [laporanOpen, setLaporanOpen] = useState(false);

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
                    href="/admin/dashboard"
                    className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center"
                  >
                    <Home />
                    <span className="group-data-[collapsible=icon]:hidden">
                      Dashboard
                    </span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Management dengan dropdown */}
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
                          Management
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
                          href="/admin/users"
                          className="text-navy-600 hover:text-navy-800 text-sm"
                        >
                          <span>User Management</span>
                        </a>
                      </SidebarMenuButton>
                      <SidebarMenuButton asChild size="sm">
                        <a
                          href="/admin/approval"
                          className="text-navy-600 hover:text-navy-800 text-sm"
                        >
                          <span>Approval Cuti</span>
                        </a>
                      </SidebarMenuButton>
                    </div>
                  </Collapsible.Content>
                </Collapsible.Root>
              </SidebarMenuItem>

              {/* Laporan dengan dropdown */}
              <SidebarMenuItem>
                <Collapsible.Root
                  open={laporanOpen}
                  onOpenChange={setLaporanOpen}
                >
                  <Collapsible.Trigger asChild>
                    <SidebarMenuButton
                      className={`w-full group-data-[collapsible=icon]:justify-center transition-colors ${
                        laporanOpen
                          ? "text-neutral-500 hover:text-neutral-600"
                          : "text-navy-700 hover:text-navy-900"
                      }`}
                      tooltip="Laporan"
                    >
                      <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
                        <FileBarChart />
                        <span className="group-data-[collapsible=icon]:hidden">
                          Laporan
                        </span>
                      </div>
                      <span className="group-data-[collapsible=icon]:hidden">
                        {laporanOpen ? <ChevronDown /> : <ChevronRight />}
                      </span>
                    </SidebarMenuButton>
                  </Collapsible.Trigger>
                  <Collapsible.Content className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down group-data-[collapsible=icon]:hidden">
                    <div className="ml-6 mt-1 space-y-1">
                      <SidebarMenuButton asChild size="sm">
                        <a
                          href="/admin/laporan/absensi"
                          className="text-navy-600 hover:text-navy-800 text-sm"
                        >
                          <span>Laporan Absensi</span>
                        </a>
                      </SidebarMenuButton>
                      <SidebarMenuButton asChild size="sm">
                        <a
                          href="/admin/laporan/kinerja"
                          className="text-navy-600 hover:text-navy-800 text-sm"
                        >
                          <span>Laporan Kinerja</span>
                        </a>
                      </SidebarMenuButton>
                    </div>
                  </Collapsible.Content>
                </Collapsible.Root>
              </SidebarMenuItem>

              {/* Settings */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="w-full text-navy-700 hover:text-navy-900 group-data-[collapsible=icon]:justify-center"
                  tooltip="Settings"
                >
                  <a
                    href="/admin/settings"
                    className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center"
                  >
                    <Settings />
                    <span className="group-data-[collapsible=icon]:hidden">
                      Settings
                    </span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebarAdmin;
