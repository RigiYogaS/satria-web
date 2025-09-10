"use client";

import { useState, useEffect } from "react";

export const useIPValidation = () => {
  const [currentIP, setCurrentIP] = useState<string | null>(null);
  const [isValidIP, setIsValidIP] = useState(false);
  const [allowedIPs, setAllowedIPs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const checkIP = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/get-ip", { cache: "no-store" });
      const data = await res.json();
      setCurrentIP(data.ip);
      setIsValidIP(data.isValid);
      setAllowedIPs(data.allowed || []);
    } catch {
      setCurrentIP(null);
      setIsValidIP(false);
      setAllowedIPs([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    checkIP();
  }, []);

  return { currentIP, isValidIP, allowedIPs, loading, checkIP };
};
