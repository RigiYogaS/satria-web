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
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [divisiList, setDivisiList] = useState<
    Array<{ id_divisi: number; nama_divisi: string }>
  >([]);
  const router = useRouter();

  // Load divisi data saat component mount
  useEffect(() => {
    const fetchDivisi = async () => {
      try {
        const response = await fetch("/api/divisi");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();


        if (data.success && Array.isArray(data.data)) {
          setDivisiList(data.data);
        }
      } catch (error) {
        // Fallback ke data static jika API gagal
        const fallbackData = [
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
        ];

        setDivisiList(fallbackData);
      }
    };

    fetchDivisi();
  }, []);

  const togglePassword = () => setShowPassword((prev) => !prev);

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
    if (id === "password") {
      const errors = validatePassword(value);
      setPasswordErrors(errors);
    }
  };

  const handleSelectChange = (value: string) => {
    setFormData({
      ...formData,
      bagian: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Validasi password sebelum submit
      const passwordValidationErrors = validatePassword(formData.password);
      if (passwordValidationErrors.length > 0) {
        setMessage("Password tidak memenuhi kriteria keamanan");
        setPasswordErrors(passwordValidationErrors);
        return;
      }

      // Validasi email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setMessage("Format email tidak valid");
        return;
      }

      // Validasi field kosong
      if (!formData.nama.trim() || !formData.jabatan.trim()) {
        setMessage("Semua field harus diisi");
        return;
      }

      // Cari divisi_id berdasarkan nama yang dipilih
      const selectedDivisi = divisiList.find(
        (div) => div.nama_divisi === formData.bagian
      );

      if (!selectedDivisi) {
        setMessage("Divisi tidak valid. Silakan pilih divisi yang tersedia.");
        return;
      }

      const submitData = {
        nama: formData.nama,
        email: formData.email,
        jabatan: formData.jabatan,
        divisi_id: selectedDivisi.id_divisi,
        password: formData.password,
      };

      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Registrasi berhasil! Mengalihkan ke halaman verifikasi...");

        // Reset form
        setFormData({
          nama: "",
          email: "",
          jabatan: "",
          bagian: "",
          password: "",
        });
        setPasswordErrors([]);

        // Redirect ke halaman verifikasi OTP setelah 2 detik
        setTimeout(() => {
          router.push(
            `/auth/verify-otp?email=${encodeURIComponent(formData.email)}`
          );
        }, 2000);
      } else {
        setMessage(data.error || "Terjadi kesalahan");
      }
    } catch (error) {
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
            <h1 className="text-3xl font-semibold">Daftar</h1>
            <p>Silakan isi detail Anda untuk membuat akun</p>
          </div>

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="w-full flex flex-col gap-2 justify-center items-center"
          >
            {message && (
              <div
                className={`p-3 rounded-md text-sm ${
                  message.includes("berhasil")
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {message}
              </div>
            )}

            {/* NAMA */}
            <div className="grid w-full max-w-sm items-center gap-2">
              <Label htmlFor="nama">Nama</Label>
              <Input
                type="text"
                id="nama"
                placeholder="Masukkan Nama"
                value={formData.nama}
                onChange={handleChange}
                required
              />
            </div>
            {/* EMAIL */}
            <div className="grid w-full max-w-sm items-center gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                placeholder="Masukkan Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            {/* JABATAN */}
            <div className="grid w-full max-w-sm items-center gap-2">
              <Label htmlFor="jabatan">Jabatan</Label>
              <Input
                type="text"
                id="jabatan"
                placeholder="Masukkan Jabatan"
                value={formData.jabatan}
                onChange={handleChange}
                required
              />
            </div>
            {/* BAGIAN */}
            <div className="relative flex flex-col w-full max-w-sm gap-2">
              <Label htmlFor="bagian">Bagian</Label>
              <Select
                onValueChange={handleSelectChange}
                value={formData.bagian}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih Bagian" />
                </SelectTrigger>
                <SelectContent>
                  {divisiList.map((divisi) => (
                    <SelectItem
                      key={divisi.id_divisi}
                      value={divisi.nama_divisi}
                    >
                      {divisi.nama_divisi}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* KATA SANDI */}
            <div className="grid w-full max-w-sm gap-2">
              <Label htmlFor="password">Kata Sandi</Label>
              <div className="relative w-full flex justify-center">
                <Input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Masukkan Kata Sandi"
                  value={formData.password}
                  onChange={handleChange}
                  className={
                    passwordErrors.length > 0 && formData.password
                      ? "border-red-500"
                      : ""
                  }
                  required
                />
                <button
                  type="button"
                  onClick={togglePassword}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label={
                    showPassword ? "Sembunyikan password" : "Tampilkan password"
                  }
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>

              {/* Password Requirements */}
              {formData.password && (
                <div className="text-xs space-y-1 mt-2">
                  <p className="font-medium text-gray-700">
                    Kriteria Password:
                  </p>
                  <div className="space-y-1">
                    <div
                      className={`flex items-center gap-2 ${
                        formData.password.length >= 8
                          ? "text-green-600"
                          : "text-red-500"
                      }`}
                    >
                      <span>{formData.password.length >= 8 ? "✓" : "✗"}</span>
                      <span>Minimal 8 karakter</span>
                    </div>
                    <div
                      className={`flex items-center gap-2 ${
                        /[A-Z]/.test(formData.password)
                          ? "text-green-600"
                          : "text-red-500"
                      }`}
                    >
                      <span>{/[A-Z]/.test(formData.password) ? "✓" : "✗"}</span>
                      <span>Minimal 1 huruf besar</span>
                    </div>
                    <div
                      className={`flex items-center gap-2 ${
                        /[a-z]/.test(formData.password)
                          ? "text-green-600"
                          : "text-red-500"
                      }`}
                    >
                      <span>{/[a-z]/.test(formData.password) ? "✓" : "✗"}</span>
                      <span>Minimal 1 huruf kecil</span>
                    </div>
                    <div
                      className={`flex items-center gap-2 ${
                        /[0-9]/.test(formData.password)
                          ? "text-green-600"
                          : "text-red-500"
                      }`}
                    >
                      <span>{/[0-9]/.test(formData.password) ? "✓" : "✗"}</span>
                      <span>Minimal 1 angka</span>
                    </div>
                    <div
                      className={`flex items-center gap-2 ${
                        /[!@#$%^&*(),.?":{}|<>]/.test(formData.password)
                          ? "text-green-600"
                          : "text-red-500"
                      }`}
                    >
                      <span>
                        {/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)
                          ? "✓"
                          : "✗"}
                      </span>
                      <span>Minimal 1 karakter khusus (!@#$%^&*)</span>
                    </div>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="bg-navy-200 hover:bg-navy-400 w-full mt-6"
                disabled={
                  loading || (!!formData.password && passwordErrors.length > 0)
                }
              >
                {loading ? "Mendaftar..." : "Daftar"}
              </Button>
              <p className="text-center">
                Sudah memiliki akun?{" "}
                <Link href="/auth/login" className="text-navy-400">
                  Masuk
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
        <div className="absolute  flex flex-col justify-center items-center gap-4">
          <Image
            src="/logo/divhub.png"
            alt="continent"
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

export default RegisterForm;
