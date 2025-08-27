import { prisma } from "@/lib/prisma";

export async function getUsers() {
  return await prisma.user.findMany({
    include: {
      pegawai: true,
    },
  });
}

export async function createUser(data: {
  email: string;
  nama: string;
  jabatan: string;
  bagian: string;
  password: string;
}) {
  // Map string bagian to enum value
  const bagianMap: Record<string, string> = {
    Bagprotokol: "Bagprotokol",
    Bagkominter: "Bagkominter",
    Bagrenmin: "Bagrenmin",
    Taud: "Taud",
    Bagjatanrin: "Bagjatanrin",
    Bagbatanas: "Bagbatanas",
    "SPRI Kadiv": "SPRI_Kadiv",
    "SPRI SES": "SPRI_SES",
    Bagdamkeman: "Bagdamkeman",
    Bagkembangtas: "Bagkembantas",
    BagKonverin: "Bagkonverin",
    BagPI: "Bagpi",
    "SPRI KAROMISI": "SPRI_Karomisi",
    "SPRI KAROKONVERIN": "SPRI_Karokonverin",
    Bagwakinter: "Bagwakinter",
  };

  const bagianEnum = bagianMap[data.bagian] || data.bagian;

  // Create pegawai first, then user
  const result = await prisma.$transaction(async (tx: any) => {
    // Create pegawai
    const pegawai = await tx.pegawai.create({
      data: {
        nama: data.nama,
        jabatan: data.jabatan,
        divisi: bagianEnum,
      },
    });

    // Create user linked to pegawai
    const user = await tx.user.create({
      data: {
        email: data.email,
        password: data.password,
        role: "pegawai",
        pegawaiId: pegawai.id,
      },
      include: {
        pegawai: true,
      },
    });

    return user;
  });

  return result;
}

export async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email },
    include: { pegawai: true },
  });
}
