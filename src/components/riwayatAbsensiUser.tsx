"use client";

import { useState, useEffect } from "react";
import AppBreadcrumb from "@/components/AppBreadcrumb";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebarUser from "@/components/app-sidebarUser";
import { RangeDatePicker } from "./ui/rangeDatePicker";
import { Label } from "@/components/ui/label";
import { DataTableRiwayatAbsen } from "./ui/dataTableRiwayatAbsensi";
import { columns, AbsensiData } from "./ui/columsTable";
import { Button } from "./ui/button";
import { DateRange } from "react-day-picker";
import { useSession } from "next-auth/react";
import { addDays, subDays } from "date-fns";

const DEFAULT_RANGE = {
  from: subDays(new Date(), 6), 
  to: new Date(),
};

const RiwayatAbsensiPage = () => {
  const { data: session } = useSession();
  const [data, setData] = useState<AbsensiData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    DEFAULT_RANGE
  );

  // Fetch data saat session atau dateRange berubah
  useEffect(() => {
    if (session?.user?.id && dateRange?.from && dateRange?.to) {
      fetchAbsensiData(session.user.id, dateRange.from, dateRange.to);
    }
  }, [session, dateRange]);

  const fetchAbsensiData = async (
    userId: string,
    startDate?: Date,
    endDate?: Date
  ) => {
    setLoading(true);
    try {
      let url = `/api/absensi/riwayat-absensi?user_id=${userId}`;
      if (startDate && endDate) {
        url += `&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
      }

      const response = await fetch(url);
      const result = await response.json();

      if (response.ok && result.success) {
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

  return (
    <SidebarProvider className="font-montserrat">
      <AppSidebarUser />
      <main className="flex-1 p-6">
        <div className="flex items-center gap-3 mb-6">
          <SidebarTrigger />
          <AppBreadcrumb />
        </div>

        {/* Header */}
        <div className="mt-4">
          <h1 className="text-3xl font-bold mb-2">Riwayat Absensi</h1>
          <p className="text-gray-600">
            Lihat riwayat kehadiran Anda dengan filter tanggal
          </p>
        </div>

        {/* Filter Section */}
        <div className="mt-6 flex flex-col gap-4 p-4 bg-gray-50 rounded-lg border">
          <Label className="text-sm font-medium">
            Cari Riwayat Absensi dengan rentang tanggal
          </Label>
          <div className="flex items-center gap-3">
            <RangeDatePicker
              onDateChange={handleDateRangeChange}
              selectedRange={dateRange}
            />
            <Button
              variant="outline"
              onClick={handleResetFilter}
              className="px-4 py-2"
            >
              Reset Filter
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <div className="mt-6">
          <DataTableRiwayatAbsen columns={columns} data={data} loading={loading} />
        </div>
      </main>
    </SidebarProvider>
  );
};

export default RiwayatAbsensiPage;
