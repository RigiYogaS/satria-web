"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebarAdmin from "./app-sidebarAdmin";
import AppBreadcrumb from "../ui/AppBreadcrumb";
import { RangeDatePicker } from "@/components/ui/rangeDatePicker";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker";
import { subDays } from "date-fns";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon } from "lucide-react";
import { DataTableLaporanAdmin } from "@/components/ui/dataTableLaporanAdmin";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getColumnsLaporanAdmin,
  LaporanAdminData,
} from "@/components/ui/columsTable";
import { Progress } from "@/components/ui/progress";

function formatLocalDateYYYYMMDD(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
}

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

  const [data, setData] = useState<LaporanAdminData[]>([]);
  const [loading, setLoading] = useState(false);

  // dialog state
  const [openEdit, setOpenEdit] = useState(false);
  const [selected, setSelected] = useState<LaporanAdminData | null>(null);
  const [nilaiInput, setNilaiInput] = useState<number | "">("");
  const fetchLaporan = useCallback(
    async (opts?: { startDate?: Date; endDate?: Date; q?: string }) => {
      setLoading(true);
      try {
        const url = new URL("/api/laporan", window.location.origin);
        if (opts?.startDate && opts?.endDate) {
          url.searchParams.set(
            "startDate",
            formatLocalDateYYYYMMDD(opts.startDate)
          );
          url.searchParams.set(
            "endDate",
            formatLocalDateYYYYMMDD(opts.endDate)
          );
        }
        if (opts?.q) {
          url.searchParams.set("search", opts.q);
        }
        url.searchParams.set("limit", "100");

        const res = await fetch(url.toString());
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setData(
            json.data.map((item: any) => ({
              id_laporan: item.id_laporan,
              nama: item.user?.nama || "-",
              bagian: item.user?.divisi?.nama_divisi || "-",
              judul: item.judul,
              tanggal_upload: item.tanggal_upload,
              nilai_admin: item.nilai_admin,
              file_path: item.file_path,
              status:
                item.nilai_admin === null
                  ? "belum"
                  : item.nilai_admin === "0"
                  ? "ditolak"
                  : "dinilai",
            }))
          );
        } else {
          setData([]);
        }
      } catch (err) {
        console.error(err);
        setData([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchLaporan({
        startDate: dateRange.from,
        endDate: dateRange.to,
        q: search.trim() || undefined,
      });
    }, 300);
    return () => clearTimeout(handler);
  }, [dateRange, search, fetchLaporan]);

  const handleEdit = useCallback(
    (row: LaporanAdminData) => {
      setSelected(row);
      const raw = row.nilai_admin;
      let parsed: number | "" = "";

      if (raw !== null && raw !== undefined && raw !== "") {
        const n = Number(raw);
        parsed = Number.isNaN(n) ? "" : n;
      }

      setNilaiInput(parsed);
      setOpenEdit(true);
    },
    [setSelected, setNilaiInput, setOpenEdit]
  );

  const handleSaveNilai = async () => {
    if (!selected) return;
    const payload = {
      id_laporan: selected.id_laporan,
      nilai_admin: nilaiInput === "" ? null : Number(nilaiInput),
    };
    const res = await fetch("/api/laporan", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setOpenEdit(false);
      setSelected(null);
      setNilaiInput("");
      fetchLaporan();
    } else {
      // optional: show error
      console.error("Gagal update nilai");
    }
  };

  const columns = useMemo(
    () => getColumnsLaporanAdmin(handleEdit),
    [handleEdit]
  );

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

        <div className="mt-4">
          <DataTableLaporanAdmin
            data={data}
            columns={columns}
            loading={loading}
          />
        </div>

        {/* Dialog edit nilai */}
        <Dialog open={openEdit} onOpenChange={setOpenEdit}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Berikan Nilai</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-600">Judul</div>
                <div className="font-medium">{selected?.judul}</div>
              </div>

              <div>
                <label className="text-sm">Nilai (0 = Ditolak, 1-10)</label>

                <div className="mt-3 flex items-center gap-4">
                  <div className="flex-1">
                    <Progress
                      value={
                        typeof nilaiInput === "number"
                          ? Math.round((nilaiInput / 10) * 100)
                          : 0
                      }
                      className="h-3"
                    />

                    <div className="mt-3 grid grid-cols-11 gap-1">
                      {Array.from({ length: 11 }).map((_, i) => {
                        const selectedStep =
                          typeof nilaiInput === "number" && nilaiInput === i;
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setNilaiInput(i)}
                            className={`text-xs py-1 rounded transition-colors border ${
                              selectedStep
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                            }`}
                            aria-pressed={selectedStep}
                            aria-label={`Pilih nilai ${i}`}
                          >
                            {i}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="w-28 text-center">
                    <div className="text-sm text-gray-600">Nilai</div>
                    <div
                      className={`mt-2 inline-flex items-center justify-center w-14 h-10 rounded font-medium ${
                        typeof nilaiInput === "number"
                          ? nilaiInput === 0
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {typeof nilaiInput === "number" ? nilaiInput : "-"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <button
                onClick={() => setOpenEdit(false)}
                className="px-4 py-2 bg-gray-100 rounded"
              >
                Batal
              </button>
              <button
                onClick={handleSaveNilai}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Simpan
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </SidebarProvider>
  );
};

export default LaporanMingguan;
