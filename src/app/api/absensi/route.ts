import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/absensi - Get all attendance records
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get("user_id");
    const tanggal = searchParams.get("tanggal");
    const status = searchParams.get("status");
    const limit = searchParams.get("limit");

    const whereClause: any = {};

    if (user_id) whereClause.user_id = parseInt(user_id);
    if (status) whereClause.status = status;
    if (tanggal) {
      const startDate = new Date(tanggal);
      const endDate = new Date(tanggal);
      endDate.setDate(endDate.getDate() + 1);

      whereClause.tanggal = {
        gte: startDate,
        lt: endDate,
      };
    }

    const absensi = await prisma.absensi.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id_user: true,
            nama: true,
            email: true,
            jabatan: true,
            divisi: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
      take: limit ? parseInt(limit) : undefined,
    });

    return NextResponse.json({
      success: true,
      data: absensi,
      count: absensi.length,
    });
  } catch (error) {
    console.error("Error fetching absensi:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch attendance records",
      },
      { status: 500 }
    );
  }
}

// POST /api/absensi - Create attendance record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, tanggal, waktu, lokasi, ip_address, status, keterangan } =
      body;

    // Validation
    if (!user_id || !tanggal || !waktu || !status) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: user_id, tanggal, waktu, status",
        },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.users.findUnique({
      where: { id_user: parseInt(user_id) },
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

    // Create attendance record
    const absensi = await prisma.absensi.create({
      data: {
        user_id: parseInt(user_id),
        tanggal: new Date(tanggal),
        waktu: new Date(waktu),
        lokasi,
        ip_address,
        status,
        keterangan,
      },
      include: {
        user: {
          select: {
            id_user: true,
            nama: true,
            email: true,
            jabatan: true,
            divisi: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: absensi,
        message: "Attendance record created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating absensi:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create attendance record",
      },
      { status: 500 }
    );
  }
}

// PUT /api/absensi - Update attendance record
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id_absensi,
      tanggal,
      waktu,
      lokasi,
      ip_address,
      status,
      keterangan,
    } = body;

    if (!id_absensi) {
      return NextResponse.json(
        {
          success: false,
          error: "Attendance ID is required",
        },
        { status: 400 }
      );
    }

    // Check if attendance record exists
    const existingAbsensi = await prisma.absensi.findUnique({
      where: { id_absensi: parseInt(id_absensi) },
    });

    if (!existingAbsensi) {
      return NextResponse.json(
        {
          success: false,
          error: "Attendance record not found",
        },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};

    if (tanggal) updateData.tanggal = new Date(tanggal);
    if (waktu) updateData.waktu = new Date(waktu);
    if (lokasi) updateData.lokasi = lokasi;
    if (ip_address) updateData.ip_address = ip_address;
    if (status) updateData.status = status;
    if (keterangan !== undefined) updateData.keterangan = keterangan;

    const updatedAbsensi = await prisma.absensi.update({
      where: { id_absensi: parseInt(id_absensi) },
      data: updateData,
      include: {
        user: {
          select: {
            id_user: true,
            nama: true,
            email: true,
            jabatan: true,
            divisi: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedAbsensi,
      message: "Attendance record updated successfully",
    });
  } catch (error) {
    console.error("Error updating absensi:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update attendance record",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/absensi - Delete attendance record
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id_absensi } = body;

    if (!id_absensi) {
      return NextResponse.json(
        {
          success: false,
          error: "Attendance ID is required",
        },
        { status: 400 }
      );
    }

    // Check if attendance record exists
    const existingAbsensi = await prisma.absensi.findUnique({
      where: { id_absensi: parseInt(id_absensi) },
    });

    if (!existingAbsensi) {
      return NextResponse.json(
        {
          success: false,
          error: "Attendance record not found",
        },
        { status: 404 }
      );
    }

    await prisma.absensi.delete({
      where: { id_absensi: parseInt(id_absensi) },
    });

    return NextResponse.json({
      success: true,
      message: "Attendance record deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting absensi:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete attendance record",
      },
      { status: 500 }
    );
  }
}
