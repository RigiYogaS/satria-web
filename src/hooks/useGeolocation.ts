// hooks/useGeolocation.ts
"use client";

import { useState, useCallback } from "react";

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  accuracy: number;
}

export const useGeolocation = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Reverse geocoding menggunakan environment variables
  const reverseGeocode = async (lat: number, lon: number): Promise<string> => {
    try {
      const nominatimUrl =
        process.env.NEXT_PUBLIC_NOMINATIM_URL ||
        "https://nominatim.openstreetmap.org/reverse";
      const appName = process.env.NEXT_PUBLIC_APP_NAME || "SATRIA-Absensi";
      const appVersion = process.env.NEXT_PUBLIC_APP_VERSION || "1.0";

      const url = new URL(nominatimUrl);
      url.searchParams.set("lat", lat.toString());
      url.searchParams.set("lon", lon.toString());
      url.searchParams.set("format", "json");
      url.searchParams.set("addressdetails", "1");
      url.searchParams.set("accept-language", "id");
      url.searchParams.set("zoom", "18");

      const response = await fetch(url.toString(), {
        headers: {
          "User-Agent": `${appName}/${appVersion}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      return data.display_name || `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      return `Koordinat: ${lat.toFixed(6)}, ${lon.toFixed(6)}`;
    }
  };

  // Fixed getCurrentLocation - SELALU TERIMA LOKASI
  const getCurrentLocation = useCallback(() => {
    setLoading(true);
    setError(null);

    console.log("🚀 Starting GPS request...");

    if (!navigator.geolocation) {
      setError("Browser tidak mendukung GPS");
      setLoading(false);
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 15000, // 15 detik
      maximumAge: 10000, // Allow 10 second cache
    };

    // Function to handle position - SELALU SET LOCATION
    const handlePosition = async (position: GeolocationPosition) => {
      const { latitude, longitude, accuracy } = position.coords;

      console.log(
        `🎯 GPS Position received: ${latitude}, ${longitude} (±${accuracy}m)`
      );

      try {
        console.log("🔍 Starting reverse geocoding...");
        const address = await reverseGeocode(latitude, longitude);
        console.log("📍 Address resolved:", address);

        // SELALU SET LOCATION APAPUN ACCURACY-NYA
        const locationData = {
          latitude,
          longitude,
          address,
          accuracy,
        };

        console.log("✅ Setting location data:", locationData);
        setLocation(locationData);
      } catch (err) {
        console.warn("Geocoding failed, using coordinates only:", err);
        const fallbackData = {
          latitude,
          longitude,
          address: `Koordinat: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          accuracy,
        };

        console.log("✅ Setting fallback location data:", fallbackData);
        setLocation(fallbackData);
      }

      setLoading(false);
      console.log("🏁 GPS process completed");
    };

    // Simplified error handling
    const handleError = (error: GeolocationPositionError) => {
      console.error(`❌ GPS Error (Code ${error.code}):`, error.message);

      let errorMessage = "";

      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = "Izin lokasi ditolak. Aktifkan GPS dan izin lokasi.";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = "Sinyal GPS tidak tersedia. Coba di area terbuka.";
          break;
        case error.TIMEOUT:
          errorMessage = "GPS timeout. Pastikan GPS aktif dan coba lagi.";
          break;
        default:
          errorMessage = "Gagal mendapatkan lokasi.";
          break;
      }

      setError(errorMessage);
      setLoading(false);
    };

    // Single attempt - no retries for simplicity
    console.log("📡 Requesting GPS position...");
    navigator.geolocation.getCurrentPosition(
      handlePosition,
      handleError,
      options
    );
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    location,
    loading,
    error,
    getCurrentLocation,
    clearError,
  };
};
