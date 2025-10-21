"use client";

import { useState, useEffect } from "react";
import AppBreadcrumb from "@/components/ui/AppBreadcrumb";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebarUser from "@/components/user/app-sidebarUser";
import { RangeDatePicker } from "../ui/rangeDatePicker";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { DateRange } from "react-day-picker";
import { subDays } from "date-fns";
import { DataTableRiwayatCuti } from "../ui/dataTableRiwayatCuti";
import { columnsCuti } from "@/components/ui/columsTable";

const DEFAULT_RANGE = {
  from: subDays(new Date(), 6),
  to: new Date(),
};

function formatTanggal(tgl: string) {
  const d = new Date(tgl);
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const RiwayatCutiPage = () => {
  const { data: session } = useSession();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    DEFAULT_RANGE
  );

  useEffect(() => {
    if (session?.user?.id && dateRange?.from && dateRange?.to) {
      fetchCutiData(session.user.id, dateRange.from, dateRange.to);
    }
  }, [session?.user?.id, dateRange]);

  const fetchCutiData = async (
    userId: string,
    startDate?: Date,
    endDate?: Date
  ) => {
    setLoading(true);
    try {
      let url = `/api/cuti?user_id=${userId}`;
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
    } catch {
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
    <SidebarProvider className="font-montserrat bg-neutral-100">
      <AppSidebarUser />
      <main className="flex-1 p-4 overflow-x-auto">
        <div className="flex items-center gap-3 mb-6">
          <SidebarTrigger />
          <AppBreadcrumb />
        </div>
        <div className="mt-4">
          <h1 className="md:text-3xl text-2xl font-bold mb-2">Riwayat Cuti</h1>
          <p className="text-gray-600 md:text-base text">
            Cari Riwayat Cuti dengan filter tanggal
          </p>
        </div>
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
        <div className="mt-6">
          <DataTableRiwayatCuti
            columns={columnsCuti}
            data={data}
            loading={loading}
          />
        </div>
      </main>
    </SidebarProvider>
  );
};

export default RiwayatCutiPage;
