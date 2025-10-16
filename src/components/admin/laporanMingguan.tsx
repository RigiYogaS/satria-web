"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebarAdmin from "./app-sidebarAdmin";
import AppBreadcrumb from "../AppBreadcrumb";
import { RangeDatePicker } from "@/components/ui/rangeDatePicker";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker";
import { useState } from "react";
import { subDays } from "date-fns";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon } from "lucide-react";

const LaporanMingguan = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
  const [search, setSearch] = useState("");

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
  };

  const handleResetFilter = () => {
    setDateRange({
      from: subDays(new Date(), 7),
      to: new Date(),
    });
  };

  return (
    <SidebarProvider className="font-montserrat bg-neutral-100">
      <AppSidebarAdmin />
      <main className="flex-1 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <SidebarTrigger />
          <AppBreadcrumb />
        </div>
        <div className="mt-0 w-full ">
          <h1 className="md:text-3xl text-2xl text-neutral-800 font-bold mb-2 md:mb-4">
            Laporan Mingguan
          </h1>
          <p className="md:text-base text-sm text-gray-600 flex">
            Unduh dokumen dengan tombol dibawah ini
          </p>
        </div>

        <div className="mt-6 flex flex-col md:flex-row md:items-end gap-4 md:p-4 p-2 bg-white rounded-lg border">
          {/* Bagian Filter Tanggal */}
          <div className="flex flex-col gap-2 md:w-1/2 w-full">
            <Label className="md:text-base text-sm font-medium">
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
                className="md:px-4 md:py-2 px-2 py-1 bg-red-200 md:text-sm text-xs text-white hover:bg-red-400"
              >
                Reset Filter
              </Button>
            </div>
          </div>

          {/* Bagian Search */}
          <div className="flex flex-col gap-2 md:w-1/2 w-full">
            <div className="relative w-full">
              <Input
                id="search"
                type="search"
                placeholder="Cari Laporan..."
                className="w-full pl-4 pr-10 text-sm bg-white border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
};

export default LaporanMingguan;
