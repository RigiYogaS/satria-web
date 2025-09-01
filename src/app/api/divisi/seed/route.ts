import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const divisiData = [
      { id_divisi: 1, nama_divisi: "Bagprotokol" },
      { id_divisi: 2, nama_divisi: "Bagkominter" },
      { id_divisi: 3, nama_divisi: "Bagrenmin" },
      { id_divisi: 4, nama_divisi: "Taud" },
      { id_divisi: 5, nama_divisi: "Bagjatanrin" },
      { id_divisi: 6, nama_divisi: "Bagbatanas" },
      { id_divisi: 7, nama_divisi: "SPRI Kadiv" },
      { id_divisi: 8, nama_divisi: "SPRI SES" },
      { id_divisi: 9, nama_divisi: "Bagdamkeman" },
      { id_divisi: 10, nama_divisi: "Bagkembangtas" },
      { id_divisi: 11, nama_divisi: "BagKonverin" },
      { id_divisi: 12, nama_divisi: "BagPI" },
      { id_divisi: 13, nama_divisi: "SPRI KAROMISI" },
      { id_divisi: 14, nama_divisi: "SPRI KAROKONVERIN" },
      { id_divisi: 15, nama_divisi: "Bagwakinter" },
    ];

    // Check if data already exists
    const existingCount = await prisma.divisi.count();

    if (existingCount > 0) {
      return NextResponse.json(
        { message: `Database sudah memiliki ${existingCount} divisi` },
        { status: 200 }
      );
    }

    // Insert all divisi data
    const result = await prisma.divisi.createMany({
      data: divisiData,
      skipDuplicates: true,
    });

    return NextResponse.json(
      {
        message: `Berhasil menambahkan ${result.count} divisi`,
        data: divisiData,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error seeding divisi:", error);
    return NextResponse.json(
      { error: "Gagal menambahkan data divisi: " + error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const divisi = await prisma.divisi.findMany({
      orderBy: { id_divisi: "asc" },
    });

    return NextResponse.json(divisi);
  } catch (error: any) {
    console.error("Error fetching divisi:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data divisi: " + error.message },
      { status: 500 }
    );
  }
}
