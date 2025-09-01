import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { generateOTP, sendOTPEmail } from "@/lib/email";

const prisma = new PrismaClient();

// POST /api/auth/send-otp - Kirim ulang OTP
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email harus diisi" }, { status: 400 });
    }

    // Cari user berdasarkan email
    const user = await prisma.users.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Email tidak ditemukan" },
        { status: 404 }
      );
    }

    if ((user as any).status === "ACTIVE") {
      return NextResponse.json({ error: "Akun sudah aktif" }, { status: 400 });
    }

    // Generate OTP baru
    const otp = generateOTP();
    const otpExpires = new Date();
    otpExpires.setMinutes(
      otpExpires.getMinutes() + parseInt(process.env.OTP_EXPIRY_MINUTES || "15")
    );

    // Update user dengan OTP baru
    await prisma.users.update({
      where: { email: email.toLowerCase() },
      data: {
        otp_code: otp,
        otp_expires_at: otpExpires,
        updated_at: new Date(),
      } as any,
    });

    // Kirim email OTP
    const emailSent = await sendOTPEmail(email, user.nama, otp);

    if (!emailSent) {
      return NextResponse.json(
        { error: "Gagal mengirim email OTP" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "OTP telah dikirim ke email Anda",
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
