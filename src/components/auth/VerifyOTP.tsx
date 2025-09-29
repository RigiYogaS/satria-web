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
          router.push("/auth-routing/login?verified=true");
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
        setCountdown(60);
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
          <Link
            href="/auth-routing/regis"
            className="text-blue-600 hover:underline"
          >
            Kembali ke registrasi
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="w-full min-h-screen flex flex-col md:flex-row bg-neutral-100 md:bg-white font-montserrat">
      {/* KIRI: FORM VERIFIKASI */}
      <div className="w-full md:w-1/2 min-h-screen bg-neutral-100 md:bg-white grid grid-rows-[auto_1fr]">
        {/* ROW 1: LOGO MOBILE */}
        <div className="md:hidden flex flex-col items-center mt-8 mb-2 bg-neutral-100">
          <Image
            src="/logo/divhub.png"
            alt="logo"
            width={200}
            height={200}
            className="w-16 h-auto mb-2"
          />
          <h1 className="text-xl font-bold text-navy-600 mb-2 tracking-wide">
            SATRIA
          </h1>
        </div>
        {/* ROW 2: CARD FORM */}
        <div className="flex justify-center items-start py-6 w-full bg-white rounded-t-3xl md:rounded-none md:rounded-l-3xl shadow-lg">
          <div className="w-full max-w-md px-6 flex flex-col items-center justify-center h-auto md:h-screen">
            {/* HEADER */}
            <div className="flex flex-col text-center gap-1 w-full mb-6">
              <h1 className="text-2xl font-bold mb-1 md:text-3xl">
                Verifikasi Email
              </h1>
              <p className="text-sm text-gray-600 hidden md:block">
                Masukkan kode OTP yang telah dikirim ke email Anda
              </p>
              <p className="font-medium text-navy-600 break-all">{email}</p>
            </div>
            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="w-full flex flex-col gap-4 justify-center items-center"
            >
              {message && (
                <div
                  className={`p-3 rounded-md text-sm w-full text-center mb-2 ${
                    message.includes("berhasil")
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {message}
                </div>
              )}

              {/* OTP INPUT */}
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
                className="bg-navy-200 hover:bg-navy-400 w-full mt-2"
                disabled={loading || otp.length !== 6}
              >
                {loading ? "Memverifikasi..." : "Verifikasi"}
              </Button>

              {/* RESEND OTP */}
              <div className="text-center space-y-2 w-full">
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
              <p className="text-center text-sm w-full">
                <Link
                  href="/auth-routing/login"
                  className="text-navy-400 hover:underline"
                >
                  Kembali ke login
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* KANAN: LOGO & BACKGROUND */}
      <div className="hidden md:flex flex-col justify-center items-center w-1/2 min-h-screen bg-neutral-100 relative">
        <Image
          src="/img/continent.png"
          alt="continent"
          width={1000}
          height={1000}
          className="absolute w-full h-auto opacity-60"
        />
        <div className="relative z-10 flex flex-col items-center">
          <Image
            src="/logo/divhub.png"
            alt="logo"
            width={200}
            height={200}
            className="w-48 h-auto mb-2"
          />
          <h1 className="text-4xl font-bold text-navy-600 mb-2 tracking-wide">
            SATRIA
          </h1>
          <p className="text-base text-center font-medium">
            Sistem Absensi Tepat, Responsif, Interaktif dan Akurat
          </p>
        </div>
      </div>
    </section>
  );
};

export default VerifyOTP;
