import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sendWelcomeEmail } from "@/lib/email";

const prisma = new PrismaClient();

// POST /api/auth/verify-otp - Verifikasi OTP
export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email dan OTP harus diisi" },
        { status: 400 }
      );
    }

    // Cari user berdasarkan email
    const user = (await prisma.users.findUnique({
      where: { email: email.toLowerCase() },
    })) as any;

    if (!user) {
      return NextResponse.json(
        { error: "Email tidak ditemukan" },
        { status: 404 }
      );
    }

    if (user.status === "ACTIVE") {
      return NextResponse.json({ error: "Akun sudah aktif" }, { status: 400 });
    }

    // Cek apakah OTP valid
    if (!user.otp_code || user.otp_code !== otp.toString()) {
      return NextResponse.json(
        { error: "Kode OTP tidak valid" },
        { status: 400 }
      );
    }

    // Cek apakah OTP sudah expired
    if (!user.otp_expires_at || new Date() > user.otp_expires_at) {
      return NextResponse.json(
        { error: "Kode OTP sudah kadaluarsa" },
        { status: 400 }
      );
    }

    // Update status user menjadi active dan hapus OTP
    await prisma.users.update({
      where: { email: email.toLowerCase() },
      data: {
        status: "ACTIVE",
        otp_code: null,
        otp_expires_at: null,
        updated_at: new Date(),
      } as any,
    });

    // Kirim email welcome
    await sendWelcomeEmail(email, user.nama);

    return NextResponse.json({
      success: true,
      message: "Email berhasil diverifikasi! Akun Anda sudah aktif.",
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
