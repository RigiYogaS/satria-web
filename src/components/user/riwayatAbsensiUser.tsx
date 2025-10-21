"use client";

import { useState, useEffect } from "react";
import AppBreadcrumb from "@/components/ui/AppBreadcrumb";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebarUser from "@/components/user/app-sidebarUser";
import { RangeDatePicker } from "../ui/rangeDatePicker";
import { Label } from "@/components/ui/label";
import { DataTableRiwayatAbsen } from "../ui/dataTableRiwayatAbsensi";
import { columns, AbsensiData } from "@/components/ui/columsTable";
import { Button } from "../ui/button";
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
        const endDatePlusOne = new Date(endDate);
        endDatePlusOne.setDate(endDatePlusOne.getDate() + 1);
        url += `&startDate=${startDate.toISOString()}&endDate=${endDatePlusOne.toISOString()}`;
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
    <SidebarProvider className="font-montserrat bg-neutral-100 ">
      <AppSidebarUser />
      <main className="flex-1 md:p-6 p-2 overflow-x-auto">
        <div className="flex items-center gap-3 md:mb-6 mb-3">
          <SidebarTrigger />
          <AppBreadcrumb />
        </div>

        {/* Header */}
        <div className="mt-4 md:mt-10 w-full ">
          <h1 className="md:text-3xl text-2xl font-bold mb-2 md:mb-4">
            Riwayat Absensi
          </h1>
          <p className="md:text-base text-sm text-gray-600 flex">
            Lihat riwayat kehadiran Anda dengan filter tanggal
          </p>
        </div>

        {/* Filter Section */}
        <div className="mt-6 flex flex-col md:flex-col gap-4 md:p-4 p-2 bg-white rounded-lg border">
          <Label className="md:text-base text-sm font-medium ">
            Cari Riwayat Absensi dengan rentang tanggal
          </Label>
          <div className="flex flex-col md:flex-row items-start  md:items-center gap-3">
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

        {/* Data Table */}
        <div className="mt-6 w-full">
          <DataTableRiwayatAbsen
            columns={columns}
            data={data}
            loading={loading}
          />
        </div>
      </main>
    </SidebarProvider>
  );
};

export default RiwayatAbsensiPage;
