import { prisma } from "@/lib/prisma";

export async function getUsers() {
  return await prisma.users.findMany({
    select: {
      id_user: true,
      nama: true,
      email: true,
      jabatan: true,
      divisi: true,
      role: true,
      created_at: true,
      updated_at: true,
    },
  });
}

export async function createUser(data: {
  email: string;
  nama: string;
  jabatan: string;
  divisi_id: number;
  password: string;
  role?: string; // Change to string
  status?: string; // Change to string
  otp_code?: string;
  otp_expires_at?: Date; // Fix field name
}) {
  return await prisma.users.create({
    data: {
      email: data.email,
      nama: data.nama,
      jabatan: data.jabatan,
      divisi_id: data.divisi_id,
      password: data.password,
      role: data.role || "pegawai",
      status: data.status || "PENDING",
      otp_code: data.otp_code,
      otp_expires_at: data.otp_expires_at, // Fix field name
    } as any,
    include: {
      divisi: true,
    },
  });
}

export async function getUserByEmail(email: string) {
  return await prisma.users.findUnique({
    where: { email },
    select: {
      id_user: true,
      nama: true,
      email: true,
      jabatan: true,
      divisi: true,
      role: true,
      password: true,
      created_at: true,
      updated_at: true,
    },
  });
}
