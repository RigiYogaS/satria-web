import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET /api/users/[id] - Get user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id);

    if (!userId || isNaN(userId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid user ID",
        },
        { status: 400 }
      );
    }

    const user = await prisma.users.findUnique({
      where: { id_user: userId },
      include: {
        divisi: true,
        absensi: {
          orderBy: { created_at: "desc" },
          take: 10,
        },
        cuti: {
          orderBy: { created_at: "desc" },
          take: 10,
        },
        laporan: {
          orderBy: { created_at: "desc" },
          take: 10,
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      data: userWithoutPassword,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch user",
      },
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
    const { nama, email, password, jabatan, divisi_id, pangkat } = body;

    const dataToUpdate: any = {};
    if (nama) dataToUpdate.nama = nama;
    if (email) dataToUpdate.email = email;
    if (jabatan) dataToUpdate.jabatan = jabatan;
    if (divisi_id) dataToUpdate.divisi_id = parseInt(divisi_id);
    if (pangkat !== undefined) dataToUpdate.pangkat = pangkat;
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
