import { prisma } from "@/lib/prisma";

// Ambil semua user
export async function getUsers() {
  return prisma.users.findMany({
    select: {
      id_user: true,
      email: true,
      nama: true,
      jabatan: true,
      divisi_id: true,
      role: true,
      status: true,
      created_at: true,
      updated_at: true,
    },
    orderBy: { created_at: "desc" },
  });
}

// Buat user baru
export async function createUser(data: {
  email: string;
  nama: string;
  jabatan: string;
  divisi_id: number;
  password: string;
  role: string;
  status?: string;
  otp_code?: string;
  otp_expires_at?: Date;
}) {
  return prisma.users.create({
    data,
  });
}
