import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    await prisma.$connect()
    console.log('Connected to database')

    // Принудительно удаляем таблицы в правильном порядке
    try {
      await prisma.$executeRaw`DROP TABLE IF EXISTS "Notification" CASCADE`
      console.log('Dropped Notification')
    } catch (e: any) {
      console.log('Drop Notification error:', e?.message)
    }
    
    try {
      await prisma.$executeRaw`DROP TABLE IF EXISTS "Booking" CASCADE`
      console.log('Dropped Booking')
    } catch (e: any) {
      console.log('Drop Booking error:', e?.message)
    }
    
    try {
      await prisma.$executeRaw`DROP TABLE IF EXISTS "User" CASCADE`
      console.log('Dropped User')
    } catch (e: any) {
      console.log('Drop User error:', e?.message)
    }

    // Небольшая пауза
    await new Promise(resolve => setTimeout(resolve, 500))

    // Создаём таблицу User
    try {
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
      console.log('User table created')
    } catch (e: any) {
      console.log('Create User error:', e?.message)
    }

    try {
      await prisma.$executeRaw`
        CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email")
      `
    } catch (e: any) {
      console.log('User index error:', e?.message)
    }

    // Создаём таблицу Booking со ВСЕМИ полями
    try {
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
      console.log('Booking table created')
    } catch (e: any) {
      console.log('Create Booking error:', e?.message)
      // Если таблица существует, пробуем добавить колонки
      return NextResponse.json({ 
        success: false,
        error: 'Таблица Booking уже существует. Используйте кнопку "Добавить колонки".',
        needAddColumns: true
      })
    }

    try {
      await prisma.$executeRaw`
        CREATE UNIQUE INDEX IF NOT EXISTS "Booking_bookingCode_key" ON "Booking"("bookingCode")
      `
    } catch (e: any) {
      console.log('Booking index error:', e?.message)
    }

    // Создаём таблицу Notification
    try {
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
      console.log('Notification table created')
    } catch (e: any) {
      console.log('Create Notification error:', e?.message)
    }

    try {
      await prisma.$executeRaw`
        ALTER TABLE "Notification" 
        ADD CONSTRAINT "Notification_bookingId_fkey" 
        FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") 
        ON DELETE CASCADE ON UPDATE CASCADE
      `
    } catch (e: any) {
      console.log('Foreign key error:', e?.message)
    }

    return NextResponse.json({ 
      success: true,
      message: 'Таблицы созданы успешно!'
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
