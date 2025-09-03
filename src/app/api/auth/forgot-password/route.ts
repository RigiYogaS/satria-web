import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail, generateOTP } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validasi input
    if (!email) {
      return NextResponse.json(
        { error: "Email harus diisi" },
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
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Email tidak terdaftar dalam sistem" },
        { status: 404 }
      );
    }

    // Cek apakah user sudah aktif
    if (user.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Akun belum aktif. Silakan verifikasi email terlebih dahulu." },
        { status: 403 }
      );
    }

    // Generate reset token (OTP 6 digit)
    const resetToken = generateOTP();
    const resetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 menit

    // Simpan reset token ke database
    await prisma.users.update({
      where: { id_user: user.id_user },
      data: {
        otp_code: resetToken,
        otp_expires_at: resetExpires,
      }
    });

    // Kirim email reset password
    const emailSent = await sendPasswordResetEmail(user.email, user.nama, resetToken);

    if (!emailSent) {
      return NextResponse.json(
        { error: "Gagal mengirim email. Silakan coba lagi." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Kode reset password telah dikirim ke email Anda",
      email: user.email
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}