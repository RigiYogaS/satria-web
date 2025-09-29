"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const ResetPasswordForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    resetCode: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Auto-fill email dari URL parameter
  useEffect(() => {
    const emailFromUrl = searchParams.get("email");
    if (emailFromUrl) {
      setFormData((prev) => ({ ...prev, email: emailFromUrl }));
    }
  }, [searchParams]);

  const togglePassword = () => setShowPassword((prev) => !prev);
  const toggleConfirmPassword = () => setShowConfirmPassword((prev) => !prev);

  // Validasi password
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
    if (id === "newPassword") {
      const errors = validatePassword(value);
      setPasswordErrors(errors);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      console.log("Form data:", {
        email: formData.email,
        resetCode: formData.resetCode,
        newPasswordLength: formData.newPassword.length,
      });

      // Validasi field kosong dulu
      if (!formData.email.trim()) {
        setMessage("Email harus diisi");
        return;
      }

      if (!formData.resetCode.trim()) {
        setMessage("Kode reset harus diisi");
        return;
      }

      if (!formData.newPassword.trim()) {
        setMessage("Password baru harus diisi");
        return;
      }

      // Validasi kode reset (6 digit) - lebih fleksibel
      const resetCodeTrimmed = formData.resetCode.trim();
      if (resetCodeTrimmed.length !== 6) {
        setMessage(
          `Kode reset harus 6 digit (saat ini: ${resetCodeTrimmed.length} digit)`
        );
        return;
      }

      if (!/^\d+$/.test(resetCodeTrimmed)) {
        setMessage("Kode reset harus berupa angka");
        return;
      }

      // Validasi password format
      const passwordValidationErrors = validatePassword(formData.newPassword);
      if (passwordValidationErrors.length > 0) {
        setMessage("Password tidak memenuhi format yang benar");
        setPasswordErrors(passwordValidationErrors);
        return;
      }

      // Validasi konfirmasi password
      if (formData.newPassword !== formData.confirmPassword) {
        setMessage("Konfirmasi password tidak cocok");
        return;
      }

      console.log("Sending reset request...");

      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email.toLowerCase().trim(),
          resetCode: resetCodeTrimmed,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();
      console.log("Response:", data);

      if (response.ok) {
        setMessage(
          "Password berhasil direset! Mengalihkan ke halaman login..."
        );

        // Reset form
        setFormData({
          email: "",
          resetCode: "",
          newPassword: "",
          confirmPassword: "",
        });
        setPasswordErrors([]);

        // Redirect ke login setelah 3 detik
        setTimeout(() => {
          router.push("/auth-routing/login");
        }, 3000);
      } else {
        setMessage(data.error || "Gagal reset password");
        console.error("Reset error:", data);
      }
    } catch (error) {
      console.error("Reset password error:", error);
      setMessage("Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full min-h-screen flex flex-col md:flex-row bg-neutral-100 md:bg-white font-montserrat">
      {/* KIRI: FORM RESET PASSWORD */}
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
                Reset Password
              </h1>
              <p className="text-sm text-gray-600 hidden md:block">
                Masukkan kode reset dan password baru Anda
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
                    message.includes("berhasil")
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
                  placeholder="Email Anda"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!!searchParams.get("email")}
                  required
                  className="text-sm"
                />
              </div>

              {/* RESET CODE */}
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="resetCode">Kode Reset (6 digit)</Label>
                <Input
                  type="text"
                  id="resetCode"
                  placeholder="Masukkan kode dari email"
                  value={formData.resetCode}
                  onChange={handleChange}
                  maxLength={6}
                  pattern="[0-9]{6}"
                  required
                  className="text-sm"
                />
              </div>

              {/* PASSWORD BARU */}
              <div className="grid w-full gap-2">
                <Label htmlFor="newPassword">Password Baru</Label>
                <div className="relative w-full flex justify-center">
                  <Input
                    type={showPassword ? "text" : "password"}
                    id="newPassword"
                    placeholder="Masukkan password baru"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className={
                      passwordErrors.length > 0 && formData.newPassword
                        ? "border-red-500 text-sm"
                        : "text-sm"
                    }
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePassword}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
                {/* Password Requirements */}
                {formData.newPassword && (
                  <div className="text-xs space-y-1 mt-2">
                    <p className="font-medium text-gray-700">
                      Format Password:
                    </p>
                    <div className="space-y-1">
                      <div
                        className={`flex items-center gap-2 ${
                          formData.newPassword.length >= 8
                            ? "text-green-600"
                            : "text-red-500"
                        }`}
                      >
                        <span>
                          {formData.newPassword.length >= 8 ? "✓" : "✗"}
                        </span>
                        <span>Minimal 8 karakter</span>
                      </div>
                      <div
                        className={`flex items-center gap-2 ${
                          /[A-Z]/.test(formData.newPassword)
                            ? "text-green-600"
                            : "text-red-500"
                        }`}
                      >
                        <span>
                          {/[A-Z]/.test(formData.newPassword) ? "✓" : "✗"}
                        </span>
                        <span>Minimal 1 huruf besar</span>
                      </div>
                      <div
                        className={`flex items-center gap-2 ${
                          /[a-z]/.test(formData.newPassword)
                            ? "text-green-600"
                            : "text-red-500"
                        }`}
                      >
                        <span>
                          {/[a-z]/.test(formData.newPassword) ? "✓" : "✗"}
                        </span>
                        <span>Minimal 1 huruf kecil</span>
                      </div>
                      <div
                        className={`flex items-center gap-2 ${
                          /[0-9]/.test(formData.newPassword)
                            ? "text-green-600"
                            : "text-red-500"
                        }`}
                      >
                        <span>
                          {/[0-9]/.test(formData.newPassword) ? "✓" : "✗"}
                        </span>
                        <span>Minimal 1 angka</span>
                      </div>
                      <div
                        className={`flex items-center gap-2 ${
                          /[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword)
                            ? "text-green-600"
                            : "text-red-500"
                        }`}
                      >
                        <span>
                          {/[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword)
                            ? "✓"
                            : "✗"}
                        </span>
                        <span>Minimal 1 karakter khusus (!@#$%^&*)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* KONFIRMASI PASSWORD */}
              <div className="grid w-full gap-2">
                <Label htmlFor="confirmPassword">
                  Konfirmasi Password Baru
                </Label>
                <div className="relative w-full flex justify-center">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    placeholder="Ulangi password baru"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={
                      formData.confirmPassword &&
                      formData.newPassword !== formData.confirmPassword
                        ? "border-red-500 text-sm"
                        : formData.confirmPassword &&
                          formData.newPassword === formData.confirmPassword
                        ? "border-green-500 text-sm"
                        : "text-sm"
                    }
                    required
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPassword}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <Eye size={18} />
                    ) : (
                      <EyeOff size={18} />
                    )}
                  </button>
                </div>
                {/* Konfirmasi Password Status */}
                {formData.confirmPassword && (
                  <div className="text-xs mt-1">
                    {formData.newPassword === formData.confirmPassword ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <span>✓</span>
                        <span>Password cocok</span>
                      </span>
                    ) : (
                      <span className="text-red-500 flex items-center gap-1">
                        <span>✗</span>
                        <span>Password tidak cocok</span>
                      </span>
                    )}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="bg-navy-200 hover:bg-navy-400 w-full mt-6"
                disabled={
                  loading ||
                  passwordErrors.length > 0 ||
                  formData.newPassword !== formData.confirmPassword ||
                  !formData.newPassword ||
                  !formData.confirmPassword
                }
              >
                {loading ? "Mereset..." : "Reset Password"}
              </Button>

              <div className="text-center space-y-2 w-full">
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
                  <Link
                    href="/auth-routing/forgot-password"
                    className="text-navy-400 hover:underline"
                  >
                    Kirim ulang kode reset
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

export default ResetPasswordForm;
