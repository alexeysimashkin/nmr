import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    await prisma.$connect()

    // Создаём таблицы через raw SQL
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "User" (
          "id" TEXT NOT NULL,
          "email" TEXT NOT NULL,
          "password" TEXT NOT NULL,
          "role" TEXT NOT NULL DEFAULT 'admin',
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "User_pkey" PRIMARY KEY ("id")
      )
    `

    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email")
    `

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Booking" (
          "id" TEXT NOT NULL,
          "bookingCode" TEXT NOT NULL,
          "lastName" TEXT NOT NULL,
          "firstName" TEXT NOT NULL,
          "middleName" TEXT,
          "flightNumber" TEXT NOT NULL,
          "departureDate" TIMESTAMP(3) NOT NULL,
          "departureTime" TIMESTAMP(3) NOT NULL,
          "arrivalTime" TIMESTAMP(3) NOT NULL,
          "originCity" TEXT NOT NULL,
          "originCode" TEXT NOT NULL,
          "destinationCity" TEXT NOT NULL,
          "destinationCode" TEXT NOT NULL,
          "checkInDesks" TEXT,
          "gate" TEXT,
          "boardingType" TEXT,
          "isCheckedIn" BOOLEAN NOT NULL DEFAULT false,
          "checkInClosed" BOOLEAN NOT NULL DEFAULT false,
          "isBoarding" BOOLEAN NOT NULL DEFAULT false,
          "boardingClosed" BOOLEAN NOT NULL DEFAULT false,
          "hasDeparted" BOOLEAN NOT NULL DEFAULT false,
          "actualDeparture" TIMESTAMP(3),
          "isDelayed" BOOLEAN NOT NULL DEFAULT false,
          "delayedUntil" TIMESTAMP(3),
          "hotelAddress" TEXT,
          "hotelRoom" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
      )
    `

    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "Booking_bookingCode_key" ON "Booking"("bookingCode")
    `

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Notification" (
          "id" TEXT NOT NULL,
          "message" TEXT NOT NULL,
          "type" TEXT NOT NULL,
          "isRead" BOOLEAN NOT NULL DEFAULT false,
          "bookingId" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
      )
    `

    await prisma.$executeRaw`
      ALTER TABLE "Notification" 
      ADD CONSTRAINT "Notification_bookingId_fkey" 
      FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") 
      ON DELETE CASCADE ON UPDATE CASCADE
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: String(error)
    })
  } finally {
    await prisma.$disconnect()
  }
}
