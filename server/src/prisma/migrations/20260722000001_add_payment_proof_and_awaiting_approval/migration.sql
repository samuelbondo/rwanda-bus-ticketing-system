-- Add AWAITING_APPROVAL to BookingStatus enum
ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'AWAITING_APPROVAL';

-- Add proofUrl column to payments table
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "proofUrl" TEXT;
