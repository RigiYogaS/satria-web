"use client";

import { Clock7, Calendar, MapPin, Navigation, Wifi } from "lucide-react"; // Add Wifi icon
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useIPValidation } from "@/hooks/useIPValidation";
import AlertUsage from "./alertUsage";

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
  laporanRef?: React.RefObject<{ hasContent: () => boolean }>;
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
  laporanRef,
}) => {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  const [showAccuracyAlert, setShowAccuracyAlert] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    "checkin" | "checkout" | null
  >(null);
  const [alertAccuracy, setAlertAccuracy] = useState(0);

  // Add states for other alerts
  const [showLocationAlert, setShowLocationAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // Add state untuk laporan alert
  const [showLaporanAlert, setShowLaporanAlert] = useState(false);

  // Add IP validation
  const {
    currentIP,
    isValidIP,
    allowedIPs,
    loading: ipLoading,
    checkIP,
  } = useIPValidation();

  // Add state for IP alert
  const [showIPAlert, setShowIPAlert] = useState(false);

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
    // IP validation first
    if (!isValidIP) {
      setAlertMessage(
        `Absensi hanya dapat dilakukan dari jaringan kantor yang terdaftar!\n\n` +
          `IP Anda saat ini: ${currentIP || "Tidak terdeteksi"}\n` +
          `IP yang diizinkan: ${allowedIPs.join(", ")}\n\n` +
          `Pastikan Anda terhubung ke WiFi kantor.`
      );
      setShowIPAlert(true);
      return;
    }

    if (!location) {
      setAlertMessage("Lokasi belum tersedia. Pastikan GPS aktif.");
      setShowLocationAlert(true);
      return;
    }

    if (location.accuracy > 100) {
      setAlertAccuracy(location.accuracy);
      setPendingAction("checkin");
      setShowAccuracyAlert(true);
      return;
    }

    proceedWithCheckIn();
  };

  const handleCheckOut = async (): Promise<void> => {
    if (!location) {
      setAlertMessage("Lokasi belum tersedia. Pastikan GPS aktif.");
      setShowLocationAlert(true);
      return;
    }

    // Replace alert with AlertUsage component
    if (!laporanRef?.current?.hasContent()) {
      setAlertMessage("Laporan harian harus diisi sebelum check out!");
      setShowLaporanAlert(true);
      return;
    }

    if (location.accuracy > 150) {
      setAlertAccuracy(location.accuracy);
      setPendingAction("checkout");
      setShowAccuracyAlert(true);
      return;
    }

    proceedWithCheckOut();
  };

  const proceedWithCheckIn = async (): Promise<void> => {
    if (!location) {
      setAlertMessage("Lokasi tidak tersedia");
      setShowLocationAlert(true);
      return;
    }

    setIsProcessing(true);

    try {
      // Kirim data ke backend
      const res = await fetch("/api/absensi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jamDatang: formatTime(currentTime!),
          tanggal: formatDate(currentTime!),
          lokasi: location.address,
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setAlertMessage(data.message || "❌ Gagal absensi.");
        setShowErrorAlert(true);
        return;
      }

      // Jika sukses, jalankan callback lokal (opsional)
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
      setAlertMessage("❌ Terjadi kesalahan saat absensi masuk.");
      setShowErrorAlert(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const proceedWithCheckOut = async (): Promise<void> => {
    if (!location) {
      setAlertMessage("Lokasi tidak tersedia");
      setShowLocationAlert(true);
      return;
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
      setAlertMessage("❌ Terjadi kesalahan saat absensi pulang.");
      setShowErrorAlert(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAccuracyConfirm = () => {
    setShowAccuracyAlert(false);

    if (pendingAction === "checkin") {
      proceedWithCheckIn();
    } else if (pendingAction === "checkout") {
      proceedWithCheckOut();
    }

    setPendingAction(null);
  };

  const handleAccuracyCancel = () => {
    setShowAccuracyAlert(false);
    setPendingAction(null);
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
      } min-h-[500px]`}
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

      {/* Network Status - Add after Location Status */}
      {!isCheckedOut && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Wifi size={16} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              Status Jaringan
            </span>
          </div>
          {ipLoading ? (
            <div className="flex items-center gap-3 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
              <span className="text-sm">Mendeteksi jaringan...</span>
            </div>
          ) : (
            <div className={isValidIP ? "text-green-600" : "text-red-600"}>
              <p className="text-sm">
                {isValidIP ? "✅" : "❌"} IP: {currentIP || "Tidak terdeteksi"}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {isValidIP
                  ? "Jaringan kantor terdeteksi"
                  : "Harus menggunakan jaringan kantor"}
              </p>
              <div className="text-xs text-gray-400 mt-1">
                IP yang diizinkan: {allowedIPs.join(", ")}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Button */}
      <Button
        onClick={cardState === "initial" ? handleCheckIn : handleCheckOut}
        disabled={
          isProcessing ||
          !location ||
          locationLoading ||
          isCheckedOut ||
          !isValidIP || // Add IP validation
          ipLoading
        }
        className={`w-full h-12 text-base font-medium transition-all ${
          cardState === "initial"
            ? isValidIP && location
              ? "bg-navy-200 hover:bg-navy-500"
              : "bg-gray-400 cursor-not-allowed"
            : cardState === "checkedIn"
            ? "bg-navy-200 hover:bg-navy-500"
            : "bg-gray-400 cursor-not-allowed"
        } disabled:bg-gray-300 disabled:cursor-not-allowed`}
      >
        <div className="flex items-center gap-2">
          {isProcessing
            ? "Memproses..."
            : ipLoading
            ? "Memeriksa Jaringan..."
            : !isValidIP
            ? "Jaringan Tidak Valid"
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

      {/* GPS Accuracy Alert */}
      <AlertUsage
        open={showAccuracyAlert}
        onOpenChange={setShowAccuracyAlert}
        title="⚠️ GPS Kurang Akurat"
        description={`GPS kurang akurat (±${Math.round(
          alertAccuracy
        )}m). Lanjutkan ${
          pendingAction === "checkin" ? "check in" : "check out"
        }?`}
        onConfirm={handleAccuracyConfirm}
        onCancel={handleAccuracyCancel}
      />

      {/* Location Error Alert */}
      <AlertUsage
        open={showLocationAlert}
        onOpenChange={setShowLocationAlert}
        title="⚠️ Lokasi Tidak Tersedia"
        description={alertMessage}
        onConfirm={() => setShowLocationAlert(false)}
        onCancel={() => setShowLocationAlert(false)}
      />

      {/* General Error Alert */}
      <AlertUsage
        open={showErrorAlert}
        onOpenChange={setShowErrorAlert}
        title="❌ Error"
        description={alertMessage}
        onConfirm={() => setShowErrorAlert(false)}
        onCancel={() => setShowErrorAlert(false)}
      />

      {/* Laporan Required Alert */}
      <AlertUsage
        open={showLaporanAlert}
        onOpenChange={setShowLaporanAlert}
        title="📃Laporan Harian Diperlukan!"
        description={alertMessage}
        onConfirm={() => setShowLaporanAlert(false)}
        onCancel={() => setShowLaporanAlert(false)}
        className="bg-navy-100"
      />

      {/* IP Validation Alert */}
      <AlertUsage
        open={showIPAlert}
        onOpenChange={setShowIPAlert}
        title="🌐 Jaringan Tidak Valid"
        description={alertMessage}
        onConfirm={() => setShowIPAlert(false)}
        onCancel={() => setShowIPAlert(false)}
      />
    </div>
  );
};

export default AbsenCard;
