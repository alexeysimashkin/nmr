import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    await prisma.$connect()
    console.log('Connected to database')

    // Удаляем старые таблицы
    try {
      await prisma.$executeRaw`DROP TABLE IF EXISTS "Notification" CASCADE`
      console.log('Dropped Notification')
    } catch (e) {
      console.log('Drop Notification error:', e)
    }
    
    try {
      await prisma.$executeRaw`DROP TABLE IF EXISTS "Booking" CASCADE`
      console.log('Dropped Booking')
    } catch (e) {
      console.log('Drop Booking error:', e)
    }
    
    try {
      await prisma.$executeRaw`DROP TABLE IF EXISTS "User" CASCADE`
      console.log('Dropped User')
    } catch (e) {
      console.log('Drop User error:', e)
    }

    // Создаём таблицу User
    await prisma.$executeRaw`
      CREATE TABLE "User" (
          "id" TEXT NOT NULL,
          "email" TEXT NOT NULL,
          "password" TEXT NOT NULL,
          "role" TEXT NOT NULL DEFAULT 'admin',
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "User_pkey" PRIMARY KEY ("id")
      )
    `
    console.log('User table created')

    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email")
    `

    // Создаём таблицу Booking со ВСЕМИ полями
    await prisma.$executeRaw`
      CREATE TABLE "Booking" (
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
          "isDiverted" BOOLEAN NOT NULL DEFAULT false,
          "divertedToCity" TEXT,
          "divertedToCode" TEXT,
          "isDistress" BOOLEAN NOT NULL DEFAULT false,
          "distressCode" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
      )
    `
    console.log('Booking table created with all columns')

    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "Booking_bookingCode_key" ON "Booking"("bookingCode")
    `

    // Создаём таблицу Notification
    await prisma.$executeRaw`
      CREATE TABLE "Notification" (
          "id" TEXT NOT NULL,
          "message" TEXT NOT NULL,
          "type" TEXT NOT NULL,
          "isRead" BOOLEAN NOT NULL DEFAULT false,
          "bookingId" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
      )
    `
    console.log('Notification table created')

    await prisma.$executeRaw`
      ALTER TABLE "Notification" 
      ADD CONSTRAINT "Notification_bookingId_fkey" 
      FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") 
      ON DELETE CASCADE ON UPDATE CASCADE
    `

    return NextResponse.json({ 
      success: true,
      message: 'Все таблицы пересозданы с новыми полями'
    })
  } catch (error: any) {
    console.error('Create tables error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error?.message || String(error)
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
