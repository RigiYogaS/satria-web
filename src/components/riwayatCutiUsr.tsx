"use client";

import { useState, useEffect } from "react";
import AppBreadcrumb from "@/components/AppBreadcrumb";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebarUser from "@/components/app-sidebarUser";
import { RangeDatePicker } from "./ui/rangeDatePicker";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { DateRange } from "react-day-picker";
import { addDays, subDays } from "date-fns";

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
    <SidebarProvider className="font-montserra bg-neutral-50">
      <AppSidebarUser />
      <main className="flex-1 p-6">
        <div className="flex items-center gap-3 mb-6">
          <SidebarTrigger />
          <AppBreadcrumb />
        </div>
        <div className="mt-4">
          <h1 className="text-3xl font-bold mb-2">Riwayat Cuti</h1>
          <p className="text-gray-600">
            Cari Riwayat Cuti dengan filter tanggal
          </p>
        </div>
        <div className="mt-6 flex flex-col gap-4 p-4 bg-gray-50 rounded-lg border">
          <Label className="text-sm font-medium">
            Cari Riwayat Cuti dengan rentang tanggal
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
        <div className="mt-6 rounded-md border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-3 px-4 text-left font-semibold">
                  Tanggal Pengajuan
                </th>
                <th className="py-3 px-4 text-left font-semibold">Alasan</th>
                <th className="py-3 px-4 text-left font-semibold">Status</th>
                <th className="py-3 px-4 text-left font-semibold">
                  Mulai Cuti
                </th>
                <th className="py-3 px-4 text-left font-semibold">
                  Akhir Cuti
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8">
                    Loading...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8">
                    Tidak ada data cuti.
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id_cuti} className="border-b">
                    <td className="py-2 px-4">
                      {formatTanggal(item.created_at)}
                    </td>
                    <td className="py-2 px-4">
                      <Badge className="bg-red-100 text-red-600">
                        {item.alasan}
                      </Badge>
                    </td>
                    <td className="py-2 px-4">
                      <Badge
                        className={
                          item.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : item.status === "disetujui"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }
                      >
                        {item.status.charAt(0).toUpperCase() +
                          item.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="py-2 px-4">
                      {formatTanggal(item.tgl_mulai)}
                    </td>
                    <td className="py-2 px-4">
                      {formatTanggal(item.tgl_selesai)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
          <div>{`Showing 1 to ${data.length} of ${data.length} entries`}</div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <span>1</span>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
};

export default RiwayatCutiPage;
