"use client";

import { useState, useEffect, useCallback } from "react";
import { matchIpPattern, cleanIpString } from "@/lib/ip";

interface IPLokasiData {
  id: number;
  ip: string;
  created_at: string;
  nama_wifi: string;
}

interface WifiValidationResult {
  currentIP: string | null;
  isValidWifi: boolean;
  wifiValidationLoading: boolean;
  allowedWifiList: IPLokasiData[];
  connectedWifiName: string | null;
  detectedList: string[];
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
  const [detectedList, setDetectedList] = useState<string[]>([]);

  const isPrivate = (ip: string) => {
    const p = cleanIpString(ip) ?? ip;
    return (
      p.startsWith("10.") ||
      p.startsWith("192.168.") ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(p)
    );
  };

  function pickBestPublicIP(detected: string[]): string | null {
    if (!detected || detected.length === 0) return null;
    const cleaned = detected.map((d) => cleanIpString(d) ?? d);
    const publicIp = cleaned.find((ip) => !isPrivate(ip));
    if (publicIp) return publicIp;
    return cleaned[0] ?? null;
  }

  async function getDetectedIPs(): Promise<string[]> {
    const ips = new Set<string>();

    // 1) client-side public IP (ipify) - high priority
    try {
      console.log("[detect] trying ipify...");
      const r = await fetch("https://api.ipify.org?format=json", {
        cache: "no-store",
      });
      console.log("[detect] ipify status", r.status);
      if (r.ok) {
        const j = await r.json();
        console.log("[detect] ipify json", j);
        if (j?.ip) ips.add(j.ip);
      } else {
        console.warn("[detect] ipify non-ok", await r.text().catch(() => null));
      }
    } catch (err) {
      console.warn("[detect] ipify error", err);
    }

    // 2) server get-public-ip
    try {
      console.log("[detect] trying /api/get-public-ip...");
      const r2 = await fetch("/api/get-public-ip", { cache: "no-store" });
      console.log("[detect] get-public-ip status", r2.status);
      if (r2.ok) {
        const j2 = await r2.json();
        console.log("[detect] get-public-ip json", j2);
        if (j2?.ip) ips.add(j2.ip);
      } else {
        console.warn(
          "[detect] get-public-ip non-ok",
          await r2.text().catch(() => null)
        );
      }
    } catch (err) {
      console.warn("[detect] get-public-ip error", err);
    }

    // 3) echo-ip (server headers) — keep for debug
    try {
      console.log("[detect] trying /api/echo-ip...");
      const r3 = await fetch("/api/echo-ip", { cache: "no-store" });
      console.log("[detect] echo-ip status", r3.status);
      if (r3.ok) {
        const j3 = await r3.json();
        console.log("[detect] echo-ip json", j3);
        // attempt several possible fields
        if (j3?.ip) ips.add(j3.ip);
        else if (j3?.debug?.headersSample) {
          const xf =
            j3.debug.headersSample["x-forwarded-for"] ??
            j3.debug.headersSample["x-client-ip"];
          if (xf) ips.add(String(xf).split(",")[0].trim());
        }
      } else {
        console.warn(
          "[detect] echo-ip non-ok",
          await r3.text().catch(() => null)
        );
      }
    } catch (err) {
      console.warn("[detect] echo-ip error", err);
    }

    // 4) last resort: WebRTC candidates (low priority)
    try {
      console.log("[detect] trying WebRTC candidates...");
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      } as any);
      try {
        pc.createDataChannel("");
      } catch {}
      pc.onicecandidate = (e: any) => {
        try {
          if (!e?.candidate?.candidate) return;
          const m = /([0-9]{1,3}(\.[0-9]{1,3}){3})/.exec(e.candidate.candidate);
          if (m && m[1]) {
            console.log("[detect][webrtc] candidate", m[1]);
            ips.add(m[1]);
          }
        } catch (e) {
          console.warn("[detect][webrtc] candidate error", e);
        }
      };
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await new Promise((r) => setTimeout(r, 1600));
      try {
        pc.close();
      } catch {}
    } catch (err) {
      console.warn("[detect] webrtc error", err);
    }

    const result = Array.from(ips);
    console.log("[detect] final detected ip list:", result);
    return result;
  }

  const validateWifiConnection = useCallback(async (): Promise<void> => {
    setWifiValidationLoading(true);
    try {
      // optional: refresh allowed list for UI
      (async () => {
        try {
          const r = await fetch("/api/ip-lokasi");
          if (r.ok) {
            const j = await r.json();
            if (Array.isArray(j)) setAllowedWifiList(j as IPLokasiData[]);
          }
        } catch {}
      })();

      let detected = await getDetectedIPs();
      if (!detected.length) {
        await new Promise((r) => setTimeout(r, 1000));
        detected = await getDetectedIPs();
      }

      console.log("Detected IPs:", detected);
      setDetectedList(detected);
      const best = pickBestPublicIP(detected);
      setCurrentIP(best ?? (detected.length ? detected.join(", ") : null));

      // server-side validation (authoritative)
      try {
        const resp = await fetch("/api/validate-wifi", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            detected,
            clientIp: best ?? null,
            userId: null,
          }),
        });
        if (resp.ok) {
          const j = await resp.json();
          if (j?.ok) {
            setIsValidWifi(true);
            setConnectedWifiName(j.nama_wifi ?? null);
          } else {
            setIsValidWifi(false);
            setConnectedWifiName(null);
          }
        } else {
          setIsValidWifi(false);
          setConnectedWifiName(null);
        }
      } catch (err) {
        console.warn("validate-wifi request failed", err);
        setIsValidWifi(false);
        setConnectedWifiName(null);
      }

      // continue logging to /api/log-detected if you want (non-blocking)
      try {
        await fetch("/api/log-detected", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            detected,
            clientIp: best ?? null,
            userAgent:
              typeof navigator !== "undefined" ? navigator.userAgent : null,
            userId: null,
          }),
        });
      } catch (err) {
        console.warn("log-detected failed", err);
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
    const interval = setInterval(() => validateWifiConnection(), 60000);
    return () => clearInterval(interval);
  }, [validateWifiConnection]);

  return {
    currentIP,
    isValidWifi,
    wifiValidationLoading,
    allowedWifiList,
    connectedWifiName,
    detectedList,
    validateWifiConnection,
  };
};
