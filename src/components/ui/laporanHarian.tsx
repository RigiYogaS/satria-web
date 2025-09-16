"use client";

import { useState, forwardRef, useImperativeHandle } from "react";
import { FileText, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface LaporanHarianProps {
  className?: string;
  disabled?: boolean;
  defaultValue?: string;
  onContentChange?: (hasContent: boolean) => void; // ✅ Tambah prop ini
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
    // ✅ Destructure onContentChange

    const [laporan, setLaporan] = useState<string>(defaultValue);
    const [isFocused, setIsFocused] = useState<boolean>(false);

    const MIN_CHARACTERS = 5;
    const RECOMMENDED_CHARACTERS = 100;

    // ✅ Update useImperativeHandle dengan logging
    useImperativeHandle(ref, () => ({
      hasContent: () => {
        const trimmedText = laporan.trim();
        const result = trimmedText.length >= MIN_CHARACTERS;
        console.log("🔍 hasContent called:", {
          textLength: trimmedText.length,
          minRequired: MIN_CHARACTERS,
          result: result,
        });
        return result;
      },
      getLaporan: () => {
        const result = laporan.trim();
        console.log("📝 getLaporan called:", result.length, "chars");
        return result;
      },
      clearLaporan: () => {
        console.log("🗑️ clearLaporan called");
        setLaporan("");
        if (onContentChange) onContentChange(false);
      },
    }));

    // ✅ Update handleChange dengan forced callback
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setLaporan(value);

      console.log("📝 LaporanHarian text changed:", value.length, "chars");

      // ✅ Force callback setiap perubahan
      if (onContentChange) {
        const hasContent = value.trim().length >= MIN_CHARACTERS;
        console.log("📞 Calling onContentChange:", hasContent);
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
            placeholder="Contoh: Hari ini saya menyelesaikan review code untuk fitur absensi dan menghadiri meeting dengan tim development..."
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

            {hasMinContent && (
              <span className="text-green-600 text-xs">
                ✅ Syarat terpenuhi
              </span>
            )}

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

        {/* Progress Bar */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-gray-600">
              Kelengkapan
            </span>
            <span className="text-xs text-gray-500">
              {Math.round(progressValue)}%
              {trimmedCharCount > RECOMMENDED_CHARACTERS && (
                <span className="text-green-600 ml-1">(Siap checkout!)</span>
              )}
            </span>
          </div>

          <Progress
            value={progressValue}
            className={`h-2 ${hasMinContent ? "bg-green-100" : "bg-gray-100"}`}
          />

          <p className="text-xs text-gray-500 mt-2">{getProgressMessage()}</p>
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
