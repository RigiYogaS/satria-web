"use client";

import {
  Clock7,
  Calendar,
  MapPin,
  Navigation,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useWifiValidation } from "@/hooks/useWifiValidation";
import { useAbsenLogic } from "@/hooks/useAbsenLogic";
import AlertUsage from "./alertUsage";

interface AbsenCardProps {
  onCheckIn?: (data: any) => void;
  onCheckOut?: (data: any) => void;
  isCheckedIn?: boolean;
  isCheckedOut?: boolean;
  checkInTime?: string;
  laporanRef?: React.RefObject<{ hasContent: () => boolean }>;
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
  const [mounted, setMounted] = useState<boolean>(false);

  // Custom hooks
  const {
    location,
    loading: locationLoading,
    error: locationError,
    getCurrentLocation,
  } = useGeolocation();

  const {
    currentIP,
    isValidWifi,
    wifiValidationLoading,
    allowedWifiList,
    connectedWifiName,
    validateWifiConnection,
  } = useWifiValidation();

  const {
    isProcessing,
    alertMessage,
    showAccuracyAlert,
    showLocationAlert,
    showErrorAlert,
    showLaporanAlert,
    showWifiAlert,
    pendingAction,
    alertAccuracy,
    setAlertMessage,
    setShowAccuracyAlert,
    setShowLocationAlert,
    setShowErrorAlert,
    setShowLaporanAlert,
    setShowWifiAlert,
    setPendingAction,
    setAlertAccuracy,
    proceedWithCheckIn,
    proceedWithCheckOut,
  } = useAbsenLogic();

