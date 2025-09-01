"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

interface VerifyOTPProps {
  email: string | null;
}

const VerifyOTP = ({ email }: VerifyOTPProps) => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const router = useRouter();

  // Countdown untuk resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(
          "Email berhasil diverifikasi! Mengalihkan ke halaman login..."
        );
        setTimeout(() => {
          router.push("/auth/login?verified=true");
        }, 2000);
      } else {
        setMessage(data.error || "Terjadi kesalahan");
      }
    } catch (error) {
      console.error("Verification error:", error);
      setMessage("Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("OTP baru telah dikirim ke email Anda");
        setCountdown(60); // 60 detik countdown
      } else {
        setMessage(data.error || "Gagal mengirim ulang OTP");
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      setMessage("Terjadi kesalahan koneksi");
    } finally {
      setResendLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Email tidak ditemukan</h1>
          <Link href="/auth/regis" className="text-blue-600 hover:underline">
            Kembali ke registrasi
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="w-full h-screen bg-transparent flex justify-center items-center font-montserrat">
      {/* LEFT SIDE */}
      <div className="w-1/2 bg-white h-screen flex flex-col items-center justify-center gap-5">
        <div className="flex flex-col gap-5 w-2/3 max-w-md">
          {/* HEADER */}
          <div className="flex flex-col text-center gap-1">
            <h1 className="text-3xl font-semibold">Verifikasi Email</h1>
            <p className="text-gray-600">
              Masukkan kode OTP yang telah dikirim ke
            </p>
            <p className="font-medium text-navy-600">{email}</p>
          </div>

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="w-full flex flex-col gap-4 justify-center items-center"
          >
            {message && (
              <div
                className={`p-3 rounded-md text-sm w-full text-center ${
                  message.includes("berhasil")
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {message}
              </div>
            )}

            {/* OTP INPUT USING SHADCN */}
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="otp">Kode OTP</Label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <p className="text-xs text-gray-500 text-center">
                Kode OTP berlaku selama 15 menit
              </p>
            </div>

            {/* SUBMIT BUTTON */}
            <Button
              type="submit"
              className="bg-navy-200 hover:bg-navy-400 w-full mt-4"
              disabled={loading || otp.length !== 6}
            >
              {loading ? "Memverifikasi..." : "Verifikasi"}
            </Button>

            {/* RESEND OTP */}
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">Tidak menerima kode?</p>
              {countdown > 0 ? (
                <p className="text-sm text-gray-500">
                  Kirim ulang dalam {countdown} detik
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resendLoading}
                  className="text-sm text-navy-600 hover:text-navy-800 underline disabled:opacity-50"
                >
                  {resendLoading ? "Mengirim..." : "Kirim ulang OTP"}
                </button>
              )}
            </div>

            {/* BACK TO LOGIN */}
            <p className="text-center text-sm">
              <Link
                href="/auth/login"
                className="text-navy-400 hover:underline"
              >
                Kembali ke login
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="relative w-1/2 bg-neutral-100 h-screen flex items-center justify-center">
        <Image
          src="/img/continent.png"
          alt="continent"
          width={1000}
          height={1000}
          className="w-full h-auto"
        />
        <div className="absolute flex flex-col justify-center items-center gap-4">
          <Image
            src="/logo/divhub.png"
            alt="logo"
            width={500}
            height={500}
            className="w-[40%] h-auto"
          />
          <div className="flex flex-col justify-center items-center">
            <h1 className="text-5xl font-bold text-navy-600">SATRIA</h1>
            <p className="w-full text-center font-medium">
              Sistem Absensi Tepat, Responsif, Interaktif dan Akurat
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VerifyOTP;
