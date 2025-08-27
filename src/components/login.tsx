"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const togglePassword = () => setShowPassword((prev) => !prev);
  return (
    <section className="w-full h-screen bg-transparent flex justify-center items-center font-montserrat">
      {/* LEFT SIDE */}
      <div className="w-1/2 bg-white h-screen flex flex-col items-center justify-center gap-5">
        <div className="flex flex-col gap-5">
          {/* HEADER */}
          <div className="flex flex-col text-center gap-1">
            <h1 className="text-3xl font-semibold">Masuk</h1>
            <p>Selamat datang, silakan login untuk melanjutkan</p>
          </div>

          {/* FORM */}
          <div className="w-full flex flex-col gap-2 justify-center items-center">
            {/* EMAIL */}
            <div className="grid w-full max-w-sm items-center gap-2">
              <Label htmlFor="email">Email</Label>
              <Input type="email" id="email" placeholder="Masukkan Email" />
            </div>
            {/* KATA SANDI */}
            <div className="grid w-full max-w-sm gap-2">
              <Label htmlFor="password">Kata Sandi</Label>
              <div className="relative w-full flex justify-center">
                <Input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Masukkan Kata Sandi"
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
            </div>
          </div>
          <Button 
            asChild
            className="bg-navy-200 hover:bg-navy-400"
            >
            <Link href={"https://google.com"}>Login</Link>
          </Button>
          <p className="text-center">Tidak memiliki akun? <Link href={"/auth/regis"} className="text-navy-400">Daftar</Link></p>
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

export default Login;
