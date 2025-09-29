import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/divisi - Get all divisions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const include_users = searchParams.get("include_users");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;
    const total = await prisma.divisi.count();

    const divisi = await prisma.divisi.findMany({
      include: {
        users:
          include_users === "true"
            ? {
                select: {
                  id_user: true,
                  nama: true,
                  email: true,
                  jabatan: true,
                  role: true,
                  created_at: true,
                },
              }
            : false,
      },
      orderBy: { nama_divisi: "asc" },
      skip,
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: divisi,
      count: divisi.length,
      total,
    });
  } catch (error) {
    console.error("Error fetching divisi:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch divisions",
      },
      { status: 500 }
    );
  }
}

// POST /api/divisi - Create division
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nama_divisi } = body;

    // Validation
    if (!nama_divisi) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required field: nama_divisi",
        },
        { status: 400 }
      );
    }

    // Check if division name already exists
    const existingDivisi = await prisma.divisi.findUnique({
      where: { nama_divisi },
    });

    if (existingDivisi) {
      return NextResponse.json(
        {
          success: false,
          error: "Division name already exists",
        },
        { status: 409 }
      );
    }

    // Create division
    const divisi = await prisma.divisi.create({
      data: {
        nama_divisi,
      },
      include: {
        users: {
          select: {
            id_user: true,
            nama: true,
            email: true,
            jabatan: true,
            role: true,
            created_at: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: divisi,
        message: "Division created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating divisi:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create division",
      },
      { status: 500 }
    );
  }
}

// PUT /api/divisi - Update division
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id_divisi, nama_divisi } = body;

    if (!id_divisi || !nama_divisi) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: id_divisi, nama_divisi",
        },
        { status: 400 }
      );
    }

    // Check if division exists
    const existingDivisi = await prisma.divisi.findUnique({
      where: { id_divisi: parseInt(id_divisi) },
    });

    if (!existingDivisi) {
      return NextResponse.json(
        {
          success: false,
          error: "Division not found",
        },
        { status: 404 }
      );
    }

    // Check if new name already exists (excluding current division)
    const duplicateCheck = await prisma.divisi.findFirst({
      where: {
        nama_divisi,
        NOT: {
          id_divisi: parseInt(id_divisi),
        },
      },
    });

    if (duplicateCheck) {
      return NextResponse.json(
        {
          success: false,
          error: "Division name already exists",
        },
        { status: 409 }
      );
    }

    const updatedDivisi = await prisma.divisi.update({
      where: { id_divisi: parseInt(id_divisi) },
      data: { nama_divisi },
      include: {
        users: {
          select: {
            id_user: true,
            nama: true,
            email: true,
            jabatan: true,
            role: true,
            created_at: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedDivisi,
      message: "Division updated successfully",
    });
  } catch (error) {
    console.error("Error updating divisi:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update division",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/divisi - Delete division
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id_divisi } = body;

    if (!id_divisi) {
      return NextResponse.json(
        {
          success: false,
          error: "Division ID is required",
        },
        { status: 400 }
      );
    }

    // Check if division exists
    const existingDivisi = await prisma.divisi.findUnique({
      where: { id_divisi: parseInt(id_divisi) },
      include: {
        users: true,
      },
    });

    if (!existingDivisi) {
      return NextResponse.json(
        {
          success: false,
          error: "Division not found",
        },
        { status: 404 }
      );
    }

    // Check if division has users
    if (existingDivisi.users.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Cannot delete division that has users. Please reassign users first.",
        },
        { status: 400 }
      );
    }

    await prisma.divisi.delete({
      where: { id_divisi: parseInt(id_divisi) },
    });

    return NextResponse.json({
      success: true,
      message: "Division deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting divisi:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete division",
      },
      { status: 500 }
    );
  }
}
