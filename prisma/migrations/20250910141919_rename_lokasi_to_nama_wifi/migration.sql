-- CreateEnum
CREATE TYPE "public"."AbsensiStatus" AS ENUM ('Hadir', 'Telat', 'Izin', 'Alpha');

-- CreateEnum
CREATE TYPE "public"."CutiStatus" AS ENUM ('pending', 'disetujui', 'ditolak');

-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('pegawai', 'admin');

-- CreateEnum
CREATE TYPE "public"."UserStatus" AS ENUM ('PENDING', 'ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "public"."users" (
    "id_user" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "jabatan" TEXT,
    "divisi_id" INTEGER NOT NULL,
    "otp_code" TEXT,
    "otp_expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "public"."absensi" (
    "id_absensi" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "tanggal" DATE NOT NULL,
    "waktu" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lokasi" TEXT,
    "ip_address" TEXT,
    "keterangan" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "public"."AbsensiStatus" NOT NULL,

    CONSTRAINT "absensi_pkey" PRIMARY KEY ("id_absensi")
);

-- CreateTable
CREATE TABLE "public"."cuti" (
    "id_cuti" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "alasan" VARCHAR(50) NOT NULL,
    "bukti_file" TEXT,
    "keterangan" TEXT,
    "lebih_dari_sehari" BOOLEAN,
    "tgl_mulai" DATE NOT NULL,
    "tgl_selesai" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "public"."CutiStatus" NOT NULL DEFAULT 'pending',

    CONSTRAINT "cuti_pkey" PRIMARY KEY ("id_cuti")
);

-- CreateTable
CREATE TABLE "public"."laporan" (
    "id_laporan" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "judul" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "tanggal_upload" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nilai_admin" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "laporan_pkey" PRIMARY KEY ("id_laporan")
);

-- CreateTable
CREATE TABLE "public"."ip_lokasi" (
    "id" SERIAL NOT NULL,
    "ip" TEXT NOT NULL,
    "nama_wifi" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ip_lokasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."divisi" (
    "id_divisi" SERIAL NOT NULL,
    "nama_divisi" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "divisi_pkey" PRIMARY KEY ("id_divisi")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ip_lokasi_ip_key" ON "public"."ip_lokasi"("ip");

-- CreateIndex
CREATE UNIQUE INDEX "divisi_nama_divisi_key" ON "public"."divisi"("nama_divisi");

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_divisi_id_fkey" FOREIGN KEY ("divisi_id") REFERENCES "public"."divisi"("id_divisi") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."absensi" ADD CONSTRAINT "absensi_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cuti" ADD CONSTRAINT "cuti_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."laporan" ADD CONSTRAINT "laporan_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;
