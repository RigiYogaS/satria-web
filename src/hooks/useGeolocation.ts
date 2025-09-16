// hooks/useGeolocation.ts
"use client";

import { useState, useCallback } from "react";

interface GeolocationState {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export const useGeolocation = () => {
  const [location, setLocation] = useState<GeolocationState | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = useCallback((): Promise<GeolocationState> => {
    return new Promise((resolve, reject) => {
      setLoading(true);
      setError(null);

      if (!navigator.geolocation) {
        const errorMsg = "Geolocation tidak didukung oleh browser ini";
        setError(errorMsg);
        setLoading(false);
        reject(new Error(errorMsg));
        return;
      }

      const handleSuccess = (position: GeolocationPosition) => {
        const locationData: GeolocationState = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };

        setLocation(locationData);
        setLoading(false);
        resolve(locationData);
      };

      const handleError = (error: GeolocationPositionError) => {
        setLoading(false);

        let errorMessage = "";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Akses lokasi ditolak. Silakan izinkan akses lokasi pada browser Anda.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage =
              "Informasi lokasi tidak tersedia. Pastikan GPS aktif.";
            break;
          case error.TIMEOUT:
            errorMessage = "Waktu permintaan lokasi habis. Coba lagi.";
            break;
          default:
            errorMessage = "Terjadi kesalahan saat mengambil lokasi.";
            break;
        }

        console.error(
          "❌ GPS Error (Code " + error.code + "): " + errorMessage
        );
        setError(errorMessage);
        reject(new Error(errorMessage));
      };

      navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000,
      });
    });
  }, []);

  return {
    location,
    loading,
    error,
    getCurrentLocation,
  };
};
