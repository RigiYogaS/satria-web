"use client";

import { useState, useEffect, useCallback } from "react";

interface IPLokasiData {
  id: number;
  ip: string; // dapat berupa "192.168.1.5", "192.168.1." (prefix) atau "192.168.1.0/24"
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

  // helper: simple match supporting exact, prefix (ending with '.') and /24
  const ipMatches = (pattern: string, ip: string | null): boolean => {
    if (!pattern || !ip) return false;
    // exact
    if (pattern === ip) return true;
    // prefix like "192.168.1." => startsWith
    if (pattern.endsWith(".")) return ip.startsWith(pattern);
    // CIDR /24 naive: compare first 3 octets
    if (pattern.includes("/")) {
      const [net, maskStr] = pattern.split("/");
      const mask = Number(maskStr || 0);
      if (mask === 24) {
        const netParts = net.split(".").slice(0, 3).join(".");
        const ipParts = ip.split(".").slice(0, 3).join(".");
        return netParts === ipParts;
      }
      // jika perlu dukungan mask lain, tambahkan logika di sini
    }
    return false;
  };

  // Function untuk get IP lokal user
  const getCurrentUserIP = async (): Promise<string | null> => {
    try {
      try {
        const webrtcIP = await new Promise<string | null>((resolve) => {
          const pc = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
          });
          pc.createDataChannel("");
          let resolved = false;
          pc.onicecandidate = (ice) => {
            if (resolved) return;
            if (!ice || !ice.candidate || !ice.candidate.candidate) return;
            const match = /([0-9]{1,3}(\.[0-9]{1,3}){3})/.exec(
              ice.candidate.candidate
            );
            if (match && match[1]) {
              const ip = match[1];
              if (
                ip.startsWith("192.168.") ||
                ip.startsWith("10.") ||
                /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip)
              ) {
                resolved = true;
                try {
                  pc.close();
                } catch {}
                resolve(ip);
              }
            }
          };
          pc.createOffer()
            .then((offer) => pc.setLocalDescription(offer))
            .catch(() => {
              try {
                pc.close();
              } catch {}
              resolve(null);
            });
          setTimeout(() => {
            if (!resolved) {
              try {
                pc.close();
              } catch {}
              resolve(null);
            }
          }, 2500);
        });
        if (webrtcIP) return webrtcIP;
      } catch (err) {
        console.warn("WebRTC IP failed:", err);
      }

      try {
        const ipifyResponse = await fetch("https://api.ipify.org?format=json");
        if (ipifyResponse.ok) {
          const ipifyData = await ipifyResponse.json();
          if (ipifyData?.ip) return ipifyData.ip as string;
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

  const getAllowedWifiLocations = async (): Promise<IPLokasiData[]> => {
    try {
      const response = await fetch("/api/ip-lokasi");
      if (!response.ok) throw new Error("Failed to fetch allowed locations");

      const body = await response.json();
      if (Array.isArray(body)) return body;
      if (body && Array.isArray(body.data)) return body.data;
      return [];
    } catch (err) {
      console.error("Error fetching allowed wifi locations:", err);
      return [];
    }
  };

  async function getDetectedIPs(): Promise<string[]> {
    const ips = new Set<string>();
    try {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      pc.createDataChannel("");
      pc.onicecandidate = (e) => {
        if (!e.candidate || !e.candidate.candidate) return;
        const m = /([0-9]{1,3}(\.[0-9]{1,3}){3})/.exec(e.candidate.candidate);
        if (m && m[1]) ips.add(m[1]);
      };
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        await new Promise((r) => setTimeout(r, 1800));
      } catch (err) {}
      try {
        pc.close();
      } catch {}
    } catch (err) {
      console.warn("webrtc failed", err);
    }

    try {
      const r = await fetch("/api/get-public-ip");
      if (r.ok) {
        const j = await r.json();
        if (j?.ip) ips.add(j.ip);
      }
    } catch (err) {
      console.warn("get-public-ip failed", err);
    }

    return Array.from(ips);
  }

  const validateWifiConnection = useCallback(async (): Promise<void> => {
    setWifiValidationLoading(true);
    try {
      const detected = await getDetectedIPs();
      console.log("Detected IPs:", detected);
      setCurrentIP(detected.join(", "));
      const allowed = await getAllowedWifiLocations();
      setAllowedWifiList(allowed);
      const matched = allowed.find((loc) =>
        detected.some((ip) => ipMatches(loc.ip, ip))
      );
      if (matched) {
        setIsValidWifi(true);
        setConnectedWifiName(matched.nama_wifi);
      } else {
        setIsValidWifi(false);
        setConnectedWifiName(null);
      }
    } catch (err) {
      console.error(err);
      setIsValidWifi(false);
      setConnectedWifiName(null);
    } finally {
      setWifiValidationLoading(false);
    }
  }, []);

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
