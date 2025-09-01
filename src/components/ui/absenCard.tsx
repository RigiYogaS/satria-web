"use client";

import { Clock7, Calendar, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

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
  onCheckIn?: () => void;
}

const AbsenCard: React.FC<AbsenCardProps> = ({ onCheckIn }) => {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isCheckingIn, setIsCheckingIn] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date());

    // Update time setiap detik
    const timer: NodeJS.Timeout = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Cleanup interval saat component unmount
    return (): void => clearInterval(timer);
  }, []);

  // Format jam (HH:MM:SS)
  const formatTime = (date: Date): string => {
    const options: TimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    };
    return date.toLocaleTimeString("id-ID", options);
  };

  // Format tanggal (DD/MM/YYYY)
  const formatDate = (date: Date): string => {
    const options: DateFormatOptions = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    };
    return date.toLocaleDateString("id-ID", options);
  };

  const handleCheckIn = async (): Promise<void> => {
    setIsCheckingIn(true);

    try {
      // Validasi jaringan terlebih dahulu
      const response = await fetch("/api/get-ip");
      const networkData = await response.json();

      if (!networkData.canAttend) {
        alert(`❌ Absensi Tidak Dapat Dilakukan!\n\n${networkData.message}`);
        setIsCheckingIn(false);
        return;
      }

      // Jika jaringan valid, lanjutkan check in
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (onCheckIn) {
        onCheckIn();
      }
    } catch (error) {
      console.error("Error during check in:", error);
      alert(
        "❌ Terjadi kesalahan. Pastikan Anda terhubung ke jaringan kantor."
      );
    } finally {
      setIsCheckingIn(false);
    }
  };

  // Jangan render sampai component mounted di client
  if (!mounted) {
    return (
      <div className="bg-white w-1/2 p-4 rounded-lg shadow flex flex-col gap-6">
        <h2 className="text-2xl font-bold mb-4 text-navy-500 text-center">
          Absen Kehadiran
        </h2>
        <div className="w-full flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Clock7 className="text-gray-500" size={40} />
            <div>
              <span className="text-sm text-gray-500">Jam</span>
              <p className="text-xl font-semibold">--:--:--</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="text-gray-500" size={40} />
            <div>
              <span className="text-sm text-gray-500">Tanggal</span>
              <p className="text-lg font-semibold">--/--/----</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <MapPin size={16} />
          <span>Pastikan Anda berada di lokasi kantor</span>
        </div>
        <Button disabled className="bg-gray-300 w-full">
          Loading...
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white w-1/2 p-4 rounded-lg shadow flex flex-col gap-6">
      <h2 className="text-2xl font-bold mb-4 text-navy-500 text-center">
        Absen Kehadiran
      </h2>
      <div className="w-full flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Clock7 className="text-gray-500" size={40} />
          <div>
            <span className="text-sm text-gray-500">Jam</span>
            <p className="text-xl font-semibold">
              {mounted && currentTime ? formatTime(currentTime) : "--:--:--"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="text-gray-500" size={40} />
          <div>
            <span className="text-sm text-gray-500">Tanggal</span>
            <p className="text-lg font-semibold">
              {mounted && currentTime ? formatDate(currentTime) : "--/--/----"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
        <MapPin size={16} />
        <span>Pastikan Anda berada di lokasi kantor</span>
      </div>

      <Button
        onClick={handleCheckIn}
        disabled={isCheckingIn}
        className="bg-green-500 hover:bg-green-600 w-full"
      >
        {isCheckingIn ? "Memproses..." : "Check In"}
      </Button>
    </div>
  );
};

export default AbsenCard;
