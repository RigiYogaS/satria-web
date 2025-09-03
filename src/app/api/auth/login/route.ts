import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validasi input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password harus diisi" },
        { status: 400 }
      );
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Format email tidak valid" },
        { status: 400 }
      );
    }

    // Cari user di database
    const user = await prisma.users.findUnique({
      where: {
        email: email.toLowerCase().trim(),
      },
      include: {
        divisi: true,
      },
    });

    // User tidak ditemukan
    if (!user) {
      return NextResponse.json(
        { error: "Email tidak terdaftar. Silakan daftar terlebih dahulu." },
        { status: 401 }
      );
    }

    // Cek status user
    if (user.status !== "ACTIVE") {
      if (user.status === "PENDING") {
        return NextResponse.json(
          {
            error:
              "Akun belum diverifikasi. Silakan cek email untuk verifikasi OTP.",
            needVerification: true,
            email: user.email,
          },
          { status: 403 }
        );
      } else {
        return NextResponse.json(
          { error: "Akun tidak aktif. Hubungi administrator." },
          { status: 403 }
        );
      }
    }

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Password salah" }, { status: 401 });
    }

    // Update last login (optional)
    await prisma.users.update({
      where: { id_user: user.id_user },
      data: { updated_at: new Date() },
    });

    // Login berhasil - return user data (tanpa password)
    const {
      password: _,
      otp_code,
      otp_expires_at,
      ...userWithoutSensitiveData
    } = user;

    return NextResponse.json({
      success: true,
      message: "Login berhasil",
      user: userWithoutSensitiveData,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
