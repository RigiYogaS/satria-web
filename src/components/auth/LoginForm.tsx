"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  const togglePassword = () => setShowPassword((prev) => !prev);

  // Validasi password (sama seperti register)
  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push("Password minimal 8 karakter");
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("Harus ada minimal 1 huruf besar");
    }

    if (!/[a-z]/.test(password)) {
      errors.push("Harus ada minimal 1 huruf kecil");
    }

    if (!/[0-9]/.test(password)) {
      errors.push("Harus ada minimal 1 angka");
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("Harus ada minimal 1 karakter khusus (!@#$%^&*)");
    }

    return errors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;

    setFormData({
      ...formData,
      [id]: value,
    });

    // Validasi password real-time
    if (id === "password") {
      const errors = validatePassword(value);
      setPasswordErrors(errors);
    }
  };

  // Optional: Simpan email ke localStorage jika rememberMe dicentang
  useEffect(() => {
    if (rememberMe && formData.email) {
      localStorage.setItem("rememberedEmail", formData.email);
    }
  }, [rememberMe, formData.email]);

  useEffect(() => {
    // Saat komponen mount, cek apakah ada email yang disimpan
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setFormData((prev) => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const passwordValidationErrors = validatePassword(formData.password);
      if (passwordValidationErrors.length > 0) {
        setMessage("Password tidak memenuhi format yang benar");
        setPasswordErrors(passwordValidationErrors);
        setLoading(false);
        return;
      }

      // Validasi email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setMessage("Format email tidak valid");
        setLoading(false);
        return;
      }

      // Validasi field kosong
      if (!formData.email.trim() || !formData.password.trim()) {
        setMessage("Email dan password harus diisi");
        setLoading(false);
        return;
      }

      // Login dengan NextAuth
      const res = await signIn("credentials", {
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        redirect: false,
        remember: rememberMe,
      });

      if (res?.error) {
        setMessage("Email atau password salah!");
      } else if (res?.ok) {
        setMessage("Login berhasil! Mengalihkan ke dashboard...");
        setFormData({ email: "", password: "" });
        setPasswordErrors([]);
        setTimeout(() => {
          router.push("/user-routing/dashboardUser");
        }, 1000);
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full min-h-screen flex flex-col md:flex-row bg-neutral-100 md:bg-white font-montserrat">
      {/* KIRI: FORM LOGIN */}
      <div className="w-full md:w-1/2 min-h-screen bg-neutral-100 md:bg-white grid grid-rows-[auto_1fr]">
        {/* ROW 1: LOGO MOBILE */}
        <div className="md:hidden flex flex-col items-center mt-8 mb-2 bg-neutral-100 h-full">
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
        <div className="flex justify-center items-start py-6 w-full bg-white  rounded-t-3xl md:rounded-none md:rounded-l-3xl shadow-lg">
          <div className="w-full max-w-md px-6 flex flex-col items-center justify-center h-auto  md:h-screen ">
            <div className="flex flex-col text-center gap-1 w-full mb-6">
              <h1 className="text-2xl font-bold mb-1 md:text-3xl">Masuk</h1>
              <p className="text-sm text-gray-600 hidden md:block">
                Selamat datang, silakan login untuk melanjutkan
              </p>
            </div>
            <form
              onSubmit={handleSubmit}
              className="w-full flex flex-col gap-2"
            >
              {message && (
                <div
                  className={`p-2 rounded-md text-xs w-full text-center mb-2 ${
                    message.includes("berhasil")
                      ? "bg-green-100 text-green-700"
                      : message.includes("verifikasi")
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {message}
                </div>
              )}

              {/* EMAIL */}
              <div className="grid w-full items-center gap-1">
                <Label htmlFor="email" className="text-sm">
                  Email
                </Label>
                <Input
                  type="email"
                  id="email"
                  placeholder="Masukkan Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="text-sm"
                />
              </div>

              {/* KATA SANDI */}
              <div className="grid w-full gap-1">
                <Label htmlFor="password" className="text-sm">
                  Kata Sandi
                </Label>
                <div className="relative w-full flex justify-center">
                  <Input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="Masukkan Kata Sandi"
                    value={formData.password}
                    onChange={handleChange}
                    className={
                      (passwordErrors.length > 0 && formData.password
                        ? "border-red-500 "
                        : "") + "text-sm"
                    }
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePassword}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                    aria-label={
                      showPassword
                        ? "Sembunyikan password"
                        : "Tampilkan password"
                    }
                  >
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
              </div>

              {/* Checkbox & Lupa Password */}
              <div className="flex justify-between items-center w-full mb-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={() => setRememberMe((prev) => !prev)}
                    className="mr-2"
                  />
                  <label htmlFor="rememberMe" className="text-sm select-none">
                    Ingat saya
                  </label>
                </div>
                <Link
                  href="/auth-routing/forgot-password"
                  className="text-sm text-red-400 hover:underline"
                >
                  Lupa password?
                </Link>
              </div>

              <Button
                type="submit"
                className="bg-navy-200 hover:bg-navy-400 w-full mt-2 text-base"
                disabled={
                  loading || (!!formData.password && passwordErrors.length > 0)
                }
              >
                {loading ? "Masuk..." : "Login"}
              </Button>

              <p className="text-sm text-center mt-2">
                Tidak memiliki akun?{" "}
                <Link
                  href="/auth-routing/regis"
                  className="text-navy-400 hover:underline"
                >
                  Daftar
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
          width={500}
          height={500}
          className="absolute w-full  opacity-60"
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

export default LoginForm;
