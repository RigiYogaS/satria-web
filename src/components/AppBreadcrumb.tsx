"use client";

import React from "react";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface BreadcrumbItemType {
  label: string;
  href?: string;
  isActive?: boolean;
}

const AppBreadcrumb = () => {
  const pathname = usePathname();

  // Mapping path ke breadcrumb items
  const getBreadcrumbItems = (path: string): BreadcrumbItemType[] => {
    if (path === "/dashboard" || path === "/") {
      return [{ label: "Dashboard", isActive: true }];
    }

    if (path.startsWith("/user-routing/absensi/hari-ini")) {
      return [
        { label: "Absensi", href: "/user-routing/absensi" },
        { label: "Absensi Hari Ini", isActive: true },
      ];
    }

    if (path.startsWith("/user-routing/absensi/riwayat")) {
      return [
        { label: "Absensi", href: "/user-routing/absensi" },
        { label: "Riwayat Absensi", isActive: true },
      ];
    }

    if (path.startsWith("/user-routing/cuti/pengajuan")) {
      return [
        { label: "Cuti", href: "/user-routing/cuti" },
        { label: "Pengajuan Cuti", isActive: true },
      ];
    }

    if (path.startsWith("/user-routing/cuti/riwayat")) {
      return [
        { label: "Cuti", href: "/user-routing/cuti" },
        { label: "Riwayat Cuti", isActive: true },
      ];
    }

    if (path.startsWith("/user-routing/laporan")) {
      return [{ label: "Laporan Mingguan", isActive: true }];
    }

    if (path.startsWith("/user-routing/dashboardUser")) {
      return [{ label: "Dashboard", isActive: true }];
    }

    // Admin paths
    if (path.startsWith("/admin/dashboard")) {
      return [{ label: "Dashboard", isActive: true }];
    }

    if (path.startsWith("/admin/users")) {
      return [
        { label: "Management", href: "/admin/management" },
        { label: "User Management", isActive: true },
      ];
    }

    if (path.startsWith("/admin/approval")) {
      return [
        { label: "Management", href: "/admin/management" },
        { label: "Approval Cuti", isActive: true },
      ];
    }

    if (path.startsWith("/admin/laporan/absensi")) {
      return [
        { label: "Laporan", href: "/admin/laporan" },
        { label: "Laporan Absensi", isActive: true },
      ];
    }

    if (path.startsWith("/admin/laporan/kinerja")) {
      return [
        { label: "Laporan", href: "/admin/laporan" },
        { label: "Laporan Kinerja", isActive: true },
      ];
    }

    // Default fallback
    return [{ label: "Dashboard", isActive: true }];
  };

  const items = getBreadcrumbItems(pathname);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <BreadcrumbItem>
              {item.isActive ? (
                <BreadcrumbPage className="text-neutral-800 font-medium">
                  {item.label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink
                  href={item.href}
                  className="text-neutral-500 hover:text-neutral-700"
                >
                  {item.label}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < items.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default AppBreadcrumb;