  // Mount and timer effects
  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date());

    if (isCheckedOut) return;

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, [isCheckedOut]);

  useEffect(() => {
    if (mounted && !isCheckedOut) {
      getCurrentLocation();
    }
  }, [mounted, isCheckedOut, getCurrentLocation]);

  // Format functions
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Validation handlers
  const handleCheckIn = async (): Promise<void> => {
    // Wi-Fi validation
    if (!isValidWifi) {
      const allowedWifiNames = allowedWifiList
        .map((item) => item.nama_wifi)
        .join(", ");
      setAlertMessage(
        `Absensi hanya dapat dilakukan dari Wi-Fi kantor!\n\n` +
          `Status saat ini:\n` +
          `• Wi-Fi: ${
            connectedWifiName || "Tidak terhubung ke Wi-Fi kantor"
          }\n` +
          `• IP Address: ${currentIP || "Tidak terdeteksi"}\n\n` +
          `Wi-Fi yang diizinkan: ${allowedWifiNames}\n\n` +
          `Silakan hubungkan perangkat Anda ke Wi-Fi kantor terlebih dahulu.`
      );
      setShowWifiAlert(true);
      return;
    }

    // GPS validation
    if (!location) {
      setAlertMessage(
        "Lokasi belum tersedia. Pastikan GPS aktif dan izin lokasi telah diberikan."
      );
      setShowLocationAlert(true);
      return;
    }

    // Accuracy validation
    if (location.accuracy > 100) {
      setAlertAccuracy(location.accuracy);
      setPendingAction("checkin");
      setShowAccuracyAlert(true);
      return;
    }

    proceedWithCheckIn(location, currentTime!, onCheckIn);
  };

  const handleCheckOut = async (): Promise<void> => {
    if (!location) {
      setAlertMessage("Lokasi belum tersedia. Pastikan GPS aktif.");
      setShowLocationAlert(true);
      return;
    }

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

    proceedWithCheckOut(location, currentTime!, onCheckOut);
  };

  const handleAccuracyConfirm = (): void => {
    if (pendingAction === "checkin") {
      proceedWithCheckIn(location, currentTime!, onCheckIn);
    } else if (pendingAction === "checkout") {
      proceedWithCheckOut(location, currentTime!, onCheckOut);
    }
    setShowAccuracyAlert(false);
    setPendingAction(null);
  };

  const handleAccuracyCancel = (): void => {
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
      className={`bg-white w-full mx-auto p-6 rounded-lg shadow-md flex flex-col gap-6 border ${
        cardState === "checkedOut" ? "opacity-75 pointer-events-none" : ""
      } h-[615px] justify-between`} // ✅ Ganti min-h-[500px] jadi h-[600px]
    >
      {/* Content wrapper dengan overflow handling */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
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

        {/* Time and Date */}
        <div className="w-full grid grid-cols-2 gap-4 mt-4">
          <div className="flex items-center p-3">
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
                {mounted && currentTime
                  ? formatDate(currentTime)
                  : "--/--/----"}
              </p>
            </div>
          </div>
        </div>

        {/* Info Text */}
        {!isCheckedOut && (
          <div className="flex items-center gap-2 text-sm text-gray-600 p-3 bg-blue-50 rounded-lg mt-4">
            <MapPin size={16} className="text-blue-600 flex-shrink-0" />
            <span>
              Pastikan Anda berada di lokasi kantor dan terhubung Wi-Fi kantor
            </span>
          </div>
        )}

        {/* Location Status */}
        {!isCheckedOut && (
          <div className="bg-gray-50 p-4 rounded-lg mt-4">
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
                  ✅ GPS Ready - Akurasi ±{Math.round(location.accuracy)}m
                </p>
                <p className="text-xs text-gray-600 mt-1">{location.address}</p>
              </div>
            )}
          </div>
        )}

        {/* Wi-Fi Status */}
        {!isCheckedOut && (
          <div className="bg-gray-50 p-4 rounded-lg mt-4">
            <div className="flex items-center gap-2 mb-3">
              {isValidWifi ? (
                <Wifi size={16} className="text-green-500" />
              ) : (
                <WifiOff size={16} className="text-red-500" />
              )}
              <span className="text-sm font-medium text-gray-700">
                Status Wi-Fi Kantor
              </span>
            </div>

            {wifiValidationLoading ? (
              <div className="flex items-center gap-3 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                <span className="text-sm">Memvalidasi koneksi Wi-Fi...</span>
              </div>
            ) : (
              <div className="space-y-2">
                <div
                  className={isValidWifi ? "text-green-600" : "text-red-600"}
                >
                  <p className="text-sm font-medium">
                    {isValidWifi ? "✅" : "❌"}{" "}
                    {connectedWifiName || "Tidak terhubung ke Wi-Fi kantor"}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    IP Address: {currentIP || "Tidak terdeteksi"}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Button - fixed position di bawah */}
      <div className="flex-shrink-0 mt-4">
        <Button
          onClick={cardState === "initial" ? handleCheckIn : handleCheckOut}
          disabled={
            isProcessing ||
            !location ||
            locationLoading ||
            isCheckedOut ||
            !isValidWifi ||
            wifiValidationLoading
          }
          className={`w-full h-12 text-base font-medium transition-all ${
            cardState === "initial"
              ? isValidWifi && location
                ? "bg-navy-200 hover:bg-navy-500 text-white"
                : "bg-gray-400 cursor-not-allowed text-gray-600"
              : cardState === "checkedIn"
              ? isValidWifi && location
                ? "bg-navy-200 hover:bg-navy-500 text-white"
                : "bg-gray-400 cursor-not-allowed text-gray-600"
              : "bg-gray-400 cursor-not-allowed"
          } disabled:bg-gray-300 disabled:cursor-not-allowed`}
        >
          <div className="flex items-center gap-2 justify-center">
            {isProcessing
              ? "Memproses..."
              : wifiValidationLoading
              ? "Memeriksa Wi-Fi..."
              : !isValidWifi
              ? "Wi-Fi Kantor Diperlukan"
              : locationLoading
              ? "Menunggu GPS..."
              : !location
              ? "GPS Tidak Ready"
              : cardState === "initial"
              ? "Check In"
              : cardState === "checkedIn"
              ? "Check Out"
              : "Selesai"}
          </div>
        </Button>
      </div>

      {/* Alerts */}
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

      <AlertUsage
        open={showLocationAlert}
        onOpenChange={setShowLocationAlert}
        title="⚠️ Lokasi Tidak Tersedia"
        description={alertMessage}
        onConfirm={() => setShowLocationAlert(false)}
        onCancel={() => setShowLocationAlert(false)}
      />

      <AlertUsage
        open={showErrorAlert}
        onOpenChange={setShowErrorAlert}
        title="❌ Error"
        description={alertMessage}
        onConfirm={() => setShowErrorAlert(false)}
        onCancel={() => setShowErrorAlert(false)}
      />

      <AlertUsage
        open={showLaporanAlert}
        onOpenChange={setShowLaporanAlert}
        title="📃 Laporan Harian Diperlukan!"
        description={alertMessage}
        onConfirm={() => setShowLaporanAlert(false)}
        onCancel={() => setShowLaporanAlert(false)}
      />

      <AlertUsage
        open={showWifiAlert}
        onOpenChange={setShowWifiAlert}
        title="📶 Wi-Fi Kantor Diperlukan"
        description={alertMessage}
        onConfirm={() => setShowWifiAlert(false)}
        onCancel={() => setShowWifiAlert(false)}
      />
    </div>
  );
};

export default AbsenCard;
