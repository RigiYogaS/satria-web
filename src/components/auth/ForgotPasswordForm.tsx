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
        setMessage("Kode reset password telah dikirim ke email Anda. Mengalihkan ke halaman reset...");
        
        // Redirect ke halaman reset password setelah 3 detik
        setTimeout(() => {
          router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
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
    <section className="w-full h-screen bg-transparent flex justify-center items-center font-montserrat">
      {/* LEFT SIDE */}
      <div className="w-1/2 bg-white h-screen flex flex-col items-center justify-center gap-5">
        <div className="flex flex-col gap-5 w-2/3">
          {/* HEADER */}
          <div className="flex flex-col text-center gap-1">
            <h1 className="text-3xl font-semibold">Lupa Password</h1>
            <p>Masukkan email Anda untuk menerima kode reset password</p>
          </div>

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="w-full flex flex-col gap-2 justify-center items-center"
          >
            {message && (
              <div
                className={`p-3 rounded-md text-sm w-full max-w-sm text-center ${
                  message.includes("dikirim") || message.includes("Mengalihkan")
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {message}
              </div>
            )}

            {/* EMAIL */}
            <div className="grid w-full max-w-sm items-center gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                placeholder="Masukkan email terdaftar"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="bg-navy-200 hover:bg-navy-400 w-full max-w-sm mt-6"
              disabled={loading}
            >
              {loading ? "Mengirim..." : "Kirim Kode Reset"}
            </Button>

            <div className="text-center space-y-2">
              <p>
                Ingat password Anda?{" "}
                <Link
                  href="/auth/login"
                  className="text-navy-400 hover:underline"
                >
                  Kembali ke Login
                </Link>
              </p>
              <p>
                Belum punya akun?{" "}
                <Link
                  href="/auth/regis"
                  className="text-navy-400 hover:underline"
                >
                  Daftar di sini
                </Link>
              </p>
            </div>
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

export default ForgotPasswordForm;