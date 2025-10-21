"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebarAdmin from "./app-sidebarAdmin";
import AppBreadcrumb from "../ui/AppBreadcrumb";
import { RangeDatePicker } from "@/components/ui/rangeDatePicker";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker";
import { useState, useEffect } from "react";
import { subDays } from "date-fns";
import { DataTableAbsensiAdmin } from "../ui/dataTableAbsensiAdmin";
import { getColumnsAbsensiAdmin } from "@/components/ui/columsTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { AbsensiAdminData } from "@/components/ui/columsTable";

const DEFAULT_RANGE = {
  from: subDays(new Date(), 6),
  to: new Date(),
};

const AbsensiAnggota = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    DEFAULT_RANGE
  );
  const [data, setData] = useState<AbsensiAdminData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [laporanOpen, setLaporanOpen] = useState(false);
  const [selectedLaporan, setSelectedLaporan] = useState<string | null>(null);

  useEffect(() => {
    fetchAbsensiData(dateRange?.from, dateRange?.to);
  }, [dateRange]);

  const fetchAbsensiData = async (startDate?: Date, endDate?: Date) => {
    setLoading(true);
    try {
      let url = `/api/absensi/riwayat-admin`;
      if (startDate && endDate) {
        url += `?startDate=${startDate
          .toISOString()
          .slice(0, 10)}&endDate=${endDate.toISOString().slice(0, 10)}`;
      }
      const response = await fetch(url);
      const result = await response.json();

      if (response.ok && Array.isArray(result)) {
        setData(result);
      } else if (response.ok && result.success && Array.isArray(result.data)) {
        setData(result.data);
      } else {
        setData([]);
      }
    } catch (error) {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
  };

  const handleResetFilter = () => {
    setDateRange(DEFAULT_RANGE);
  };

  const handleOpenLaporan = (laporan: string | null) => {
    setSelectedLaporan(laporan);
    setLaporanOpen(true);
  };

  return (
    <SidebarProvider className="font-montserrat bg-neutral-100">
      <AppSidebarAdmin />
      <main className="flex-1 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <SidebarTrigger />
          <AppBreadcrumb />
        </div>
        {/* Header */}
        <div className="mt-0 w-full ">
          <h1 className="md:text-3xl text-2xl font-bold mb-2 md:mb-4">
            Riwayat Absensi
          </h1>
          <p className="md:text-base text-sm text-gray-600 flex">
            Lihat riwayat kehadiran anggota dengan filter tanggal
          </p>
        </div>

        {/* Filter Section */}
        <div className="mt-6 flex flex-col md:flex-col gap-4 md:p-4 p-2 bg-white rounded-lg border">
          <Label className="md:text-base text-sm font-medium ">
            Cari Riwayat Absensi dengan rentang tanggal
          </Label>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
            <RangeDatePicker
              onDateChange={handleDateRangeChange}
              selectedRange={dateRange}
              className="md:text-sm text-xs"
            />
            <Button
              variant="default"
              onClick={handleResetFilter}
              className="md:px-4 md:py-2 px-2 py-1 bg-red-200 md:text-sm text-xs color-white hover:bg-red-400"
            >
              Reset Filter
            </Button>
          </div>
        </div>
        <div className="mt-6 w-full">
          <DataTableAbsensiAdmin
            columns={getColumnsAbsensiAdmin(handleOpenLaporan)}
            data={data}
            loading={loading}
          />
        </div>
      </main>

      {/* Dialog laporan harian */}
      <Dialog open={laporanOpen} onOpenChange={setLaporanOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Laporan Harian</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            {selectedLaporan ? (
              <div className="whitespace-pre-wrap text-sm text-gray-800">
                {selectedLaporan}
              </div>
            ) : (
              <div className="text-sm text-gray-500">Tidak ada laporan.</div>
            )}
          </DialogDescription>
          <DialogFooter>
            <button
              onClick={() => setLaporanOpen(false)}
              className="px-3 py-1 rounded bg-navy-600 text-white"
            >
              Tutup
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default AbsensiAnggota;
