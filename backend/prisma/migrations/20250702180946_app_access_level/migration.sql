-- CreateEnum
CREATE TYPE "ApplicationAccessLevel" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN', 'GUEST');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "applicationAccessLevel" "ApplicationAccessLevel" NOT NULL DEFAULT 'USER';
