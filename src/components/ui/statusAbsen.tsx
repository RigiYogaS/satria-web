"use client";

import { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import LocationCard from "./locationCard";

interface AbsenData {
  jamDatang: string;
  tanggal: string;
  lokasi: string;
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
      useState<string>(checkOutTime);
    const [isVisible, setIsVisible] = useState<boolean>(false);

    // Mock IP address untuk development
    const mockIpAddress = "192.168.200.53.0.0.1";

    useImperativeHandle(ref, () => ({
      triggerCheckIn: (data: AbsenData) => {
        console.log("📍 StatusAbsen received check in data:", data);
        setAbsenData(data);
        setIsVisible(true);
      },
      triggerCheckOut: (data: AbsenData) => {
        console.log("📍 StatusAbsen received check out data:", data);
        setCurrentCheckOutTime(data.jamDatang);
      },
    }));

    // Update check out time from props
    useEffect(() => {
      if (checkOutTime !== "00.00 WIB") {
        setCurrentCheckOutTime(checkOutTime);
      }
    }, [checkOutTime]);

    if (!isVisible || !absenData) {
      return null;
    }

    return (
        <LocationCard
          jamDatang={absenData.jamDatang}
          jamKeluar={currentCheckOutTime}
          lokasi={absenData.lokasi}
          ipAddress={mockIpAddress}
          isCheckedOut={isCheckedOut}
        />
    );
  }
);

StatusAbsen.displayName = "StatusAbsen";

export default StatusAbsen;
