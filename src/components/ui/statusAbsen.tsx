"use client";

import { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import LocationCard from "./locationCard";

interface AbsenData {
  jamDatang: string;
  tanggal: string;
  lokasi?: string;
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface StatusAbsenHandle {
  triggerCheckIn: (absenData: AbsenData) => void;
  triggerCheckOut: (absenData: AbsenData) => void;
}

interface StatusAbsenProps {
  checkOutTime?: string;
  isCheckedOut?: boolean;
}

const StatusAbsen = forwardRef<StatusAbsenHandle, StatusAbsenProps>(
  ({ checkOutTime = "00.00 WIB", isCheckedOut = false }, ref) => {
    const [absenData, setAbsenData] = useState<AbsenData | null>(null);
    const [currentCheckOutTime, setCurrentCheckOutTime] =
      useState<string>("--.--.--");
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [localCheckedOut, setLocalCheckedOut] =
      useState<boolean>(isCheckedOut);

    const mockIpAddress = "192.168.200.53";

    useImperativeHandle(ref, () => ({
      triggerCheckIn: (data: AbsenData) => {
        console.log("📍 StatusAbsen received check in data:", data);
        setAbsenData(data);
        setIsVisible(true); // ✅ MAKE SURE THIS IS SET TO TRUE
        setLocalCheckedOut(false);
        setCurrentCheckOutTime("--.--.--");
      },
      triggerCheckOut: (data: AbsenData) => {
        console.log("📍 StatusAbsen received check out data:", data);
        console.log("🕐 Setting checkout time to:", data.jamDatang);
        setCurrentCheckOutTime(data.jamDatang);
        setLocalCheckedOut(true);
      },
    }));

    // ✅ ADD DEBUG LOGGING TO TRACK STATE CHANGES
    useEffect(() => {
      console.log("🔍 StatusAbsen state:", {
        isVisible,
        absenData: !!absenData,
        localCheckedOut,
        currentCheckOutTime,
      });
    }, [isVisible, absenData, localCheckedOut, currentCheckOutTime]);

    useEffect(() => {
      setLocalCheckedOut(isCheckedOut);
      if (isCheckedOut && checkOutTime !== "00.00 WIB") {
        setCurrentCheckOutTime(checkOutTime);
      }
    }, [isCheckedOut, checkOutTime]);

    // ✅ ADD FALLBACK RENDERING FOR DEBUGGING
    console.log("🔍 StatusAbsen render check:", {
      isVisible,
      hasAbsenData: !!absenData,
      absenData,
    });

    if (!isVisible || !absenData) {
      // ✅ SHOW DEBUG INFO INSTEAD OF RETURNING NULL
      console.log("❌ StatusAbsen not visible:", { isVisible, absenData });
      return (
        <div className="w-full bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-700 text-sm">
            🔍 DEBUG: StatusAbsen tidak tampil
          </p>
          <p className="text-xs">
            {`isVisible: ${isVisible}, absenData: ${absenData}`}
          </p>
        </div>
      );
    }

    return (
      <LocationCard
        jamDatang={absenData.jamDatang}
        jamKeluar={currentCheckOutTime}
        lokasi={absenData.lokasi}
        currentIP={mockIpAddress}
        isCheckedOut={localCheckedOut}
        latitude={absenData.latitude}
        longitude={absenData.longitude}
        accuracy={absenData.accuracy}
      />
    );
  }
);

StatusAbsen.displayName = "StatusAbsen";

export default StatusAbsen;
