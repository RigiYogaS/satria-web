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
import { AbsenData } from "@/types/absen";
import type { LaporanHarianHandle } from "@/components/ui/laporanHarian";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

interface AbsenCardProps {
  onCheckIn?: (data: AbsenData) => Promise<void>;
  onCheckOut?: (data: AbsenData) => Promise<void>;
  isCheckedIn?: boolean;
  isCheckedOut?: boolean;
  checkInTime?: string;
  checkOutTime?: string;
  laporanRef?: React.RefObject<LaporanHarianHandle | null>;
  laporanComplete?: boolean;
  loading?: boolean;
}

export default function AbsenCard({
  onCheckIn,
  onCheckOut,
  isCheckedIn = false,
  isCheckedOut = false,
  laporanComplete = false,
  laporanRef,
  loading = false,
}: AbsenCardProps) {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);
  const [realLocationName, setRealLocationName] = useState<string>(
    "Mendeteksi lokasi..."
  );
  const [showLaporanAlert, setShowLaporanAlert] = useState(false);

  const locationCache = useRef<Record<string, string>>({});

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
    detectedList,
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
  } = useAbsenLogic();

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

  const getCheckinStatus = (date: Date): "tepat_waktu" | "telat" => {
    const jam = date.getHours();
    const menit = date.getMinutes();
    if (jam < 8 || (jam === 8 && menit === 0)) return "tepat_waktu";
    return "telat";
  };

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

    const checkinStatus = currentTime ? getCheckinStatus(currentTime) : "telat";

    // ensure values exist in scope before building payload
    const tanggal = currentTime
      ? currentTime.toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10);

    const lokasi =
      realLocationName ||
      (location
        ? `${location.latitude.toFixed(6)},${location.longitude.toFixed(6)}`
        : "Lokasi tidak tersedia");

    const latitude = location?.latitude ?? null;
    const longitude = location?.longitude ?? null;
    const accuracy =
      typeof location?.accuracy === "number" ? location.accuracy : null;

    const payload = {
      type: "checkin",
      tanggal,
      lokasi,
      latitude,
      longitude,
      accuracy,
      detected: detectedList ?? [],
      clientIp: currentIP ?? null,
      ipAddress: currentIP ?? null,
    };

    const res = await fetch("/api/absensi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!res.ok) {
      console.error("absensi error", json);
      alert(json.error || JSON.stringify(json));
      return;
    }

    window.location.reload();
  };

  const getCheckoutStatus = (
    date: Date
  ): "normal" | "lembur" | "setengah_hari" => {
    const jam = date.getHours();
    if (jam < 13) return "setengah_hari";
    if (jam > 16) return "lembur";
    return "normal";
  };

  const handleCheckOut = async (): Promise<void> => {
    const tanggal = currentTime
      ? currentTime.toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10);

    const lokasi =
      realLocationName ||
      (location
        ? `${location.latitude.toFixed(6)},${location.longitude.toFixed(6)}`
        : "Lokasi tidak tersedia");

    const latitude = location?.latitude ?? null;
    const longitude = location?.longitude ?? null;
    const accuracy =
      typeof location?.accuracy === "number" ? location.accuracy : null;

    // ambil laporan dari ref (jika ada)
    const laporanText =
      laporanRef &&
      laporanRef.current &&
      typeof laporanRef.current.getLaporan === "function"
        ? laporanRef.current.getLaporan()
        : null;

    // jika laporan wajib namun kosong, tampilkan alert (opsional)
    if (
      cardState === "checkedIn" &&
      !laporanText &&
      laporanComplete === false
    ) {
      alert("Silakan isi laporan harian sebelum check-out.");
      return;
    }

    const payload = {
      type: "checkout",
      tanggal,
      lokasi,
      latitude,
      longitude,
      accuracy,
      detected: detectedList ?? [],
      clientIp: currentIP ?? null,
      ipAddress: currentIP ?? null,
      laporanHarian: laporanText, // gunakan nama yang dipakai server
    };

    const res = await fetch("/api/absensi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!res.ok) {
      console.error("absensi checkout error", json);
      alert(json.error || JSON.stringify(json));
      return;
    }

    // bersihkan laporan di UI setelah sukses (jika ref tersedia)
    if (
      laporanRef &&
      laporanRef.current &&
      typeof laporanRef.current.clearLaporan === "function"
    ) {
      laporanRef.current.clearLaporan();
    }

    // refresh status
    window.location.reload();
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

  const getCardState = () => {
    if (isCheckedOut) return "checkedOut";
    if (isCheckedIn) return "checkedIn";
    return "initial";
  };

  const cardState = getCardState();

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

      const fallbackName = `Koordinat: ${latitude.toFixed(
        6
      )}, ${longitude.toFixed(6)}`;
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
    const R = 6371e3;
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

  if (loading) {
    return (
      <div className="bg-white w-full max-w-md mx-auto p-6 rounded-lg shadow-md flex flex-col gap-6">
        <h2 className="text-2xl font-bold mb-4 text-navy-500 text-center">
          Absen Kehadiran
        </h2>
        <Skeleton className="h-20 mb-4" />
        <Skeleton className="h-10" />
        <Skeleton className="h-10 mt-4" />
        <Skeleton className="h-10 mt-4" />
        <Skeleton className="h-12 mt-6" />
      </div>
    );
  }

  return (
    <div
      className={`bg-white w-full mx-auto p-6 rounded-lg shadow-md flex flex-col gap-6 border ${
        cardState === "checkedOut" ? "opacity-75 pointer-events-none" : ""
      } md:h-[620px] h-[400px] justify-between`}
    >
      <div className="flex-1 overflow-y-auto">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-navy-500">
            {cardState === "initial" && "Absen Kehadiran"}
            {cardState === "checkedIn" && "Absen Pulang"}
            {cardState === "checkedOut" && "Selesai Absensi"}
          </h2>
        </div>

        <div className="w-full grid grid-cols-2 gap-8 mt-4">
          <div className="flex items-center p-3">
            <Clock7 className="text-navy-500 md:size-10 size-6 hidden md:block" />
            <div className="flex flex-col mx-2">
              <span className="md:text-sm text-xs text-neutral-400">Jam</span>
              <p className="md:text-xl text-lg font-semibold text-navy-500 text-center">
                {mounted && currentTime && !isCheckedOut
                  ? formatTime(currentTime)
                  : isCheckedOut
                  ? "Berhenti"
                  : "--:--"}
              </p>
            </div>
          </div>
          <div className="flex items-center p-3">
            <Calendar className="text-navy-500 md:size-10 size-6 hidden md:block" />
            <div className="flex flex-col mx-2">
              <span className="md:text-sm text-xs text-neutral-400">
                Tanggal
              </span>
              <p className="md:text-xl text-lg font-semibold text-navy-500 text-center">
                {mounted && currentTime
                  ? formatDate(currentTime)
                  : "--/--/----"}
              </p>
            </div>
          </div>
        </div>

        {!isCheckedOut && (
          <div className="flex items-center gap-2 md:text-sm text-xs text-gray-600 p-3 bg-blue-50 rounded-lg mt-4">
            <MapPin className="text-blue-600 flex-shrink-0 md:size-6 size-4" />
            <span className="md:text-sm text-xs">
              Pastikan Anda berada di lokasi kantor dan terhubung Wi-Fi kantor
            </span>
          </div>
        )}

        {!isCheckedOut && (
          <div className="bg-gray-50 p-4 rounded-lg mt-4">
            <div className="flex items-center gap-2 mb-3">
              <Navigation className="text-gray-500 md:size-6 size-4" />
              <span className="md:text-sm text-xs font-medium text-gray-700">
                Status Lokasi
              </span>
            </div>

            {locationLoading && (
              <div className="flex items-center gap-3 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                <span className="md:text-sm text-xs">
                  Mendapatkan lokasi GPS...
                </span>
              </div>
            )}

            {locationError && (
              <div className="text-red-600">
                <p className="md:text-sm text-xs">{locationError}</p>
                <Button
                  onClick={getCurrentLocation}
                  variant="outline"
                  className="mt-2 md:text-sm text-xs"
                >
                  Coba Lagi
                </Button>
              </div>
            )}

            {location && (
              <div className="text-green-600">
                <p className="md:text-sm text-xs">
                  ✅ GPS Ready - Akurasi ±{Math.round(location.accuracy)}m
                </p>
                <p className="md:text-xs text-xs text-gray-600 mt-1">
                  Lokasi: {getLocationName()}
                </p>
                <div>IP yang terdeteksi: {currentIP ?? "-"}</div>
                <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-700">
                  <div>
                    <b>DEBUG Detected IPs:</b>{" "}
                    {detectedList && detectedList.length
                      ? detectedList.join(", ")
                      : currentIP ?? "-"}
                  </div>
                  <div>
                    <b>DEBUG Allowed IPs:</b>{" "}
                    {allowedWifiList.map((a) => a.ip).join(", ") || "-"}
                  </div>
                  <div>
                    <b>DEBUG Nama Wi-Fi:</b> {connectedWifiName ?? "-"}
                  </div>
                  <div>
                    <b>DEBUG Valid:</b> {isValidWifi ? "YA" : "TIDAK"}
                  </div>
                </div>
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
              <span className="md:text-sm text-xs font-medium text-gray-700">
                Status Wi-Fi Kantor
              </span>
            </div>

            {wifiValidationLoading ? (
              <div className="flex items-center gap-3 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                <span className="md:text-sm text-xs">
                  Memvalidasi koneksi Wi-Fi...
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                <div
                  className={isValidWifi ? "text-green-600" : "text-red-600"}
                >
                  <p className="md:text-sm text-xs font-medium">
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
          <div className="flex md:text-base text-sm  items-center gap-2 justify-center">
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
}
