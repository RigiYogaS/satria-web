"use client";

import { useState } from "react";

interface AbsenData {
  jamDatang: string;
  tanggal: string;
  lokasi: string;
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface AbsenLogicResult {
  isProcessing: boolean;
  alertMessage: string;
  showAccuracyAlert: boolean;
  showLocationAlert: boolean;
  showErrorAlert: boolean;
  showLaporanAlert: boolean;
  showWifiAlert: boolean;
  pendingAction: "checkin" | "checkout" | null;
  alertAccuracy: number;
  setAlertMessage: (message: string) => void;
  setShowAccuracyAlert: (show: boolean) => void;
  setShowLocationAlert: (show: boolean) => void;
  setShowErrorAlert: (show: boolean) => void;
  setShowLaporanAlert: (show: boolean) => void;
  setShowWifiAlert: (show: boolean) => void;
  setPendingAction: (action: "checkin" | "checkout" | null) => void;
  setAlertAccuracy: (accuracy: number) => void;
  proceedWithCheckIn: (
    location: any,
    currentTime: Date,
    onCheckIn?: (data: AbsenData) => void
  ) => Promise<void>;
  proceedWithCheckOut: (
    location: any,
    currentTime: Date,
    onCheckOut?: (data: AbsenData) => void
  ) => Promise<void>;
}

export const useAbsenLogic = (): AbsenLogicResult => {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAccuracyAlert, setShowAccuracyAlert] = useState(false);
  const [showLocationAlert, setShowLocationAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [showLaporanAlert, setShowLaporanAlert] = useState(false);
  const [showWifiAlert, setShowWifiAlert] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    "checkin" | "checkout" | null
  >(null);
  const [alertAccuracy, setAlertAccuracy] = useState(0);

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const proceedWithCheckIn = async (
    location: any,
    currentTime: Date,
    onCheckIn?: (data: AbsenData) => void
  ): Promise<void> => {
    if (!location || !currentTime) return;

    setIsProcessing(true);
    try {
      const absenData: AbsenData = {
        jamDatang: formatTime(currentTime),
        tanggal: formatDate(currentTime),
        lokasi: location.address,
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
      };

      if (onCheckIn) {
        await onCheckIn(absenData);
      }
    } catch (error) {
      console.error("Check-in error:", error);
      setAlertMessage("Gagal melakukan check-in. Silakan coba lagi.");
      setShowErrorAlert(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const proceedWithCheckOut = async (
    location: any,
    currentTime: Date,
    onCheckOut?: (data: AbsenData) => void
  ): Promise<void> => {
    if (!location || !currentTime) return;

    setIsProcessing(true);
    try {
      const absenData: AbsenData = {
        jamDatang: formatTime(currentTime),
        tanggal: formatDate(currentTime),
        lokasi: location.address,
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
      };

      if (onCheckOut) {
        await onCheckOut(absenData);
      }
    } catch (error) {
      console.error("Check-out error:", error);
      setAlertMessage("Gagal melakukan check-out. Silakan coba lagi.");
      setShowErrorAlert(true);
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    alertMessage,
    showAccuracyAlert,
    showLocationAlert,
    showErrorAlert,
    showLaporanAlert,
    showWifiAlert,
    pendingAction,
    alertAccuracy,
    setAlertMessage,
    setShowAccuracyAlert,
    setShowLocationAlert,
    setShowErrorAlert,
    setShowLaporanAlert,
    setShowWifiAlert,
    setPendingAction,
    setAlertAccuracy,
    proceedWithCheckIn,
    proceedWithCheckOut,
  };
};
