"use client";

import { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import LocationCard from "./locationCard";
import { AbsenData } from "@/types/absen";

interface StatusAbsenHandle {
  triggerCheckIn: (absenData: AbsenData) => void;
  triggerCheckOut: (absenData: AbsenData) => void;
}

interface StatusAbsenProps {
  checkOutTime?: string;
  isCheckedOut?: boolean;
  absenData?: AbsenData | null;
  visible?: boolean;
  wifiName?: string; // <-- tambahkan ini
}

const StatusAbsen = forwardRef<StatusAbsenHandle, StatusAbsenProps>(
  (
    {
      checkOutTime = "00.00 WIB",
      isCheckedOut = false,
      absenData,
      visible,
      wifiName,
    },
    ref
  ) => {
    const [currentCheckOutTime, setCurrentCheckOutTime] =
      useState<string>("--.--.--");
    const [localCheckedOut, setLocalCheckedOut] =
      useState<boolean>(isCheckedOut);
    const [checkoutLocationName, setCheckoutLocationName] =
      useState<string>("");
    const [locationName, setLocationName] = useState<string>("");
    const [wifiNameState, setWifiNameState] = useState<string>("");

    useImperativeHandle(ref, () => ({
      triggerCheckIn: (data: AbsenData) => {
        setLocalCheckedOut(false);
        setCurrentCheckOutTime("--.--.--");
        setCheckoutLocationName("");
      },
      triggerCheckOut: (data: AbsenData) => {
        setCurrentCheckOutTime(data.jamDatang ?? "--.--.--");
        setLocalCheckedOut(true);
        if (data.latitude && data.longitude) {
          getRealLocationName(data.latitude, data.longitude).then(
            setCheckoutLocationName
          );
        }
      },
    }));

    useEffect(() => {
      setLocalCheckedOut(isCheckedOut);
      if (isCheckedOut && checkOutTime !== "00.00 WIB") {
        setCurrentCheckOutTime(checkOutTime);
      }
      // Jika absenData berubah dan sudah checkout, update nama lokasi
      if (isCheckedOut && absenData?.latitude && absenData?.longitude) {
        getRealLocationName(absenData.latitude, absenData.longitude).then(
          setCheckoutLocationName
        );
      }
    }, [isCheckedOut, checkOutTime, absenData]);

    useEffect(() => {
      if (absenData?.latitude && absenData?.longitude) {
        getRealLocationName(absenData.latitude, absenData.longitude).then(
          (name) => {
            setLocationName(name);
          }
        );
      }
    }, [absenData?.latitude, absenData?.longitude]);

    // Ambil nama wifi dari ipAddress via API eksternal — prioritaskan prop wifiName jika ada
    useEffect(() => {
      // helper normalize IP
      function normalizeIp(raw?: string | null): string | null {
        if (!raw) return null;
        let ip = String(raw).split(",")[0].trim(); // take first if comma separated
        ip = ip.replace(/^::ffff:/i, ""); // remove IPv6 prefix
        const m = ip.match(/([0-9]{1,3}(\.[0-9]{1,3}){3})/);
        if (m) return m[1];
        return ip || null;
      }

      console.log(
        "[StatusAbsen] prop wifiName:",
        wifiName,
        "absenData.ipAddress:",
        absenData?.ipAddress
      );
      if (wifiName) {
        setWifiNameState(wifiName);
        return;
      }

      const normalized = normalizeIp(absenData?.ipAddress);
      console.log("[StatusAbsen] normalized IP:", normalized);
      if (!normalized) {
        setWifiNameState("");
        return;
      }

      const fetchWifiName = async () => {
        try {
          const res = await fetch(
            `/api/ip-lokasi?ip=${encodeURIComponent(normalized)}`,
            { cache: "no-store" }
          );
          console.log("[StatusAbsen] /api/ip-lokasi status:", res.status);
          if (!res.ok) {
            setWifiNameState("");
            return;
          }
          const data = await res.json();
          console.log("[StatusAbsen] /api/ip-lokasi response:", data);
          setWifiNameState(data?.nama_wifi || data?.nama || "");
        } catch (err) {
          console.error("[StatusAbsen] fetch ip-lokasi error:", err);
          setWifiNameState("");
        }
      };

      fetchWifiName();
    }, [wifiName, absenData?.ipAddress]);

    async function getRealLocationName(
      latitude: number,
      longitude: number
    ): Promise<string> {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      return data.display_name || "Lokasi tidak tersedia";
    }

    const getHourMinute = (timeStr: string) => {
      if (!timeStr) return "--.--";
      const clean = timeStr.replace(/\./g, ":");
      const [hour, minute] = clean.split(":");
      if (!hour || !minute) return "--.--";
      return `${hour.padStart(2, "0")}.${minute.padStart(2, "0")}`;
    };

    type CheckinStatus = "tepat_waktu" | "telat";
    type CheckoutStatus = "normal" | "lembur" | "setengah_hari";

    function normalizeCheckinStatus(s?: string): CheckinStatus | undefined {
      if (s === "tepat_waktu" || s === "telat") return s;
      return undefined;
    }

    function normalizeCheckoutStatus(s?: string): CheckoutStatus | undefined {
      if (s === "normal" || s === "lembur" || s === "setengah_hari") return s;
      return undefined;
    }

    if (!visible || !absenData) {
      return null;
    }

    return (
      <LocationCard
        jamDatang={absenData?.jamDatang}
        jamKeluar={absenData?.jamKeluar}
        lokasi={locationName}
        currentIP={absenData?.ipAddress}
        wifiName={wifiNameState}
        isCheckedOut={isCheckedOut}
        checkinStatus={normalizeCheckinStatus(absenData?.checkinStatus)}
        checkoutStatus={normalizeCheckoutStatus(absenData?.checkoutStatus)}
      />
    );
  }
);

StatusAbsen.displayName = "StatusAbsen";

export default StatusAbsen;
