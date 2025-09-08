"use client";

import { useState, forwardRef, useImperativeHandle } from "react";
import { FileText, AlertCircle } from "lucide-react";

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

    return (
      <div className="bg-white rounded-lg shadow-md border p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <FileText className="text-navy-500" size={24} />
          <h2 className="text-lg font-bold text-navy-500">Laporan Harian</h2>
          <span className="text-red-500 text-sm">*Wajib diisi</span>
        </div>

        {/* Warning Info */}
        <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg mb-4">
          <AlertCircle
            className="text-orange-600 mt-0.5 flex-shrink-0"
            size={16}
          />
          <p className="text-sm text-orange-700">
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
            className={`w-full h-32 p-4 border rounded-lg resize-none transition-all duration-200 ${
              isFocused
                ? "border-blue-500 ring-2 ring-blue-100"
                : hasContent
                ? "border-green-500"
                : "border-gray-300"
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
            {hasContent ? "✅ Siap" : "❌ Belum diisi"}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                hasContent ? "bg-green-500" : "bg-red-500"
              }`}
              style={{ width: hasContent ? "100%" : "0%" }}
            ></div>
          </div>
        </div>

      </div>
    );
  }
);

LaporanHarian.displayName = "LaporanHarian";

export default LaporanHarian;
