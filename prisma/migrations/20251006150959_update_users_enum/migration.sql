/*
  Warnings:

  - The values [Telat,Izin,Alpha] on the enum `AbsensiStatus` will be removed. If these variants are still used in the database, this will fail.
  - The `status` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `role` on the `users` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "CheckinStatus" AS ENUM ('tepat_waktu', 'telat');

-- CreateEnum
CREATE TYPE "CheckoutStatus" AS ENUM ('normal', 'lembur', 'setengah_hari');

-- AlterEnum
BEGIN;
CREATE TYPE "AbsensiStatus_new" AS ENUM ('Hadir');
ALTER TABLE "absensi" ALTER COLUMN "status" TYPE "AbsensiStatus_new" USING ("status"::text::"AbsensiStatus_new");
ALTER TYPE "AbsensiStatus" RENAME TO "AbsensiStatus_old";
ALTER TYPE "AbsensiStatus_new" RENAME TO "AbsensiStatus";
DROP TYPE "public"."AbsensiStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "absensi" ADD COLUMN     "accuracy" DECIMAL(65,30),
ADD COLUMN     "checkin_status" "CheckinStatus",
ADD COLUMN     "checkout_status" "CheckoutStatus",
ADD COLUMN     "jam_checkout" TIMESTAMP(3),
ADD COLUMN     "laporan_harian" TEXT,
ADD COLUMN     "latitude" DECIMAL(65,30),
ADD COLUMN     "longitude" DECIMAL(65,30),
ALTER COLUMN "status" SET DEFAULT 'Hadir';

-- AlterTable
ALTER TABLE "users" DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'PENDING';
