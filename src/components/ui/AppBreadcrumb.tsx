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
      return [{ label: "Beranda", isActive: true }];
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
      return [{ label: "Beranda", isActive: true }];
    }

    // Admin paths
    if (path.startsWith("/admin-routing/dashboardAdmin")) {
      return [{ label: "Beranda", isActive: true }];
    }

    if (path.startsWith("/admin-routing/anggota/daftar-anggota")) {
      return [
        { label: "Anggota", href: "/admin-routing/anggota/daftar-anggota" },
        { label: "Daftar Anggota", isActive: true },
      ];
    }

    if (path.startsWith("/admin-routing/anggota/absensi-anggota")) {
      return [
        { label: "Anggota", href: "/admin-routing/anggota/daftar-anggota" },
        { label: "Absensi Anggota", isActive: true },
      ];
    }

    if (path.startsWith("/admin-routing/anggota/laporan-mingguan")) {
      return [
        { label: "Anggota", href: "/admin-routing/anggota/daftar-anggota" },
        { label: "Laporan Mingguan", isActive: true },
      ];
    }

    if (path.startsWith("/admin-routing/cuti")) {
      return [{ label: "Daftar Cuti", isActive: true }];
    }

    if (path.startsWith("/admin-routing/kelola/data-admin")) {
      return [
        { label: "Kelola", href: "/admin-routing/kelola/data-admin" },
        { label: "Data Admin", isActive: true },
      ];
    }

    if (path.startsWith("/admin-routing/kelola/ip-lokasi")) {
      return [
        { label: "Kelola", href: "/admin-routing/kelola/data-admin" },
        { label: "IP dan Lokasi", isActive: true },
      ];
    }

    if (path.startsWith("/admin-routing/kelola/bagian")) {
      return [
        { label: "Kelola", href: "/admin-routing/kelola/data-admin" },
        { label: "Bagian", isActive: true },
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
