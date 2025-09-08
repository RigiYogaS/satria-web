"use client";

import { Clock7, Calendar, MapPin, Navigation } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useGeolocation } from "@/hooks/useGeolocation";

interface TimeFormatOptions {
  hour: "2-digit";
  minute: "2-digit";
  second: "2-digit";
}

interface DateFormatOptions {
  day: "2-digit";
  month: "2-digit";
  year: "numeric";
}

interface AbsenCardProps {
  onCheckIn?: (data: AbsenData) => void;
  onCheckOut?: (data: AbsenData) => void;
  isCheckedIn?: boolean;
  isCheckedOut?: boolean;
  checkInTime?: string;
}

interface AbsenData {
  jamDatang: string;
  tanggal: string;
  lokasi: string;
  latitude: number;
  longitude: number;
  accuracy: number;
}

const AbsenCard: React.FC<AbsenCardProps> = ({
  onCheckIn,
  onCheckOut,
  isCheckedIn = false,
  isCheckedOut = false,
  checkInTime,
}) => {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  const {
    location,
    loading: locationLoading,
    error: locationError,
    getCurrentLocation,
    clearError,
  } = useGeolocation();

  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date());

    if (isCheckedOut) {
      return;
    }

    const timer: NodeJS.Timeout = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return (): void => clearInterval(timer);
  }, [isCheckedOut]);

  useEffect(() => {
    if (mounted && !isCheckedOut) {
      getCurrentLocation();
    }
  }, [mounted, getCurrentLocation, isCheckedOut]);

  const formatTime = (date: Date): string => {
    const options: TimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    };
    return date.toLocaleTimeString("id-ID", options);
  };

  const formatDate = (date: Date): string => {
    const options: DateFormatOptions = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    };
    return date.toLocaleDateString("id-ID", options);
  };

  const handleCheckIn = async (): Promise<void> => {
    if (!location) {
      alert("Lokasi belum tersedia. Pastikan GPS aktif.");
      return;
    }

    if (location.accuracy > 100) {
      const proceed = confirm(
        `⚠️ GPS kurang akurat (±${Math.round(
          location.accuracy
        )}m)\n\nLanjutkan check in?`
      );
      if (!proceed) return;
    }

    setIsProcessing(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (onCheckIn && currentTime) {
        const absenData: AbsenData = {
          jamDatang: formatTime(currentTime),
          tanggal: formatDate(currentTime),
          lokasi: location.address,
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
        };

        onCheckIn(absenData);
      }
    } catch (error) {
      console.error("Error during check in:", error);
      alert("❌ Terjadi kesalahan saat absensi masuk.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckOut = async (): Promise<void> => {
    if (!location) {
      alert("Lokasi belum tersedia. Pastikan GPS aktif.");
      return;
    }

    if (location.accuracy > 100) {
      const proceed = confirm(
        `⚠️ GPS kurang akurat (±${Math.round(
          location.accuracy
        )}m)\n\nLanjutkan check out?`
      );
      if (!proceed) return;
    }

    setIsProcessing(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (onCheckOut && currentTime) {
        const absenData: AbsenData = {
          jamDatang: formatTime(currentTime),
          tanggal: formatDate(currentTime),
          lokasi: location.address,
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
        };

        onCheckOut(absenData);
      }
    } catch (error) {
      console.error("Error during check out:", error);
      alert("❌ Terjadi kesalahan saat absensi pulang.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getCardState = () => {
    if (isCheckedOut) return "checkedOut";
    if (isCheckedIn) return "checkedIn";
    return "initial";
  };

  const cardState = getCardState();

  if (!mounted) {
    return (
      <div className="bg-white w-full max-w-md mx-auto p-6 rounded-lg shadow-md flex flex-col gap-6">
        <h2 className="text-2xl font-bold mb-4 text-navy-500 text-center">
          Absen Kehadiran
        </h2>
        <div className="animate-pulse">
          <div className="h-20 bg-gray-200 rounded mb-4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white w-full max-w-md mx-auto p-6 rounded-lg shadow-md flex flex-col gap-6 border ${
        cardState === "checkedOut" ? "opacity-75 pointer-events-none" : ""
      }`}
    >
      {/* Header dengan status */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2 text-navy-500">
          {cardState === "initial" && "Absen Kehadiran"}
          {cardState === "checkedIn" && "Absen Pulang"}
          {cardState === "checkedOut" && "Selesai Absensi"}
        </h2>

        {cardState === "checkedOut" && (
          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
            🏁 Absensi hari ini telah selesai
          </p>
        )}
      </div>

      {/* Time and Date Section */}
      <div className="w-full grid grid-cols-2 gap-4">
        <div className="flex items-center p-3">
          {/*JAM*/}
          <Clock7 className="text-navy-500" size={44} />
          <div className="flex flex-col mx-2">
            <span className="text-sm text-neutral-400">Jam</span>
            <p className="text-xl font-semibold text-navy-500 text-center">
              {mounted && currentTime && !isCheckedOut
                ? formatTime(currentTime)
                : isCheckedOut
                ? "Berhenti"
                : "--:--:--"}
            </p>
          </div>
        </div>

        <div className="flex items-center p-3">
          <Calendar className="text-navy-500" size={44} />
          <div className="flex flex-col mx-2">
            <span className="text-sm text-neutral-400">Tanggal</span>
            <p className="text-xl font-semibold text-navy-500 text-center">
              {mounted && currentTime ? formatDate(currentTime) : "--/--/----"}
            </p>
          </div>
        </div>
      </div>

      {/* Info Text */}
      {!isCheckedOut && (
        <div className="flex items-center gap-2 text-sm text-gray-600 p-3 bg-blue-50 rounded-lg">
          <MapPin size={16} className="text-blue-600 flex-shrink-0" />
          <span>Pastikan Anda berada di lokasi kantor</span>
        </div>
      )}

      {/* Location Status */}
      {!isCheckedOut && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Navigation size={16} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              Status Lokasi
            </span>
          </div>

          {locationLoading && (
            <div className="flex items-center gap-3 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
              <span className="text-sm">Mendapatkan lokasi GPS...</span>
            </div>
          )}

          {locationError && (
            <div className="text-red-600">
              <p className="text-sm">{locationError}</p>
              <Button
                onClick={getCurrentLocation}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                Coba Lagi
              </Button>
            </div>
          )}

          {location && (
            <div className="text-green-600">
              <p className="text-sm">
                GPS Ready - Akurasi ±{Math.round(location.accuracy)}m
              </p>
              <p className="text-xs text-gray-600 mt-1">{location.address}</p>
            </div>
          )}
        </div>
      )}

      {/* Action Button */}
      <Button
        onClick={cardState === "initial" ? handleCheckIn : handleCheckOut}
        disabled={isProcessing || !location || locationLoading || isCheckedOut}
        className={`w-full h-12 text-base font-medium transition-all ${
          cardState === "initial"
            ? "bg-navy-200 hover:bg-navy-500"
            : cardState === "checkedIn"
            ? "bg-navy-200 hover:bg-navy-500"
            : "bg-gray-400 cursor-not-allowed"
        } disabled:bg-gray-300 disabled:cursor-not-allowed`}
      >
        <div className="flex items-center gap-2">
          {cardState === "initial"}
          {cardState === "checkedIn"}

          {isProcessing
            ? "Memproses..."
            : locationLoading
            ? "Menunggu GPS..."
            : !location
            ? "Lokasi Belum Ready"
            : cardState === "initial"
            ? "Check In"
            : cardState === "checkedIn"
            ? "Check Out"
            : "Selesai"}
        </div>
      </Button>
    </div>
  );
};

export default AbsenCard;
