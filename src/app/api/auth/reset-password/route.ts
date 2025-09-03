import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { email, resetCode, newPassword } = await request.json();

    console.log("Reset password request:", {
      email,
      resetCode,
      newPasswordLength: newPassword?.length,
    });

    // Validasi input
    if (!email || !resetCode || !newPassword) {
      console.log("Missing fields:", {
        email: !!email,
        resetCode: !!resetCode,
        newPassword: !!newPassword,
      });
      return NextResponse.json(
        { error: "Semua field harus diisi" },
        { status: 400 }
      );
    }

    // Cari user dan cek reset code
    const user = await prisma.users.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    console.log("User found:", {
      exists: !!user,
      storedOtpCode: user?.otp_code,
      inputResetCode: resetCode,
      otpExpires: user?.otp_expires_at,
    });

    if (!user) {
      return NextResponse.json(
        { error: "Email tidak terdaftar" },
        { status: 404 }
      );
    }

    // Cek apakah reset code valid
    if (!user.otp_code || user.otp_code !== resetCode) {
      console.log("OTP mismatch:", {
        stored: user.otp_code,
        input: resetCode,
        match: user.otp_code === resetCode,
      });
      return NextResponse.json(
        { error: "Kode reset tidak valid" },
        { status: 400 }
      );
    }

    // Cek apakah reset code belum expired
    if (!user.otp_expires_at || new Date() > user.otp_expires_at) {
      console.log("OTP expired:", {
        expires: user.otp_expires_at,
        now: new Date(),
        isExpired: !user.otp_expires_at || new Date() > user.otp_expires_at,
      });
      return NextResponse.json(
        { error: "Kode reset sudah expired. Silakan minta kode baru." },
        { status: 400 }
      );
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password dan hapus reset code
    await prisma.users.update({
      where: { id_user: user.id_user },
      data: {
        password: hashedPassword,
        otp_code: null,
        otp_expires_at: null,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Password berhasil direset. Silakan login dengan password baru.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
