"use client";

import { Clock, MapPin, Wifi, CheckCircle, XCircle } from "lucide-react";
import { useState, useEffect, forwardRef, useImperativeHandle } from "react";

interface LocationData {
  address: string;
  coords: {
    latitude: number;
    longitude: number;
  };
}

interface AbsensiData {
  checkIn: Date | null;
  checkOut: Date | null;
  location: LocationData | null;
  ipAddress: string;
  isCheckedOut: boolean;
  networkInfo: {
    isAllowed: boolean;
    networkType: string;
    provider: string;
    canAttend: boolean;
    message: string;
  } | null;
}

interface StatusAbsenRef {
  triggerCheckIn: () => void;
}

const StatusAbsen = forwardRef<StatusAbsenRef>((props, ref) => {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);
  const [absensiData, setAbsensiData] = useState<AbsensiData>({
    checkIn: null,
    checkOut: null,
    location: null,
    ipAddress: "",
    isCheckedOut: false,
    networkInfo: null,
  });

  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date());

    // Update time setiap detik
    const timer: NodeJS.Timeout = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Get IP Address hanya setelah component mounted
    getIPAddress();

    return (): void => clearInterval(timer);
  }, []);

  // Expose method to parent component
  useImperativeHandle(ref, () => ({
    triggerCheckIn: handleCheckIn,
  }));

  const getIPAddress = async (): Promise<void> => {
    try {
      // Gunakan API internal untuk validasi jaringan
      const response = await fetch("/api/get-ip", {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      setAbsensiData((prev) => ({
        ...prev,
        ipAddress: data.ip,
        networkInfo: {
          isAllowed: data.isAllowed,
          networkType: data.networkType,
          provider: data.provider,
          canAttend: data.canAttend,
          message: data.message,
        },
      }));
    } catch (error) {
      console.error("Error getting IP:", error);

      setAbsensiData((prev) => ({
        ...prev,
        ipAddress: "unknown",
        networkInfo: {
          isAllowed: false,
          networkType: "error",
          provider: "unknown",
          canAttend: false,
          message:
            "Tidak dapat mendeteksi jaringan. Pastikan koneksi internet stabil.",
        },
      }));
    }
  };

  const getCurrentLocation = (): Promise<LocationData> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        // Fallback jika geolocation tidak didukung
        resolve({
          address:
            "Jl. Trunojoyo No.3, RT.5/RW.2, Selong, Kec. Kby. Baru, Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 12110",
          coords: { latitude: -6.2426, longitude: 106.8088 },
        });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          // Langsung gunakan alamat default tanpa API call untuk menghindari network error
          resolve({
            address: `Kantor Pusat - Lat: ${latitude.toFixed(
              4
            )}, Lng: ${longitude.toFixed(4)}`,
            coords: { latitude, longitude },
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          // Default location (kantor) jika gagal
          resolve({
            address:
              "Jl. Trunojoyo No.3, RT.5/RW.2, Selong, Kec. Kby. Baru, Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 12110",
            coords: { latitude: -6.2426, longitude: 106.8088 },
          });
        }
      );
    });
  };

  const handleCheckIn = async (): Promise<void> => {
    try {
      // Validasi jaringan terlebih dahulu
      await getIPAddress();

      // Cek apakah jaringan diizinkan setelah update state
      await new Promise((resolve) => setTimeout(resolve, 100)); // Wait for state update

      // Ambil data terbaru untuk validasi
      const currentNetworkInfo = absensiData.networkInfo;

      if (!currentNetworkInfo?.canAttend) {
        alert(
          `❌ Absensi Gagal!\n\n${
            currentNetworkInfo?.message || "Jaringan tidak diizinkan"
          }`
        );
        return;
      }

      // Jika jaringan valid, lanjutkan dengan absen
      const location = await getCurrentLocation();
      const now = new Date();

      setAbsensiData((prev) => ({
        ...prev,
        checkIn: now,
        location: location,
        isCheckedOut: false,
      }));

      alert(
        `✅ Absensi Berhasil!\n\nJaringan: ${
          currentNetworkInfo.provider
        }\nWaktu: ${now.toLocaleTimeString("id-ID")}`
      );
    } catch (error) {
      console.error("Error during check in:", error);
      alert("❌ Terjadi kesalahan saat absensi. Silakan coba lagi.");
    }
  };

  const handleCheckOut = (): void => {
    const now = new Date();
    setAbsensiData((prev) => ({
      ...prev,
      checkOut: now,
      isCheckedOut: true,
    }));
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Jangan render sampai component mounted
  if (!mounted || !currentTime) {
    return null;
  }

  return (
    <div className="flex gap-6">
      {/* Card Status Absensi */}
      {absensiData.checkIn && (
        <div className="bg-white p-6 rounded-lg shadow border w-80">
          <h3 className="text-xl font-semibold mb-4">Status Absensi</h3>

          {/* Jam Check In & Check Out */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-3">
              <Clock className="text-green-500" size={20} />
              <div>
                <span className="text-sm text-gray-500">Check In</span>
                <p className="font-semibold">
                  {absensiData.checkIn
                    ? formatTime(absensiData.checkIn)
                    : "00:00"}{" "}
                  WIB
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="text-red-500" size={20} />
              <div>
                <span className="text-sm text-gray-500">Check Out</span>
                <p className="font-semibold">
                  {absensiData.checkOut
                    ? formatTime(absensiData.checkOut)
                    : "00:00"}{" "}
                  WIB
                </p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 mb-4">
            {absensiData.isCheckedOut ? (
              <>
                <CheckCircle className="text-green-500" size={20} />
                <span className="text-green-600 font-medium">
                  Sudah Checkout
                </span>
              </>
            ) : (
              <>
                <XCircle className="text-amber-500" size={20} />
                <span className="text-amber-600 font-medium">
                  Belum Checkout
                </span>
              </>
            )}
          </div>

          {/* Lokasi */}
          {absensiData.location && (
            <div className="mb-4">
              <div className="flex items-start gap-2 mb-2">
                <MapPin className="text-blue-500 mt-1" size={16} />
                <div>
                  <span className="text-sm text-gray-500">Lokasi</span>
                  <p className="text-sm text-gray-700">
                    {absensiData.location.address}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* IP Address */}
          <div className="flex items-center gap-2 mb-4">
            <Wifi className="text-purple-500" size={16} />
            <div>
              <span className="text-sm text-gray-500">IP Address</span>
              <p className="text-sm font-mono">{absensiData.ipAddress}</p>
            </div>
          </div>

          {/* Network Information */}
          {absensiData.networkInfo && (
            <div className="border-t pt-4">
              <div className="flex items-start gap-2">
                <div
                  className={`w-3 h-3 rounded-full mt-1 ${
                    absensiData.networkInfo.isAllowed
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                ></div>
                <div className="flex-1">
                  <span className="text-sm text-gray-500">Status Jaringan</span>
                  <p
                    className={`text-sm font-medium ${
                      absensiData.networkInfo.isAllowed
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {absensiData.networkInfo.provider}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {absensiData.networkInfo.message}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Card Absen Pulang */}
      {absensiData.checkIn && !absensiData.isCheckedOut && (
        <div className="bg-white p-6 rounded-lg shadow border w-64">
          <h3 className="text-xl font-semibold mb-4">Absen Pulang</h3>

          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-3">
              <Clock className="text-gray-500" size={20} />
              <div>
                <span className="text-sm text-gray-500">Jam</span>
                <p className="text-lg font-semibold">
                  {currentTime ? formatTime(currentTime) : "--:--"}
                </p>
              </div>
            </div>

            <div className="text-center">
              <span className="text-sm text-gray-500">Tanggal</span>
              <p className="font-medium">
                {currentTime ? formatDate(currentTime) : "--/--/----"}
              </p>
            </div>
          </div>

          <button
            onClick={handleCheckOut}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition-colors"
          >
            Check Out
          </button>
        </div>
      )}
    </div>
  );
});

StatusAbsen.displayName = "StatusAbsen";

export default StatusAbsen;
