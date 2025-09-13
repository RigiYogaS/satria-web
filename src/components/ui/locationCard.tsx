"use client";

import { Clock, MapPin, Wifi, CircleAlert } from "lucide-react";

interface LocationCardProps {
  jamDatang?: string;
  jamKeluar?: string;
  lokasi?: string;
  ipAddress?: string;
  currentIP?: string;
  isCheckedOut?: boolean;
}

const LocationCard = ({
  jamDatang = "",
  jamKeluar = "--.--.--",
  lokasi = "",
  currentIP = "192.168.200.53",
  isCheckedOut = false,
}: LocationCardProps) => {
  const isValidNetwork = currentIP === "192.168.200.53";

  return (
    <div className="bg-white rounded-lg shadow-md border p-6 mx-auto w-full h-[615px] flex flex-col justify-between">

      {/* Content wrapper */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <h2 className="text-3xl font-bold text-navy-500 text-center">
          Status Absensi
        </h2>

        {/* Jam Datang dan Jam Keluar */}
        <div className="grid grid-cols-2 gap-6 mt-6">
          <div className="flex p-2">
            <Clock className="text-navy-500" size={44} />
            <div className="flex flex-col mx-2">
              <span className="text-sm text-neutral-400">Jam Datang</span>
              <p className="text-xl font-semibold text-navy-500">{jamDatang}</p>
            </div>
          </div>

          <div className="flex p-2">
            <Clock className="text-navy-500" size={44} />
            <div className="flex flex-col mx-2">
              <span className="text-sm text-neutral-400">Jam Keluar</span>
              <p className="text-xl font-semibold text-navy-500">{jamKeluar}</p>
            </div>
          </div>
        </div>

        {/* Lokasi */}
        <div className="mt-6 flex">
          <MapPin
            className="text-navy-500 mr-2 mt-0.5 flex-shrink-0"
            size={40}
          />
          <div>
            <span className="text-sm text-neutral-400">Lokasi</span>
            <p className="text-sm text-neutral-700 leading-relaxed">{lokasi}</p>
          </div>
        </div>

        {/* Network Info */}
        <div className="mt-6 flex">
          <Wifi
            className={`mr-2 mt-0.5 flex-shrink-0 ${
              isValidNetwork ? "text-navy-500" : "text-neutral-200"
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
              {isValidNetwork ? "Jaringan kantor" : "Jaringan tidak valid"}
            </p>
          </div>
        </div>
      </div>

      {/* Status Badge - fixed position di bawah */}
      <div className="flex-shrink-0 mt-4">
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
