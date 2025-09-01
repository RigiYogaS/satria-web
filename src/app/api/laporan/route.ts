import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/laporan - Get all reports
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get("user_id");
    const limit = searchParams.get("limit");

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
      take: limit ? parseInt(limit) : undefined,
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
    const body = await request.json();
    const { user_id, judul, file_path, nilai_admin } = body;

    // Validation
    if (!user_id || !judul || !file_path) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: user_id, judul, file_path",
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

    // Create report
    const laporan = await prisma.laporan.create({
      data: {
        user_id: parseInt(user_id),
        judul,
        file_path,
        nilai_admin,
        tanggal_upload: new Date(),
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
        data: laporan,
        message: "Report created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating laporan:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create report",
      },
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
      where: { id: parseInt(id) },
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
      where: { id: parseInt(id) },
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
      where: { id: parseInt(id) },
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
      where: { id: parseInt(id) },
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
