// @ts-nocheck

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
  const ipLokasiData = [
    { ip: "192.168.200.53", nama_wifi: "DIVHUBINTER POLRI" },
    { ip: "10.87.44.126", nama_wifi: "VVIP_OPEN" },
    { ip: "103.136.57.161", nama_wifi: "Bhaap" },
    // add CIDR / prefix examples for more tolerant matching:
    { ip: "103.136.57.0/24", nama_wifi: "Kantor Utama (CIDR)" },
    { ip: "120.29.225.", nama_wifi: "Office Pool (prefix)" },
    { ip: "114.10.64.0/24", nama_wifi: "Kantor Cabang X (CIDR)" },
  ];

  const ipResult = await prisma.ipLokasi.createMany({
    data: ipLokasiData,
    skipDuplicates: true,
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
