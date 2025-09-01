import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Seed divisi data
  const divisiData = [
    { nama_divisi: "Bagprotokol" },
    { nama_divisi: "Bagkominter" },
    { nama_divisi: "Bagrenmin" },
    { nama_divisi: "Taud" },
    { nama_divisi: "Bagjatanrin" },
    { nama_divisi: "Bagbatanas" },
    { nama_divisi: "SPRI Kadiv" },
    { nama_divisi: "SPRI SES" },
    { nama_divisi: "Bagdamkeman" },
    { nama_divisi: "Bagkembangtas" },
    { nama_divisi: "BagKonverin" },
    { nama_divisi: "BagPI" },
    { nama_divisi: "SPRI KAROMISI" },
    { nama_divisi: "SPRI KAROKONVERIN" },
    { nama_divisi: "Bagwakinter" },
  ];

  for (const divisi of divisiData) {
    await prisma.divisi.upsert({
      where: { nama_divisi: divisi.nama_divisi },
      update: {},
      create: divisi,
    });
  }

  console.log("✅ Seed data berhasil ditambahkan!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
