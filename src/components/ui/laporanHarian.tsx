"use client";

import { useState, forwardRef, useImperativeHandle } from "react";
import { FileText, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface LaporanHarianProps {
  className?: string;
  disabled?: boolean;
  defaultValue?: string;
  onContentChange?: (hasContent: boolean) => void; 
}

export interface LaporanHarianHandle {
  hasContent: () => boolean;
  getLaporan: () => string;
  clearLaporan: () => void;
}

const LaporanHarian = forwardRef<LaporanHarianHandle, LaporanHarianProps>(
  (
    { className, disabled = false, defaultValue = "", onContentChange },
    ref
  ) => {
    const [laporan, setLaporan] = useState<string>(defaultValue);
    const [isFocused, setIsFocused] = useState<boolean>(false);

    const MIN_CHARACTERS = 5;
    const RECOMMENDED_CHARACTERS = 100;

    useImperativeHandle(ref, () => ({
      hasContent: () => {
        const trimmedText = laporan.trim();
        const result = trimmedText.length >= MIN_CHARACTERS;
        return result;
      },
      getLaporan: () => {
        const result = laporan.trim();
        return result;
      },
      clearLaporan: () => {
        setLaporan("");
        if (onContentChange) onContentChange(false);
      },
    }));

    // ✅ Update handleChange dengan forced callback
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setLaporan(value);

      // ✅ Force callback setiap perubahan
      if (onContentChange) {
        const hasContent = value.trim().length >= MIN_CHARACTERS;
        onContentChange(hasContent);
      }
    };

    const charCount = laporan.length;
    const trimmedCharCount = laporan.trim().length;
    const hasMinContent = trimmedCharCount >= MIN_CHARACTERS;

    const getProgressValue = () => {
      if (trimmedCharCount === 0) return 0;
      if (trimmedCharCount >= RECOMMENDED_CHARACTERS) return 100;
      return (trimmedCharCount / RECOMMENDED_CHARACTERS) * 100;
    };

    const progressValue = getProgressValue();

    const getStatusMessage = () => {
      if (trimmedCharCount === 0) {
        return { text: "Belum diisi", color: "bg-red-100 text-red-800" };
      } else if (trimmedCharCount < MIN_CHARACTERS) {
        const needed = MIN_CHARACTERS - trimmedCharCount;
        return {
          text: `Butuh ${needed} karakter lagi`,
          color: "bg-orange-100 text-orange-800",
        };
      } else {
        return { text: "Lengkap", color: "bg-green-100 text-green-800" };
      }
    };

    const status = getStatusMessage();

    const getProgressMessage = () => {
      if (trimmedCharCount < MIN_CHARACTERS) {
        const needed = MIN_CHARACTERS - trimmedCharCount;
        return `Minimal ${MIN_CHARACTERS} karakter diperlukan (butuh ${needed} lagi)`;
      } else {
        return "Laporan sudah memenuhi syarat";
      }
    };

    return (
      <div
        className={`bg-white rounded-lg shadow-md border p-6 mx-auto w-full ${
          className || ""
        }`}
      >
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
          <div className="text-sm text-amber-600">
            <p className="font-medium mb-1">Wajib diisi sebelum check out</p>
            <p>
              Minimal {MIN_CHARACTERS} karakter. Deskripsikan aktivitas dan
              pencapaian Anda hari ini.
            </p>
          </div>
        </div>

        {/* Textarea - tinggi otomatis untuk text panjang */}
        <div className="mb-4">
          <textarea
            value={laporan}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            placeholder="Tulis laporan harian Anda di sini..."
            className={`w-full min-h-[8rem] max-h-[16rem] p-4 border rounded-lg resize-y transition-all duration-200 placeholder:text-sm ${
              disabled
                ? "bg-gray-100 cursor-not-allowed opacity-60"
                : isFocused
                ? "border-navy-300 ring-2 ring-navy-100"
                : hasMinContent
                ? "border-green-500"
                : trimmedCharCount > 0
                ? "border-orange-500"
                : "border-neutral-300"
            } focus:outline-none`}
          />
        </div>

        {/* Stats dan Validation */}
        <div className="flex justify-between items-center text-sm mb-3">
          <div className="flex items-center gap-4">
            {/* Character Count */}
            <span
              className={`font-medium ${
                hasMinContent
                  ? "text-green-600"
                  : trimmedCharCount > 0
                  ? "text-orange-600"
                  : "text-gray-500"
              }`}
            >
              {trimmedCharCount}/{MIN_CHARACTERS} karakter minimal
            </span>

            <span className="text-gray-400 text-xs">
              {charCount} karakter total
            </span>
          </div>

          {/* Status Badge */}
          <div
            className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}
          >
            {status.text}
          </div>
        </div>

        {/* ✅ Info tambahan untuk laporan panjang */}
        {trimmedCharCount > RECOMMENDED_CHARACTERS * 2 && (
          <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-sm text-purple-700 font-medium">
              🏆 Laporan sangat detail!
            </p>
            <p className="text-xs text-purple-600 mt-1">
              Terima kasih telah memberikan laporan yang komprehensif.
            </p>
          </div>
        )}
      </div>
    );
  }
);

LaporanHarian.displayName = "LaporanHarian";

export default LaporanHarian;
