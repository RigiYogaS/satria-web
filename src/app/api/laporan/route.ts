import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/laporan - Get all reports
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const user_id = searchParams.get("user_id");
    const search = searchParams.get("search")?.trim();
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const whereClause: any = {};

    if (user_id) whereClause.user_id = parseInt(user_id);

    if (search) {
      whereClause.OR = [
        { judul: { contains: search, mode: "insensitive" } },
        { user: { nama: { contains: search, mode: "insensitive" } } },
        {
          user: {
            divisi: { nama_divisi: { contains: search, mode: "insensitive" } },
          },
        },
      ];
    }

    if (startDate && endDate) {
      const [sy, sm, sd] = startDate.split("-").map(Number);
      const [ey, em, ed] = endDate.split("-").map(Number);

      const start = new Date(Date.UTC(sy, sm - 1, sd, 0, 0, 0));
      const end = new Date(Date.UTC(ey, em - 1, ed + 1, 0, 0, 0)); 

      console.log("filter UTC range:", start.toISOString(), end.toISOString());

      whereClause.tanggal_upload = { gte: start, lt: end };
    }

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

    if (!file || !user_id || !judul) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: user_id, judul, file",
        },
        { status: 400 }
      );
    }

    // saat POST
    const tanggalStr = formData.get("tanggal_upload")?.toString();
    const tanggal_upload = tanggalStr
      ? new Date(tanggalStr + "T00:00:00")
      : new Date();

    const ext = path.extname(file.name);
    const base = path.basename(file.name, ext);
    const uniqueName = `${base}_${Date.now()}_${uuidv4()}${ext}`;
    const uploadsDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "laporanMingguan"
    );
    if (!fs.existsSync(uploadsDir))
      fs.mkdirSync(uploadsDir, { recursive: true });
    const filePath = `/uploads/laporanMingguan/${uniqueName}`;
    fs.writeFileSync(
      path.join(uploadsDir, uniqueName),
      Buffer.from(await file.arrayBuffer())
    );

    // Simpan path ke database
    const laporan = await prisma.laporan.create({
      data: {
        user_id: Number(user_id),
        judul: judul.toString(),
        file_path: filePath,
        tanggal_upload: tanggal_upload,
      },
    });

    console.log(
      "POST tanggal_upload saved:",
      laporan.tanggal_upload.toISOString()
    );

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
    const rawId = body.id ?? body.id_laporan ?? body.idLaporan;
    const { judul, file_path } = body;
    let { nilai_admin } = body;

    if (!rawId) {
      return NextResponse.json(
        { success: false, error: "Report ID is required" },
        { status: 400 }
      );
    }

    const id = parseInt(rawId);
    if (Number.isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid report ID" },
        { status: 400 }
      );
    }

    const existingLaporan = await prisma.laporan.findUnique({
      where: { id_laporan: id },
    });

    if (!existingLaporan) {
      return NextResponse.json(
        { success: false, error: "Report not found" },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (judul !== undefined) updateData.judul = judul;
    if (file_path !== undefined) updateData.file_path = file_path;

    if (nilai_admin !== undefined) {
      if (nilai_admin === null) {
        updateData.nilai_admin = null;
      } else {
        updateData.nilai_admin = String(nilai_admin);
      }
    }

    const updatedLaporan = await prisma.laporan.update({
      where: { id_laporan: id },
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
      { success: false, error: "Failed to update report" },
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
