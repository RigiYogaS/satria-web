import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


// GET /api/laporan - Get all reports
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const user_id = searchParams.get("user_id");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (user_id) whereClause.user_id = parseInt(user_id);

    const laporan = await prisma.laporan.findMany({
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
      skip,
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: laporan,
      count: laporan.length,
    });
  } catch (error) {
    console.error("Error fetching laporan:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch reports",
      },
      { status: 500 }
    );
  }
}

// POST /api/laporan - Create report
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const user_id = formData.get("user_id");
    const judul = formData.get("judul");
    const file_path = formData.get("file_path")?.toString() || "";

    if (!file || !user_id || !judul) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: user_id, judul, file",
        },
        { status: 400 }
      );
    }

    // Tambahkan setelah validasi
    const laporan = await prisma.laporan.create({
      data: {
        user_id: Number(user_id),
        judul: judul.toString(),
        file_path, 
        tanggal_upload: new Date(),
      },
    });

    return NextResponse.json(
      { success: true, message: "Report created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating laporan:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create report" },
      { status: 500 }
    );
  }
}

// PUT /api/laporan - Update report
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, judul, file_path, nilai_admin } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Report ID is required",
        },
        { status: 400 }
      );
    }

    // Check if report exists
    const existingLaporan = await prisma.laporan.findUnique({
      where: { id_laporan: parseInt(id) },
    });

    if (!existingLaporan) {
      return NextResponse.json(
        {
          success: false,
          error: "Report not found",
        },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};

    if (judul) updateData.judul = judul;
    if (file_path) updateData.file_path = file_path;
    if (nilai_admin !== undefined) updateData.nilai_admin = nilai_admin;

    const updatedLaporan = await prisma.laporan.update({
      where: { id_laporan: parseInt(id) },
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
      data: updatedLaporan,
      message: "Report updated successfully",
    });
  } catch (error) {
    console.error("Error updating laporan:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update report",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/laporan - Delete report
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Report ID is required",
        },
        { status: 400 }
      );
    }

    // Check if report exists
    const existingLaporan = await prisma.laporan.findUnique({
      where: { id_laporan: parseInt(id) },
    });

    if (!existingLaporan) {
      return NextResponse.json(
        {
          success: false,
          error: "Report not found",
        },
        { status: 404 }
      );
    }

    await prisma.laporan.delete({
      where: { id_laporan: parseInt(id) },
    });

    return NextResponse.json({
      success: true,
      message: "Report deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting laporan:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete report",
      },
      { status: 500 }
    );
  }
}
