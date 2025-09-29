"use client";

import { Clock, MapPin, Wifi, CircleAlert } from "lucide-react";
import { useEffect, useState } from "react";

interface LocationCardProps {
  jamDatang?: string;
  jamKeluar?: string;
  lokasi?: string;
  currentIP?: string;
  wifiName?: string;
  isCheckedOut?: boolean;
}

const LocationCard = ({
  jamDatang = "",
  jamKeluar = "--.--.--",
  lokasi = "",
  currentIP = "",
  wifiName: wifiNameProp = "",
  isCheckedOut = false,
}: LocationCardProps) => {
  const [wifiName, setWifiName] = useState<string>(wifiNameProp);

  useEffect(() => {
    if (wifiNameProp) {
      setWifiName(wifiNameProp);
      return;
    }
    if (!currentIP) {
      setWifiName("");
      return;
    }
    const fetchWifiName = async () => {
      try {
        const res = await fetch(`/api/ip-lokasi?ip=${currentIP}`);
        const data = await res.json();
        setWifiName(data.nama_wifi || "");
      } catch {
        setWifiName("");
      }
    };
    fetchWifiName();
  }, [wifiNameProp, currentIP]);

  return (
    <div className="bg-white rounded-lg shadow-md border p-6 mx-auto w-full h-[620px] flex flex-col justify-between">
      <div className="flex-1 overflow-y-auto">
        <h2 className="md:text-3xl text-2xl font-bold text-navy-500 text-center">
          Status Absensi
        </h2>

        <div className="grid grid-cols-2 gap-6 mt-6">
          <div className="flex p-2">
            <Clock className="text-navy-500 md:size-10 hidden md:block" />
            <div className="flex flex-col mx-2">
              <span className="md:text-sm text-xs text-neutral-400">
                Jam Datang
              </span>
              <p className="md:text-xl text-lg font-semibold text-navy-500">
                {jamDatang || "--.--.--"}
              </p>
            </div>
          </div>

          <div className="flex p-2">
            <Clock className="text-navy-500 md:size-10 hidden md:block" />
            <div className="flex flex-col mx-2">
              <span className="md:text-sm text-xs text-neutral-400">
                Jam Keluar
              </span>
              <p className="md:text-xl text-lg font-semibold text-navy-500 ">
                {jamKeluar || "--.--"}
              </p>
            </div>
          </div>
        </div>

        {/* Lokasi */}
        <div className="mt-6 flex items-center gap-2">
          <MapPin className="text-navy-500 mr-2 mt-0.5 flex-shrink-0 md:size-10 size-6" />
          <span className="md:text-sm text-xs text-neutral-700 leading-relaxed">
            {lokasi || "Lokasi tidak tersedia"}
          </span>
        </div>

        {/* Network Info */}
        <div className="mt-6 flex items-center gap-2">
          <Wifi className="mr-2 mt-0.5 flex-shrink-0 text-navy-500 md:size-10 size-6" />
          <span className="md:text-sm text-xs text-neutral-700 leading-relaxed">
            {wifiName ? <span>{wifiName}</span> : <span>Tidak terdeteksi</span>}
          </span>
        </div>
      </div>

      <div className="flex-shrink-0 mt-4">
        <div
          className={`flex w-full justify-center items-center px-4 py-3 rounded-md md:text-base  text-sm font-medium ${
            isCheckedOut
              ? "bg-green-200 text-green-800"
              : "bg-amber-100 text-amber-600"
          }`}
        >
          <CircleAlert className="mr-2" size={20} />
          {isCheckedOut ? "Sudah Checkout" : "Belum Checkout"}
        </div>
      </div>
    </div>
  );
};

export default LocationCard;
