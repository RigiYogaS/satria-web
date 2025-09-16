"use client";

import { AlertCircle } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebarUser from "@/components/app-sidebarUser";
import AppBreadcrumb from "@/components/AppBreadcrumb";
import AbsenCard from "./ui/absenCard";
import StatusAbsen from "./ui/statusAbsen";
import LaporanHarian, { LaporanHarianHandle } from "./ui/laporanHarian";
import { useState, useRef, useEffect } from "react";

interface AbsenData {
  jamDatang: string;
  tanggal: string;
  lokasi?: string;
  latitude: number;
  longitude: number;
  accuracy: number;
}

const AbsenToday = () => {
  const [isCheckedIn, setIsCheckedIn] = useState<boolean>(false);
  const [isCheckedOut, setIsCheckedOut] = useState<boolean>(false);
  const [checkInTime, setCheckInTime] = useState<string>("");
  const [checkOutTime, setCheckOutTime] = useState<string>("");
  const [laporanComplete, setLaporanComplete] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentDate, setCurrentDate] = useState<string>("");

  const statusAbsenRef = useRef<{
    triggerCheckIn: (data: AbsenData) => void;
    triggerCheckOut: (data: AbsenData) => void;
  }>(null);

  const laporanRef = useRef<LaporanHarianHandle>(null);

  // DATE CHANGE DETECTION
  useEffect(() => {
    const checkDateChange = () => {
      const today = new Date().toLocaleDateString("id-ID");

      if (currentDate && currentDate !== today) {
        console.log("📅 Date changed! Resetting absensi state...");
        console.log("Previous date:", currentDate, "New date:", today);

        setIsCheckedIn(false);
        setIsCheckedOut(false);
        setCheckInTime("");
        setCheckOutTime("");
        setLaporanComplete(false);

        checkTodayAbsensiStatus();
      }

      setCurrentDate(today);
    };

    checkDateChange();
    const interval = setInterval(checkDateChange, 60000);

    return () => clearInterval(interval);
  }, [currentDate]);

  useEffect(() => {
    checkTodayAbsensiStatus();
  }, []);

  // MANUAL REFRESH FUNCTION
  const refreshAbsensiStatus = async () => {
    console.log("🔄 Manually refreshing absensi status...");

    setIsCheckedIn(false);
    setIsCheckedOut(false);
    setCheckInTime("");
    setCheckOutTime("");
    setLaporanComplete(false);

    await checkTodayAbsensiStatus();
  };

  const checkTodayAbsensiStatus = async () => {
    try {
      console.log("🔍 Checking today's absensi status...");

      const response = await fetch("/api/absensi");
      const result = await response.json();

      if (response.ok && result.success) {
        const { hasCheckedIn, hasCheckedOut, absensi } = result.data;

        console.log("🔍 Database state:", {
          hasCheckedIn,
          hasCheckedOut,
          absensi,
          currentDate: new Date().toLocaleDateString("id-ID"),
        });

        setIsCheckedIn(hasCheckedIn);
        setIsCheckedOut(hasCheckedOut);

        if (hasCheckedIn && absensi) {
          setCheckInTime(new Date(absensi.waktu).toLocaleTimeString("id-ID"));

          if (hasCheckedOut && absensi.checkoutTime) {
            setCheckOutTime(
              new Date(absensi.checkoutTime).toLocaleTimeString("id-ID")
            );
          }

          const latitude = parseFloat(absensi.latitude) || -6.238711;
          const longitude = parseFloat(absensi.longitude) || 106.803393;

          console.log("🌍 Getting location for coordinates:", {
            latitude,
            longitude,
          });

          let realLocationName = "Lokasi tidak diketahui";
          try {
            realLocationName = await getRealLocationName(latitude, longitude);
            console.log("📍 Real location found:", realLocationName);
          } catch (error) {
            console.error("❌ Failed to get location name:", error);
            realLocationName = "Kantor Pusat";
          }

          const existingAbsenData: AbsenData = {
            jamDatang: new Date(absensi.waktu).toLocaleTimeString("id-ID"),
            tanggal: new Date().toLocaleDateString("id-ID"),
            lokasi: realLocationName,
            latitude: latitude,
            longitude: longitude,
            accuracy: parseFloat(absensi.accuracy) || 50,
          };

          console.log(
            "🚀 About to trigger StatusAbsen with real location:",
            existingAbsenData
          );

          setTimeout(() => {
            console.log("📞 Calling triggerCheckIn...", statusAbsenRef.current);

            if (statusAbsenRef.current) {
              statusAbsenRef.current.triggerCheckIn(existingAbsenData);
              console.log("✅ triggerCheckIn called successfully");

              if (hasCheckedOut && absensi.checkoutTime) {
                setTimeout(() => {
                  console.log("📞 Calling triggerCheckOut...");
                  statusAbsenRef.current?.triggerCheckOut({
                    ...existingAbsenData,
                    jamDatang: new Date(
                      absensi.checkoutTime
                    ).toLocaleTimeString("id-ID"),
                  });
                  console.log("✅ triggerCheckOut called successfully");
                }, 200);
              }
            } else {
              console.log("❌ statusAbsenRef.current is null");
            }
          }, 1000);
        } else {
          console.log(
            "✅ No check-in found for today - ready for new check-in"
          );
        }
      }
    } catch (error) {
      console.error("❌ Failed to check today's absensi status:", error);
    }
  };

  // GET REAL LOCATION NAME FROM COORDINATES
  const getRealLocationName = async (
    latitude: number,
    longitude: number
  ): Promise<string> => {
    try {
      console.log("🌍 Fetching location for:", { latitude, longitude });

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            "User-Agent": "SATRIA-Absensi/1.0",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log("🗺️ Nominatim response:", data);

      if (data && data.display_name) {
        const address = data.address || {};

        let locationParts = [];

        if (address.building || address.house_number) {
          locationParts.push(address.building || `No. ${address.house_number}`);
        }

        if (address.road) {
          locationParts.push(address.road);
        }

        if (address.suburb || address.neighbourhood) {
          locationParts.push(address.suburb || address.neighbourhood);
        }

        if (address.city || address.town || address.village) {
          locationParts.push(address.city || address.town || address.village);
        }

        const readableLocation =
          locationParts.length > 0
            ? locationParts.slice(0, 3).join(", ")
            : data.display_name.split(",").slice(0, 2).join(", ");

        console.log("📍 Processed location:", readableLocation);
        return readableLocation;
      }

      return "Lokasi tidak diketahui";
    } catch (error) {
      console.error("❌ Error fetching location:", error);
      return "Kantor Pusat";
    }
  };

  // HANDLE CHECK IN
  const handleCheckIn = async (absenData: AbsenData): Promise<void> => {
    setLoading(true);

    try {
      console.log("🚀 Starting check-in process...");

      let realLocationName = "Lokasi tidak diketahui";
      try {
        realLocationName = await getRealLocationName(
          absenData.latitude,
          absenData.longitude
        );
        console.log("📍 Real location for new check-in:", realLocationName);
      } catch (error) {
        console.error("❌ Failed to get location for check-in:", error);
        realLocationName = "Kantor Pusat";
      }

      const requestBody = {
        type: "checkin",
        latitude: absenData.latitude,
        longitude: absenData.longitude,
        accuracy: absenData.accuracy,
        jamDatang: absenData.jamDatang,
        bypassAuth: true,
      };

      console.log("📤 Sending check-in request:", requestBody);

      const response = await fetch("/api/absensi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(requestBody),
      });

      console.log(
        "📥 Check-in response:",
        response.status,
        response.statusText
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.log("❌ Check-in response error:", errorText);

        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || `HTTP ${response.status}`);
        } catch {
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
      }

      const result = await response.json();
      console.log("📋 Check-in result:", result);

      console.log("✅ Check-in successful!");

      setIsCheckedIn(true);
      setCheckInTime(absenData.jamDatang);

      const completeAbsenData: AbsenData = {
        ...absenData,
        lokasi: realLocationName,
      };

      console.log(
        "🚀 Triggering StatusAbsen after new check-in with real location:",
        completeAbsenData
      );

      setTimeout(() => {
        if (statusAbsenRef.current) {
          statusAbsenRef.current.triggerCheckIn(completeAbsenData);
          console.log("✅ StatusAbsen triggered after check-in");
        } else {
          console.log("❌ statusAbsenRef.current is null after check-in");
        }
      }, 100);

      alert("✅ Check-in berhasil!");
    } catch (error) {
      console.error("❌ Check-in error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Check-in failed";
      alert(`❌ Check-in gagal: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // HANDLE CHECK OUT
  const handleCheckOut = async (absenData: AbsenData): Promise<void> => {
    setLoading(true);
    try {
      if (!laporanRef.current) {
        alert("❌ Referensi laporan tidak tersedia!");
        return;
      }

      const laporanText = laporanRef.current.getLaporan();

      if (laporanText.length < 5) {
        alert(
          `❌ Laporan harus minimal 5 karakter!\n\nSaat ini: ${laporanText.length} karakter`
        );
        return;
      }

      const response = await fetch("/api/absensi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "checkout",
          latitude: absenData.latitude,
          longitude: absenData.longitude,
          accuracy: absenData.accuracy,
          jamPulang: absenData.jamDatang,
          laporanHarian: laporanText,
          bypassAuth: true,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Check-out failed");
      }

      setIsCheckedOut(true);
      setCheckOutTime(absenData.jamDatang);

      const completeAbsenData: AbsenData = {
        ...absenData,
        lokasi: absenData.lokasi || "Kantor Pusat",
      };

      setTimeout(() => {
        if (statusAbsenRef.current) {
          statusAbsenRef.current.triggerCheckOut(completeAbsenData);
        }
      }, 100);

      alert("✅ Check-out berhasil!");
    } catch (error) {
      console.error("❌ Check-out failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Check-out failed";
      alert(`❌ Check-out gagal: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLaporanContentChange = (hasContent: boolean): void => {
    setLaporanComplete(hasContent);
  };

  return (
    <SidebarProvider className="font-montserrat">
      <AppSidebarUser />
      <main className="flex-1 p-6">
        <div className="flex items-center gap-3 mb-6">
          <SidebarTrigger />
          <AppBreadcrumb />
        </div>

        <div className="mt-4 space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Absensi Hari Ini
            </h1>
            <div className="flex items-start gap-3 p-4 bg-amber-100 border border-amber-200 rounded-lg">
              <AlertCircle
                className="text-amber-700 mt-0.5 flex-shrink-0"
                size={20}
              />
              <p className="text-sm text-amber-700">
                Absensi hanya dapat dilakukan melalui jaringan WiFi kantor. Jika
                menggunakan jaringan luar (seperti Telkomsel, Indosat, atau
                provider lain), maka absensi tidak akan tercatat
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            <div className="w-full h-full">
              <AbsenCard
                onCheckIn={handleCheckIn}
                onCheckOut={handleCheckOut}
                isCheckedIn={isCheckedIn}
                isCheckedOut={isCheckedOut}
                checkInTime={checkInTime}
                laporanRef={laporanRef}
                laporanComplete={laporanComplete}
                loading={loading}
              />
            </div>

            {isCheckedIn && (
              <div className="w-full h-full">
                <StatusAbsen
                  ref={statusAbsenRef}
                  checkOutTime={checkOutTime}
                  isCheckedOut={isCheckedOut}
                />
              </div>
            )}

            {!isCheckedIn && (
              <div className="w-full bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center min-h-[500px] flex flex-col justify-center">
                <p className="text-navy-500 text-3xl font-bold mb-2">
                  📋 Status Absensi
                </p>
                <p className="text-neutral-500 text-sm">
                  Status akan muncul setelah Anda melakukan check in
                </p>
              </div>
            )}
          </div>

          {isCheckedIn && !isCheckedOut && (
            <div className="space-y-4">
              <LaporanHarian
                ref={laporanRef}
                onContentChange={handleLaporanContentChange}
              />
            </div>
          )}

          {isCheckedOut && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <h3 className="text-green-800 font-semibold text-lg mb-2">
                🎉 Absensi Hari Ini Selesai!
              </h3>
              <p className="text-green-700 text-sm">
                Terima kasih telah menyelesaikan absensi dan laporan harian.
                Semoga hari Anda menyenangkan!
              </p>
            </div>
          )}
        </div>
      </main>
    </SidebarProvider>
  );
};

export default AbsenToday;
