import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/cuti - Get all leave requests
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get("user_id");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (user_id) whereClause.user_id = parseInt(user_id);
    if (status) whereClause.status = status;

    const cuti = await prisma.cuti.findMany({
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
      data: cuti,
      count: cuti.length,
    });
  } catch (error) {
    console.error("Error fetching cuti:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch leave requests",
      },
      { status: 500 }
    );
  }
}

// POST /api/cuti - Create leave request
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData(); 
    const user_id = formData.get("user_id");
    const alasan = formData.get("alasan");
    const bukti_file = formData.get("bukti_file"); 
    const keterangan = formData.get("keterangan");
    const lebih_dari_sehari = formData.get("lebih_dari_sehari") === "true";
    const tgl_mulai = formData.get("tgl_mulai");
    const tgl_selesai = formData.get("tgl_selesai");

    if (!user_id || !alasan || !tgl_mulai || !tgl_selesai) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: user_id, alasan, tgl_mulai, tgl_selesai",
        },
        { status: 400 }
      );
    }

    const cuti = await prisma.cuti.create({
      data: {
        user_id: parseInt(user_id.toString()),
        alasan: alasan.toString(),
        bukti_file: bukti_file instanceof File ? bukti_file.name : "",
        keterangan: keterangan?.toString() ?? "",
        lebih_dari_sehari,
        tgl_mulai: new Date(tgl_mulai.toString()),
        tgl_selesai: new Date(tgl_selesai.toString()),
        status: "pending",
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: cuti,
        message: "Leave request created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating cuti:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create leave request",
      },
      { status: 500 }
    );
  }
}

// PUT /api/cuti - Update leave request
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      alasan,
      bukti_file,
      keterangan,
      lebih_dari_sehari,
      tgl_mulai,
      tgl_selesai,
      status,
    } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Leave request ID is required",
        },
        { status: 400 }
      );
    }

    // Check if leave request exists
    const existingCuti = await prisma.cuti.findUnique({
      where: { id_cuti: parseInt(id) },
    });

    if (!existingCuti) {
      return NextResponse.json(
        {
          success: false,
          error: "Leave request not found",
        },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};

    if (alasan) updateData.alasan = alasan;
    if (bukti_file !== undefined) updateData.bukti_file = bukti_file;
    if (keterangan !== undefined) updateData.keterangan = keterangan;
    if (lebih_dari_sehari !== undefined)
      updateData.lebih_dari_sehari = Boolean(lebih_dari_sehari);
    if (tgl_mulai) updateData.tgl_mulai = new Date(tgl_mulai);
    if (tgl_selesai) updateData.tgl_selesai = new Date(tgl_selesai);
    if (status) updateData.status = status;

    const updatedCuti = await prisma.cuti.update({
      where: { id_cuti: parseInt(id) },
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
      data: updatedCuti,
      message: "Leave request updated successfully",
    });
  } catch (error) {
    console.error("Error updating cuti:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update leave request",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/cuti - Delete leave request
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Leave request ID is required",
        },
        { status: 400 }
      );
    }

    // Check if leave request exists
    const existingCuti = await prisma.cuti.findUnique({
      where: { id_cuti: parseInt(id) },
    });

    if (!existingCuti) {
      return NextResponse.json(
        {
          success: false,
          error: "Leave request not found",
        },
        { status: 404 }
      );
    }

    await prisma.cuti.delete({
      where: { id_cuti: parseInt(id) },
    });

    return NextResponse.json({
      success: true,
      message: "Leave request deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting cuti:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete leave request",
      },
      { status: 500 }
    );
  }
}
