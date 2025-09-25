"use client";

import {
  Clock7,
  Calendar,
  MapPin,
  Navigation,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useWifiValidation } from "@/hooks/useWifiValidation";
import { useAbsenLogic } from "@/hooks/useAbsenLogic";
import AlertUsage from "./alertUsage";
import { LaporanHarianHandle } from "./laporanHarian";
import { AbsenData } from "@/types/absen";

interface AbsenCardProps {
  onCheckIn?: (data: AbsenData) => Promise<void>;
  onCheckOut?: (data: AbsenData) => Promise<void>;
  isCheckedIn?: boolean;
  isCheckedOut?: boolean;
  checkInTime?: string;
  laporanRef?: React.RefObject<LaporanHarianHandle | null>;
  laporanComplete?: boolean;
  loading?: boolean;
}

const AbsenCard: React.FC<AbsenCardProps> = ({
  onCheckIn,
  onCheckOut,
  isCheckedIn = false,
  isCheckedOut = false,
  checkInTime = "",
  laporanRef,
  laporanComplete = false,
  loading = false,
}) => {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);
  const [realLocationName, setRealLocationName] = useState<string>(
    "Mendeteksi lokasi..."
  );
  const [showLaporanAlert, setShowLaporanAlert] = useState(false);

  // Memoization cache for reverse geocoding
  const locationCache = useRef<Record<string, string>>({});

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
  } = useWifiValidation();

  const {
    isProcessing,
    alertMessage,
    showAccuracyAlert,
    showLocationAlert,
    showErrorAlert,
    showWifiAlert,
    pendingAction,
    alertAccuracy,
    setAlertMessage,
    setShowAccuracyAlert,
    setShowLocationAlert,
    setShowErrorAlert,
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
    if (loading) return;

    if (!isValidWifi) {
      const allowedWifiNames = allowedWifiList
        .map((item) => item.nama_wifi)
        .join(", ");
      setAlertMessage(
        `Absensi hanya dapat dilakukan dari Wi-Fi kantor!\n\n` +
          `Status saat ini:\n` +
          `Wi-Fi: ${connectedWifiName || "Tidak terhubung ke Wi-Fi kantor"}\n` +
          `IP Address: ${currentIP || "Tidak terdeteksi"}\n\n` +
          `Wi-Fi yang diizinkan: ${allowedWifiNames}\n\n` +
          `Silakan hubungkan perangkat Anda ke Wi-Fi kantor terlebih dahulu.`
      );
      setShowWifiAlert(true);
      return;
    }

    if (!location) {
      setAlertMessage(
        "Lokasi belum tersedia. Pastikan GPS aktif dan izin lokasi telah diberikan."
      );
      setShowLocationAlert(true);
      return;
    }

    if (location.accuracy > 180) {
      setAlertAccuracy(location.accuracy);
      setPendingAction("checkin");
      setShowAccuracyAlert(true);
      return;
    }

    // Cek jarak dari koordinat kantor
    const kantorLat = -6.23892;
    const kantorLng = 106.803395;
    const maxRadius = 100;

    const distance = calculateDistance(
      location.latitude,
      location.longitude,
      kantorLat,
      kantorLng
    );

    if (distance > maxRadius) {
      setAlertMessage(
        `Jarak Anda ${Math.round(
          distance
        )} meter dari kantor. Maksimal ${maxRadius} meter untuk check-in.`
      );
      setShowLocationAlert(true);
      return;
    }

    // Pastikan jamKeluar selalu ada (walau kosong)
    const absenData: AbsenData = {
      jamDatang: currentTime ? currentTime.toISOString() : "",
      jamKeluar : currentTime ? currentTime.toISOString() : "",
      tanggal: currentTime ? currentTime.toISOString().slice(0, 10) : "",
      lokasi: realLocationName, 
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy,
      ipAddress: currentIP || "", 
    };

    await onCheckIn?.(absenData);
  };

  const handleCheckOut = async (): Promise<void> => {
    if (loading) return;

    if (!laporanComplete) {
      setShowLaporanAlert(true);
      return;
    }

    if (!location) {
      setAlertMessage("Lokasi belum tersedia. Pastikan GPS aktif.");
      setShowLocationAlert(true);
      return;
    }

    if (location.accuracy > 150) {
      setAlertAccuracy(location.accuracy);
      setPendingAction("checkout");
      setShowAccuracyAlert(true);
      return;
    }

    // Pastikan jamDatang selalu ada (walau kosong)
    const absenData: AbsenData = {
      jamDatang: "",
      jamKeluar: currentTime ? currentTime.toISOString() : "",
      tanggal: currentTime ? currentTime.toISOString().slice(0, 10) : "",
      lokasi: realLocationName,
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy,
    };

    await onCheckOut?.(absenData);
  };

  const handleAccuracyConfirm = (): void => {
    if (pendingAction === "checkin") {
      handleCheckIn();
    } else if (pendingAction === "checkout") {
      handleCheckOut();
    }
    setShowAccuracyAlert(false);
    setPendingAction(null);
  };

  const handleAccuracyCancel = (): void => {
    setShowAccuracyAlert(false);
    setPendingAction(null);
  };

  // Card state: SELALU berdasarkan prop dari parent
  const getCardState = () => {
    if (isCheckedOut) return "checkedOut";
    if (isCheckedIn) return "checkedIn";
    return "initial";
  };

  const cardState = getCardState();

  // Memoized reverse geocoding
  const getRealLocationName = async (
    latitude: number,
    longitude: number
  ): Promise<string> => {
    const key = `${latitude.toFixed(6)},${longitude.toFixed(6)}`;
    if (locationCache.current[key]) return locationCache.current[key];

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
      );

      if (!response.ok) throw new Error("Failed to fetch location");

      const data = await response.json();

      // Extract meaningful location info
      const address = data.address || {};
      const locationParts = [];

      if (address.building || address.office) {
        locationParts.push(address.building || address.office);
      }
      if (address.road) {
        locationParts.push(address.road);
      }
      if (address.village || address.suburb || address.neighbourhood) {
        locationParts.push(
          address.village || address.suburb || address.neighbourhood
        );
      }
      if (address.city_district) {
        locationParts.push(address.city_district);
      }
      if (address.city || address.town) {
        locationParts.push(address.city || address.town);
      }

      const locationName =
        locationParts.length > 0
          ? locationParts.slice(0, 2).join(", ")
          : data.display_name?.split(",").slice(0, 2).join(", ") ||
            "Lokasi tidak dikenali";

      locationCache.current[key] = locationName;
      return locationName;
    } catch (error) {
      // Fallback: Check if within known office coordinates
      const knownOffices = [
        {
          name: "Mabes Polri",
          lat: -6.23892,
          lng: 106.803395,
          radius: 100,
        },
      ];

      for (const office of knownOffices) {
        const distance = calculateDistance(
          latitude,
          longitude,
          office.lat,
          office.lng
        );
        if (distance <= office.radius) {
          locationCache.current[key] = office.name;
          return office.name;
        }
      }

      const fallbackName = `Koordinat: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      locationCache.current[key] = fallbackName;
      return fallbackName;
    }
  };

  useEffect(() => {
    if (location && !locationLoading) {
      getRealLocationName(location.latitude, location.longitude)
        .then(setRealLocationName)
        .catch(() => setRealLocationName("Lokasi tidak dapat dideteksi"));
    }
  }, [location, locationLoading]);

  const getLocationName = (): string => {
    if (!location) return "Lokasi tidak tersedia";
    return realLocationName;
  };

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

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
      } h-[620px] justify-between`}
    >
      <div className="flex-1 overflow-y-auto">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2 text-navy-500">
            {cardState === "initial" && "Absen Kehadiran"}
            {cardState === "checkedIn" && "Absen Pulang"}
            {cardState === "checkedOut" && "Selesai Absensi"}
          </h2>
        </div>

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

        {!isCheckedOut && (
          <div className="flex items-center gap-2 text-sm text-gray-600 p-3 bg-blue-50 rounded-lg mt-4">
            <MapPin size={16} className="text-blue-600 flex-shrink-0" />
            <span>
              Pastikan Anda berada di lokasi kantor dan terhubung Wi-Fi kantor
            </span>
          </div>
        )}

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
                <p className="text-xs text-gray-600 mt-1">
                  Lokasi: {getLocationName()}
                </p>
              </div>
            )}
          </div>
        )}

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
            wifiValidationLoading ||
            (cardState === "checkedIn" && !laporanComplete)
          }
          className={`w-full h-12 text-base font-medium transition-all ${
            cardState === "initial"
              ? isValidWifi && location
                ? "bg-navy-200 hover:bg-navy-500 text-white"
                : "bg-gray-400 cursor-not-allowed text-gray-600"
              : cardState === "checkedIn"
              ? isValidWifi && location && laporanComplete
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
        description="Silakan isi laporan harian terlebih dahulu sebelum melakukan check-out."
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