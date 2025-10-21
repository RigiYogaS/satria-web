"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    jabatan: "",
    bagian: "",
    password: "",
    pangkat: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [divisiList, setDivisiList] = useState<
    Array<{ id_divisi: number; nama_divisi: string }>
  >([]);
  const router = useRouter();

  useEffect(() => {
    const fetchDivisi = async () => {
      try {
        const response = await fetch("/api/divisi");
        if (!response.ok) throw new Error();
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setDivisiList(data.data);
        }
      } catch {
        setDivisiList([
          { id_divisi: 1, nama_divisi: "Bagprotokol" },
          { id_divisi: 2, nama_divisi: "Bagkominter" },
          { id_divisi: 3, nama_divisi: "Bagrenmin" },
          { id_divisi: 4, nama_divisi: "Taud" },
          { id_divisi: 5, nama_divisi: "Bagjatanrin" },
          { id_divisi: 6, nama_divisi: "Bagbatanas" },
          { id_divisi: 7, nama_divisi: "SPRI Kadiv" },
          { id_divisi: 8, nama_divisi: "SPRI SES" },
          { id_divisi: 9, nama_divisi: "Bagdamkeman" },
          { id_divisi: 10, nama_divisi: "Bagkembantas" },
          { id_divisi: 11, nama_divisi: "Bagkonverin" },
          { id_divisi: 12, nama_divisi: "Bagpi" },
          { id_divisi: 13, nama_divisi: "SPRI Karomisi" },
          { id_divisi: 14, nama_divisi: "SPRI Karokonverin" },
          { id_divisi: 15, nama_divisi: "Bagwakinter" },
        ]);
      }
    };
    fetchDivisi();
  }, []);

  const togglePassword = () => setShowPassword((prev) => !prev);

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 8) errors.push("Password minimal 8 karakter");
    if (!/[A-Z]/.test(password)) errors.push("Harus ada minimal 1 huruf besar");
    if (!/[a-z]/.test(password)) errors.push("Harus ada minimal 1 huruf kecil");
    if (!/[0-9]/.test(password)) errors.push("Harus ada minimal 1 angka");
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
      errors.push("Harus ada minimal 1 karakter khusus (!@#$%^&*)");
    return errors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
    if (id === "password") setPasswordErrors(validatePassword(value));
  };

  const handleSelectChange = (value: string) => {
    setFormData({ ...formData, bagian: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const passwordValidationErrors = validatePassword(formData.password);
      if (passwordValidationErrors.length > 0) {
        setMessage("Password tidak memenuhi kriteria keamanan");
        setPasswordErrors(passwordValidationErrors);
        setLoading(false);
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setMessage("Format email tidak valid");
        setLoading(false);
        return;
      }
      if (!formData.nama.trim() || !formData.jabatan.trim()) {
        setMessage("Semua field harus diisi");
        setLoading(false);
        return;
      }
      const selectedDivisi = divisiList.find(
        (div) => div.nama_divisi === formData.bagian
      );
      if (!selectedDivisi) {
        setMessage("Divisi tidak valid. Silakan pilih divisi yang tersedia.");
        setLoading(false);
        return;
      }
      const submitData = {
        nama: formData.nama,
        email: formData.email,
        jabatan: formData.jabatan,
        divisi_id: selectedDivisi.id_divisi,
        password: formData.password,
        pangkat: formData.pangkat,
      };
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage("Registrasi berhasil! Mengalihkan ke halaman verifikasi...");
        setFormData({
          nama: "",
          email: "",
          jabatan: "",
          bagian: "",
          password: "",
          pangkat: "",
        });
        setPasswordErrors([]);
        setTimeout(() => {
          router.push(
            `/auth-routing/verify-otp?email=${encodeURIComponent(
              formData.email
            )}`
          );
        }, 2000);
      } else {
        setMessage(data.error || "Terjadi kesalahan");
      }
    } catch {
      setMessage("Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full min-h-screen flex flex-col md:flex-row bg-neutral-100 md:bg-white font-montserrat">
      <div className="w-full md:w-1/2 min-h-screen md:h-screen bg-neutral-100 md:bg-white grid grid-rows-[auto_1fr]">
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
            <div className="flex flex-col text-center gap-1 w-full mb-6">
              <h1 className="text-2xl font-bold mb-1 md:text-3xl">Daftar</h1>
              <p className="text-sm text-gray-600 hidden md:block">
                Silakan isi detail Anda untuk membuat akun
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
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {message}
                </div>
              )}

              {/* NAMA */}
              <div className="grid w-full items-center gap-1">
                <Label htmlFor="nama" className="text-sm">
                  Nama
                </Label>
                <Input
                  type="text"
                  id="nama"
                  placeholder="Masukkan Nama"
                  value={formData.nama}
                  onChange={handleChange}
                  required
                  className="text-sm"
                />
              </div>
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
              {/* JABATAN */}
              <div className="grid w-full items-center gap-1">
                <Label htmlFor="jabatan" className="text-sm">
                  Jabatan
                </Label>
                <Input
                  type="text"
                  id="jabatan"
                  placeholder="Masukkan Jabatan"
                  value={formData.jabatan}
                  onChange={handleChange}
                  required
                  className="text-sm"
                />
              </div>
              {/* PANGKAT */}
              <div className="grid w-full items-center gap-1">
                <Label htmlFor="pangkat" className="text-sm">
                  Pangkat
                </Label>
                <Input
                  type="text"
                  id="pangkat"
                  placeholder="Masukkan Pangkat"
                  value={formData.pangkat}
                  onChange={handleChange}
                  required
                  className="text-sm"
                />
              </div>
              {/* BAGIAN */}
              <div className="relative flex flex-col w-full gap-1">
                <Label htmlFor="bagian" className="text-sm">
                  Bagian
                </Label>
                <Select
                  onValueChange={handleSelectChange}
                  value={formData.bagian}
                  required
                >
                  <SelectTrigger className="w-full text-sm">
                    <SelectValue placeholder="Pilih Bagian" />
                  </SelectTrigger>
                  <SelectContent>
                    {divisiList.map((divisi) => (
                      <SelectItem
                        key={divisi.id_divisi}
                        value={divisi.nama_divisi}
                        className="text-sm"
                      >
                        {divisi.nama_divisi}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                {/* Password Requirements */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="text-xs font-medium text-gray-700 mb-1">
                      Kriteria Password
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span
                        title="Minimal 8 karakter"
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          formData.password.length >= 8
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        Min 8
                      </span>
                      <span
                        title="Minimal 1 huruf besar"
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          /[A-Z]/.test(formData.password)
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        Upper
                      </span>
                      <span
                        title="Minimal 1 huruf kecil"
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          /[a-z]/.test(formData.password)
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        Lower
                      </span>
                      <span
                        title="Minimal 1 angka"
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          /[0-9]/.test(formData.password)
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        Number
                      </span>
                      <span
                        title="Minimal 1 karakter khusus"
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          /[!@#$%^&*(),.?\":{}|<>]/.test(formData.password)
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        Special
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <Button
                type="submit"
                className="bg-navy-200 hover:bg-navy-400 w-full mt-6"
                disabled={
                  loading || (!!formData.password && passwordErrors.length > 0)
                }
              >
                {loading ? "Mendaftar..." : "Daftar"}
              </Button>
              <p className="text-sm text-center mt-2">
                Sudah memiliki akun?{" "}
                <Link href="/auth-routing/login" className="text-navy-400">
                  Masuk
                </Link>
              </p>
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
          className="absolute w-full opacity-60"
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

export default RegisterForm;
