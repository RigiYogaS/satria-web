"use client";

import { useState, useEffect } from "react";

export const useLocalIP = () => {
  const [localIP, setLocalIP] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const getLocalIP = async () => {
      setLoading(true);
      try {
        // WebRTC trick to get local IP
        const pc = new RTCPeerConnection({ iceServers: [] });
        pc.createDataChannel("");
        pc.createOffer().then((offer) => pc.setLocalDescription(offer));
        pc.onicecandidate = (event) => {
          if (!event || !event.candidate || !event.candidate.candidate) return;
          const ipMatch = event.candidate.candidate.match(
            /([0-9]{1,3}(\.[0-9]{1,3}){3})/
          );
          if (ipMatch && ipMatch[1] && isMounted) {
            setLocalIP(ipMatch[1]);
            pc.close();
            setLoading(false);
          }
        };
        // Timeout fallback
        setTimeout(() => {
          if (isMounted) setLoading(false);
          pc.close();
        }, 4000);
      } catch {
        if (isMounted) setLoading(false);
      }
    };

    getLocalIP();
    return () => {
      isMounted = false;
    };
  }, []);

  return { localIP, loading };
};
