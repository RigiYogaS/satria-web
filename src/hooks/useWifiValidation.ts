"use client";

import { useState, useEffect, useCallback } from "react";

interface IPLokasiData {
  id: number;
  ip: string;
  nama_wifi: string;
  created_at: string;
}

interface WifiValidationResult {
  currentIP: string | null;
  isValidWifi: boolean;
  wifiValidationLoading: boolean;
  allowedWifiList: IPLokasiData[];
  connectedWifiName: string | null;
  validateWifiConnection: () => Promise<void>;
}

export const useWifiValidation = (): WifiValidationResult => {
  const [currentIP, setCurrentIP] = useState<string | null>(null);
  const [isValidWifi, setIsValidWifi] = useState<boolean>(false);
  const [wifiValidationLoading, setWifiValidationLoading] =
    useState<boolean>(true);
  const [allowedWifiList, setAllowedWifiList] = useState<IPLokasiData[]>([]);
  const [connectedWifiName, setConnectedWifiName] = useState<string | null>(
    null
  );

  // Function untuk get IP lokal user
  const getCurrentUserIP = async (): Promise<string | null> => {
    try {
      // Method 1: API lokal
      try {
        const localResponse = await fetch("/api/get-network-ip");
        const localData = await localResponse.json();
        if (localData.ip) {
          console.log("🏠 Local IP dari API:", localData.ip);
          return localData.ip;
        }
      } catch (err) {
        console.warn("Local IP API failed:", err);
      }

      // Method 2: WebRTC
      try {
        const webrtcIP = await new Promise<string | null>((resolve) => {
          const pc = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
          });

          pc.createDataChannel("");

          pc.onicecandidate = (ice) => {
            if (!ice || !ice.candidate || !ice.candidate.candidate) return;

            const myIP =
              /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/.exec(
                ice.candidate.candidate
              );

            if (myIP && myIP[1]) {
              const ip = myIP[1];
              console.log("🌐 WebRTC Local IP:", ip);

              if (
                ip.startsWith("192.168.") ||
                ip.startsWith("10.") ||
                /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip)
              ) {
                pc.close();
                resolve(ip);
                return;
              }
            }
          };

          pc.createOffer().then((offer) => pc.setLocalDescription(offer));

          setTimeout(() => {
            pc.close();
            resolve(null);
          }, 3000);
        });

        if (webrtcIP) return webrtcIP;
      } catch (err) {
        console.warn("WebRTC IP failed:", err);
      }

      // Method 3: ipify (public IP)
      try {
        const ipifyResponse = await fetch("https://api.ipify.org?format=json");
        const ipifyData = await ipifyResponse.json();
        if (ipifyData.ip) {
          console.log("🌎 Public IP dari ipify:", ipifyData.ip);
          return ipifyData.ip;
        }
      } catch (err) {
        console.warn("ipify failed:", err);
      }

      return null;
    } catch (err) {
      console.error("Error getting IP:", err);
      return null;
    }
  };

  // Function untuk get allowed locations
  const getAllowedWifiLocations = async (): Promise<IPLokasiData[]> => {
    try {
      const response = await fetch("/api/ip-lokasi");
      if (!response.ok) throw new Error("Failed to fetch allowed locations");

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error("Error fetching allowed wifi locations:", err);
      return [];
    }
  };

  // Function untuk validasi Wi-Fi
  const validateWifiConnection = useCallback(async (): Promise<void> => {
    setWifiValidationLoading(true);

    try {
      const userIP = await getCurrentUserIP();
      console.log("🔍 Current User IP:", userIP);
      setCurrentIP(userIP);

      const allowedLocations = await getAllowedWifiLocations();
      console.log("📋 Allowed Locations:", allowedLocations);
      setAllowedWifiList(allowedLocations);

      const matchedLocation = allowedLocations.find(
        (location) => location.ip === userIP
      );
      console.log("🎯 Matched Location:", matchedLocation);

      if (matchedLocation) {
        setIsValidWifi(true);
        setConnectedWifiName(matchedLocation.nama_wifi);
        console.log("✅ Wi-Fi Valid!");
      } else {
        setIsValidWifi(false);
        setConnectedWifiName(null);
        console.log("❌ Wi-Fi Not Valid");
      }
    } catch (error) {
      console.error("Wi-Fi validation error:", error);
      setIsValidWifi(false);
      setConnectedWifiName(null);
    } finally {
      setWifiValidationLoading(false);
    }
  }, []);

  // Auto-validate on mount and interval
  useEffect(() => {
    validateWifiConnection();

    const interval = setInterval(() => {
      validateWifiConnection();
    }, 60000);

    return () => clearInterval(interval);
  }, [validateWifiConnection]);

  return {
    currentIP,
    isValidWifi,
    wifiValidationLoading,
    allowedWifiList,
    connectedWifiName,
    validateWifiConnection,
  };
};
