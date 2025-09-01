import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/ip-lokasi - Get all IP locations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ip = searchParams.get("ip");
    const lokasi = searchParams.get("lokasi");

    const whereClause: Record<string, unknown> = {};

    if (ip) whereClause.ip = { contains: ip, mode: "insensitive" };
    if (lokasi) whereClause.lokasi = { contains: lokasi, mode: "insensitive" };

    const ipLokasi = await prisma.ip_lokasi.findMany({
      where: whereClause,
      orderBy: { id: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: ipLokasi,
      count: ipLokasi.length,
    });
  } catch (error) {
    console.error("Error fetching IP lokasi:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch IP locations",
      },
      { status: 500 }
    );
  }
}

// POST /api/ip-lokasi - Create IP location
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ip, lokasi } = body;

    // Validation
    if (!ip || !lokasi) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: ip, lokasi",
        },
        { status: 400 }
      );
    }

    // Check if IP already exists
    const existingIP = await prisma.ip_lokasi.findFirst({
      where: { ip },
    });

    if (existingIP) {
      return NextResponse.json(
        {
          success: false,
          error: "IP address already exists",
        },
        { status: 409 }
      );
    }

    // Create IP location
    const ipLokasi = await prisma.ip_lokasi.create({
      data: {
        ip,
        lokasi,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: ipLokasi,
        message: "IP location created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating IP lokasi:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create IP location",
      },
      { status: 500 }
    );
  }
}

// PUT /api/ip-lokasi - Update IP location
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ip, lokasi } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "IP location ID is required",
        },
        { status: 400 }
      );
    }

    // Check if IP location exists
    const existingIPLokasi = await prisma.ip_lokasi.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingIPLokasi) {
      return NextResponse.json(
        {
          success: false,
          error: "IP location not found",
        },
        { status: 404 }
      );
    }

    // Check if new IP already exists (excluding current record)
    if (ip) {
      const duplicateCheck = await prisma.ip_lokasi.findFirst({
        where: {
          ip,
          NOT: {
            id: parseInt(id),
          },
        },
      });

      if (duplicateCheck) {
        return NextResponse.json(
          {
            success: false,
            error: "IP address already exists",
          },
          { status: 409 }
        );
      }
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {};

    if (ip) updateData.ip = ip;
    if (lokasi) updateData.lokasi = lokasi;

    const updatedIPLokasi = await prisma.ip_lokasi.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: updatedIPLokasi,
      message: "IP location updated successfully",
    });
  } catch (error) {
    console.error("Error updating IP lokasi:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update IP location",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/ip-lokasi - Delete IP location
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "IP location ID is required",
        },
        { status: 400 }
      );
    }

    // Check if IP location exists
    const existingIPLokasi = await prisma.ip_lokasi.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingIPLokasi) {
      return NextResponse.json(
        {
          success: false,
          error: "IP location not found",
        },
        { status: 404 }
      );
    }

    await prisma.ip_lokasi.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({
      success: true,
      message: "IP location deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting IP lokasi:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete IP location",
      },
      { status: 500 }
    );
  }
}
