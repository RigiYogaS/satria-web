import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { getUsers, createUser } from "@/services/user";
import bcrypt from "bcryptjs";
import { generateOTP, sendOTPEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// Fungsi validasi password
function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("minimal 8 karakter");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("minimal 1 huruf besar");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("minimal 1 huruf kecil");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("minimal 1 angka");
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("minimal 1 karakter khusus");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const skip = (page - 1) * limit;
  const absensi = await prisma.absensi.findMany({
    where: { user_id: Number(session.user.id) },
    orderBy: { tanggal: "desc" },
    skip,
    take: limit,
  });
  return NextResponse.json(absensi);
}

export async function POST(request: Request) {
  let divisi_id_submitted: any = null;

  try {
    const body = await request.json();
    const { email, nama, jabatan, divisi_id, password, role } = body;
    divisi_id_submitted = divisi_id;

    if (!email || !nama || !jabatan || !divisi_id || !password) {
      return NextResponse.json(
        { error: "Semua field harus diisi" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Format email tidak valid" },
        { status: 400 }
      );
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        {
          error: `Password tidak valid: ${passwordValidation.errors.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    if (nama.trim().length < 2) {
      return NextResponse.json(
        { error: "Nama minimal 2 karakter" },
        { status: 400 }
      );
    }

    if (jabatan.trim().length < 2) {
      return NextResponse.json(
        { error: "Jabatan minimal 2 karakter" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date();
    otpExpires.setMinutes(
      otpExpires.getMinutes() + parseInt(process.env.OTP_EXPIRY_MINUTES || "15")
    );

    // Buat  baru dengan status pending
    const useuserr = await createUser({
      email: email.toLowerCase().trim(),
      nama: nama.trim(),
      jabatan: jabatan.trim(),
      divisi_id: parseInt(divisi_id),
      password: hashedPassword,
      role: role || "pegawai",
      status: "PENDING", // UPPERCASE to match database
      otp_code: otp,
      otp_expires_at: otpExpires,
    });

    // Kirim email OTP
    console.log(`📧 Attempting to send OTP email to ${email}...`);
    const emailSent = await sendOTPEmail(email, nama, otp);

    if (!emailSent) {
      // Jika gagal kirim email, tetap return success tapi dengan pesan
      console.warn(`❌ Failed to send OTP email to ${email}`);
      console.warn(
        `📝 User created successfully, but email notification failed`
      );
    } else {
      console.log(`✅ OTP email sent successfully to ${email}`);
    }

    // Return user tanpa password dan OTP
    const {
      password: _,
      otp_code: __,
      otp_expires: ___,
      ...userWithoutSensitiveData
    } = useuserr as any;

    return NextResponse.json(
      {
        message:
          "Registrasi berhasil! Silakan cek email Anda untuk verifikasi OTP.",
        user: userWithoutSensitiveData,
        emailSent: emailSent,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating user:", error);

    // Handle foreign key constraint error
    if (error.code === "P2003" && error.meta?.field_name === "divisi_id") {
      return NextResponse.json(
        {
          error: "Divisi tidak valid. Silakan pilih divisi yang tersedia.",
          details: `Divisi dengan ID ${divisi_id_submitted} tidak ditemukan.`,
        },
        { status: 400 }
      );
    }

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Terjadi kesalahan server: " + error.message },
      { status: 500 }
    );
  }
}
