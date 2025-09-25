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

  console.log("Mulai seeding divisi...");
  const divisiResult = await prisma.divisi.createMany({
    data: divisiData,
    skipDuplicates: true,
  });
  console.log("Selesai seeding divisi:", divisiResult);

  console.log("Mulai seeding ip_lokasi...");
  const ipResult = await prisma.ipLokasi.create({
    data: {
      ip: "192.168.200.53",
      nama_wifi: "DIVHUBINTER POLRI",
    },
  });
  console.log("Selesai seeding ip_lokasi:", ipResult);

  console.log("semua seed berhasil!");
}

main()
  .catch((e) => {
    console.error("Error saat seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
