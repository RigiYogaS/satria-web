"use client";

import { useState, forwardRef, useImperativeHandle } from "react";
import { FileText, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress"; // Import dari path yang benar

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface LaporanHarianProps {}

export interface LaporanHarianHandle {
  hasContent: () => boolean;
  getLaporan: () => string;
  clearLaporan: () => void;
}

const LaporanHarian = forwardRef<LaporanHarianHandle, LaporanHarianProps>(
  (props, ref) => {
    const [laporan, setLaporan] = useState<string>("");
    const [isFocused, setIsFocused] = useState<boolean>(false);

    useImperativeHandle(ref, () => ({
      hasContent: () => laporan.trim().length > 0,
      getLaporan: () => laporan.trim(),
      clearLaporan: () => setLaporan(""),
    }));

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setLaporan(e.target.value);
    };

    const wordCount = laporan
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
    const charCount = laporan.length;
    const hasContent = laporan.trim().length > 0;

    // Calculate progress percentage based on content
    const getProgressValue = () => {
      if (charCount === 0) return 0;
      if (charCount >= 50) return 100;
      return (charCount / 50) * 100;
    };

    const progressValue = getProgressValue();

    return (
      <div className="bg-white rounded-lg shadow-md border p-6 mx-auto w-full">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <FileText className="text-navy-500" size={24} />
          <h2 className="text-xl font-bold text-navy-500">Laporan Harian</h2>
        </div>

        {/* Warning Info */}
        <div className="flex items-start gap-3 p-3 bg-amber-100 border border-orange-200 rounded-lg mb-4">
          <AlertCircle
            className="text-amber-600 mt-0.5 flex-shrink-0"
            size={16}
          />
          <p className="text-sm text-amber-600">
            Laporan harian harus diisi sebelum melakukan check out. Deskripsikan
            aktivitas dan pencapaian Anda hari ini.
          </p>
        </div>

        {/* Textarea */}
        <div className="mb-4">
          <textarea
            value={laporan}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Contoh: Hari ini saya telah menyelesaikan review code untuk fitur absensi, menghadiri meeting dengan tim development, dan melakukan testing untuk bug fixing pada modul user management..."
            className={`w-full h-32 p-4 border rounded-lg resize-none transition-all duration-200 placeholder:text-sm ${
              isFocused
                ? "border-navy-300 ring-2 ring-navy-100"
                : hasContent
                ? "border-green-500"
                : "border-neutral-300"
            } focus:outline-none`}
          />
        </div>

        {/* Stats dan Validation */}
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-4">
            {/* Character Count */}
            <span
              className={`${
                charCount > 500 ? "text-red-500" : "text-gray-500"
              }`}
            >
              {charCount}/500 karakter
            </span>

            {/* Word Count */}
            <span className="text-gray-500">{wordCount} kata</span>
          </div>

          {/* Status Badge */}
          <div
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              hasContent
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {hasContent ? "Siap" : "Belum diisi"}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-gray-500">Progress</span>
            <span className="text-xs text-gray-400">
              {Math.round(progressValue)}%
            </span>
          </div>
          <Progress value={progressValue} className="h-2" />
          <p className="text-xs text-gray-400 mt-1">
            {progressValue < 100
              ? "Minimal 50 karakter untuk menyelesaikan laporan"
              : "Laporan sudah cukup lengkap!"}
          </p>
        </div>
      </div>
    );
  }
);

LaporanHarian.displayName = "LaporanHarian";

export default LaporanHarian;
