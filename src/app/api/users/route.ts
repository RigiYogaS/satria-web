import { NextResponse } from "next/server";
import { getUsers, createUser } from "@/services/user";
import bcrypt from "bcryptjs";

export async function GET() {
  const users = await getUsers();
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, nama, jabatan, bagian, password } = body;

    // Validasi input
    if (!email || !nama || !jabatan || !bagian || !password) {
      return NextResponse.json(
        { error: "Semua field harus diisi" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Buat user baru
    const user = await createUser({
      email,
      nama,
      jabatan,
      bagian,
      password: hashedPassword,
    });

    // Return user tanpa password
    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json(
      { message: "User berhasil dibuat", user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.code === "P2002") { 
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
