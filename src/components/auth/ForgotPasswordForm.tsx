"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Validasi email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setMessage("Format email tidak valid");
        return;
      }

      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(
          "Kode reset password telah dikirim ke email Anda. Mengalihkan ke halaman reset..."
        );

        // Redirect ke halaman reset password setelah 3 detik
        setTimeout(() => {
          router.push(
            `/auth-routing/reset-password?email=${encodeURIComponent(email)}`
          );
        }, 3000);
      } else {
        setMessage(data.error || "Gagal mengirim email reset");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      setMessage("Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full min-h-screen flex flex-col md:flex-row bg-neutral-100 md:bg-white font-montserrat">
      {/* KIRI: FORM FORGOT PASSWORD */}
      <div className="w-full md:w-1/2 min-h-screen md:h-screen bg-neutral-100 md:bg-white grid grid-rows-[auto_1fr]">
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
        <div className="flex justify-center items-start md:items-center py-6 w-full h-auto md:h-screen bg-white rounded-t-3xl shadow-lg">
          <div className="w-full max-w-md px-6 flex flex-col items-center justify-center">
            {/* HEADER */}
            <div className="flex flex-col text-center gap-1 w-full mb-6">
              <h1 className="text-2xl font-bold mb-1 md:text-3xl">
                Lupa Password
              </h1>
              <p className="text-sm text-gray-600 hidden md:block">
                Masukkan email Anda untuk menerima kode reset password
              </p>
            </div>
            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="w-full flex flex-col gap-2 justify-center items-center"
            >
              {message && (
                <div
                  className={`p-3 rounded-md text-sm w-full text-center ${
                    message.includes("dikirim") ||
                    message.includes("Mengalihkan")
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {message}
                </div>
              )}

              {/* EMAIL */}
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  placeholder="Masukkan email terdaftar"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="text-sm"
                />
              </div>

              <Button
                type="submit"
                className="bg-navy-200 hover:bg-navy-400 w-full mt-6"
                disabled={loading}
              >
                {loading ? "Mengirim..." : "Kirim Kode Reset"}
              </Button>

              <div className="text-center space-y-2 mt-2 w-full">
                <p className="text-sm">
                  Ingat password Anda?{" "}
                  <Link
                    href="/auth-routing/login"
                    className="text-navy-400 hover:underline"
                  >
                    Kembali ke Login
                  </Link>
                </p>
                <p className="text-sm">
                  Belum punya akun?{" "}
                  <Link
                    href="/auth-routing/regis"
                    className="text-navy-400 hover:underline"
                  >
                    Daftar di sini
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* KANAN: LOGO & BACKGROUND */}
      <div className="hidden md:flex flex-col justify-center items-center w-1/2 h-screen bg-neutral-100 relative overflow-hidden">
        <Image
          src="/img/continent.png"
          alt="continent"
          width={500}
          height={500}
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

export default ForgotPasswordForm;
