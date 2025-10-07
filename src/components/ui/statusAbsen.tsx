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
}

const StatusAbsen = forwardRef<StatusAbsenHandle, StatusAbsenProps>(
  (
    { checkOutTime = "00.00 WIB", isCheckedOut = false, absenData, visible },
    ref
  ) => {
    const [currentCheckOutTime, setCurrentCheckOutTime] =
      useState<string>("--.--.--");
    const [localCheckedOut, setLocalCheckedOut] =
      useState<boolean>(isCheckedOut);
    const [checkoutLocationName, setCheckoutLocationName] =
      useState<string>("");
    const [locationName, setLocationName] = useState<string>("");
    const [wifiName, setWifiName] = useState<string>("");

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

    // Ambil nama wifi dari ipAddress via API eksternal
    useEffect(() => {
      if (absenData?.ipAddress) {
        const fetchWifiName = async () => {
          try {
            const res = await fetch(`/api/ip-lokasi?ip=${absenData.ipAddress}`);
            const data = await res.json();
            setWifiName(data.nama_wifi || "");
          } catch {
            setWifiName("");
          }
        };
        fetchWifiName();
      } else {
        setWifiName("");
      }
    }, [absenData?.ipAddress]);

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

    // Helper untuk ambil jam dan menit dari string "14.05.12" atau "14:05:12"
    const getHourMinute = (timeStr: string) => {
      if (!timeStr) return "--.--";
      const clean = timeStr.replace(/\./g, ":");
      const [hour, minute] = clean.split(":");
      if (!hour || !minute) return "--.--";
      return `${hour.padStart(2, "0")}.${minute.padStart(2, "0")}`;
    };

    if (!visible || !absenData) {
      return null;
    }

    const currentIP = absenData?.ipAddress || "";
    console.log("IP address dikirim ke backend:", currentIP);

    return (
      <LocationCard
        jamDatang={absenData?.jamDatang}
        jamKeluar={absenData?.jamKeluar}
        lokasi={locationName}
        currentIP={absenData?.ipAddress}
        wifiName={wifiName}
        isCheckedOut={isCheckedOut}
        checkinStatus={absenData?.checkinStatus} 
        checkoutStatus={absenData?.checkoutStatus} 
      />
    );
  }
);

StatusAbsen.displayName = "StatusAbsen";

export default StatusAbsen;
