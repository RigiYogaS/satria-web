"use client";

import { Clock, MapPin, Wifi, CircleAlert } from "lucide-react";

// Add currentIP prop to interface
interface LocationCardProps {
  jamDatang?: string;
  jamKeluar?: string;
  lokasi?: string;
  ipAddress?: string;
  currentIP?: string; // Add this
  isCheckedOut?: boolean;
}

const LocationCard = ({
  jamDatang = "",
  jamKeluar = "--.--.--",
  lokasi = "",
  ipAddress = "192.168.1.100",
  currentIP = "192.168.200.53", // Add this with default
  isCheckedOut = false,
}: LocationCardProps) => {
  const isValidNetwork = currentIP === "192.168.200.53";

  return (
    <div className="bg-white rounded-lg shadow-md border p-6 max-w-md mx-auto min-h-[500px]">
      {/* Header */}
      <h2 className="text-3xl font-bold text-navy-500 mb-9 text-center">
        Status Absensi
      </h2>

      {/* Jam Datang dan Jam Keluar */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Jam Datang */}
        <div className="flex p-2">
          <Clock className="text-navy-500 " size={44} />
          <div className="flex flex-col mx-2">
            <span className="text-sm text-neutral-400">Jam Datang</span>
            <p className="text-xl font-semibold text-navy-500">{jamDatang}</p>
          </div>
        </div>

        {/* Jam Keluar */}
        <div className="flex p-2">
          <Clock className="text-navy-500 " size={44} />
          <div className="flex flex-col mx-2">
            <span className="text-sm text-neutral-400">Jam Keluar</span>
            <p className="text-xl font-semibold text-navy-500">{jamKeluar}</p>
          </div>
        </div>
      </div>

      <div className="my-9">
        {/* Lokasi */}
        <div className="mb-6 flex">
          <MapPin
            className="text-navy-500 mr-2 mt-0.5 flex-shrink-0"
            size={40}
          />
          <div>
            <span className="text-sm text-neutral-400">Lokasi</span>
            <p className="text-sm text-neutral-700 leading-relaxed ">
              {lokasi}
            </p>
          </div>
        </div>

        {/* IP Address */}
        <div className="mb-6 flex bg-neutral-">
          <Wifi className="text-navy-500 mr-2 mt-0.5 flex-shrink-0" size={40} />
          <div>
            <span className="text-sm text-neutral-400">IP Address</span>
            <p className="text-sm font-mono text-neutral-700 leading-relaxed ">
              {ipAddress}
            </p>
          </div>
        </div>
      </div>

      {/* Network Info */}
      <div className="mb-6 flex">
        <Wifi
          className={`mr-2 mt-0.5 flex-shrink-0 ${
            isValidNetwork ? "text-green-600" : "text-red-600"
          }`}
          size={40}
        />
        <div>
          <span className="text-sm text-neutral-400">Jaringan</span>
          <p className="text-sm font-mono text-neutral-700 leading-relaxed">
            {currentIP}
          </p>
          <p
            className={`text-xs mt-1 ${
              isValidNetwork ? "text-green-600" : "text-red-600"
            }`}
          >
            {isValidNetwork ? "✅ Jaringan kantor" : "❌ Jaringan tidak valid"}
          </p>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex">
        <div
          className={`flex w-full justify-center items-center px-4 py-3 rounded-md text-md font-medium ${
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
