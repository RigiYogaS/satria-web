import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { generateOTP, sendOTPEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

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

// GET /api/users - Daftar anggota (nama, jabatan, bagian)
export async function GET(request: Request) {
  const users = await prisma.users.findMany({
    select: {
      id_user: true,
      nama: true,
      jabatan: true,
      divisi: {
        select: {
          nama_divisi: true,
        },
      },
    },
    orderBy: { nama: "asc" },
  });

  // Mapping agar bagian = divisi.nama
  const result = users.map((user) => ({
    id_user: user.id_user,
    nama: user.nama,
    jabatan: user.jabatan,
    bagian: user.divisi?.nama_divisi || "-",
  }));

  return NextResponse.json(result);
}

// POST /api/users - Registrasi user baru
export async function POST(request: Request) {
  let divisi_id_submitted: any = null;

  try {
    const body = await request.json();
    const { email, nama, jabatan, divisi_id, password, role, fromAdmin } = body;
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

    // Jika dari admin, status langsung ACTIVE dan tanpa OTP
    if (fromAdmin) {
      const user = await prisma.users.create({
        data: {
          email: email.toLowerCase().trim(),
          nama: nama.trim(),
          jabatan: jabatan.trim(),
          divisi_id: parseInt(divisi_id),
          password: hashedPassword,
          role: role || "pegawai",
          status: "ACTIVE",
        },
      });

      const { password: _, ...userWithoutPassword } = user as any;

      return NextResponse.json(
        {
          message: "Anggota berhasil ditambahkan & langsung aktif.",
          user: userWithoutPassword,
        },
        { status: 201 }
      );
    }

    // Jika bukan dari admin, proses OTP seperti biasa
    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date();
    otpExpires.setMinutes(
      otpExpires.getMinutes() + parseInt(process.env.OTP_EXPIRY_MINUTES || "15")
    );

    // Buat user baru dengan status pending
    const user = await prisma.users.create({
      data: {
        email: email.toLowerCase().trim(),
        nama: nama.trim(),
        jabatan: jabatan.trim(),
        divisi_id: parseInt(divisi_id),
        password: hashedPassword,
        role: role || "pegawai",
        status: "PENDING",
        otp_code: otp,
        otp_expires_at: otpExpires,
      },
    });

    // Kirim email OTP
    const emailSent = await sendOTPEmail(email, nama, otp);

    // Return user tanpa password dan OTP
    const {
      password: _,
      otp_code: __,
      otp_expires_at: ___,
      ...userWithoutSensitiveData
    } = user as any;

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

// UPDATE user
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { nama, email, password, jabatan, divisi_id } = body;

    // Siapkan objek data update
    const dataToUpdate: any = {};
    if (nama) dataToUpdate.nama = nama;
    if (email) dataToUpdate.email = email;
    if (jabatan) dataToUpdate.jabatan = jabatan;
    if (divisi_id) dataToUpdate.divisi_id = parseInt(divisi_id);

    if (password) {
      dataToUpdate.password = await bcrypt.hash(password, 12);
    }

    const updated = await prisma.users.update({
      where: { id_user: Number(params.id) },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    return NextResponse.json({ error: "Gagal update user" }, { status: 500 });
  }
}

// DELETE user
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.users.delete({
      where: { id_user: Number(params.id) },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal menghapus user" },
      { status: 500 }
    );
  }
}
