import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  return await addColumns()
}

export async function POST() {
  return await addColumns()
}

async function addColumns() {
  try {
    await prisma.$connect()
    console.log('Connected, adding columns...')

    const newColumns = [
      { name: 'isDiverted', sql: `ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "isDiverted" BOOLEAN NOT NULL DEFAULT false` },
      { name: 'divertedToCity', sql: `ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "divertedToCity" TEXT` },
      { name: 'divertedToCode', sql: `ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "divertedToCode" TEXT` },
      { name: 'isDistress', sql: `ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "isDistress" BOOLEAN NOT NULL DEFAULT false` },
      { name: 'distressCode', sql: `ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "distressCode" TEXT` },
      { name: 'hotelAddress', sql: `ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "hotelAddress" TEXT` },
      { name: 'hotelRoom', sql: `ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "hotelRoom" TEXT` },
    ]

    const results: string[] = []

    for (const col of newColumns) {
      try {
        await prisma.$executeRawUnsafe(col.sql)
        console.log(`Added column: ${col.name}`)
        results.push(`✅ ${col.name}`)
      } catch (e: any) {
        if (e?.message?.includes('already exists')) {
          console.log(`Column ${col.name} already exists`)
          results.push(`⏭️ ${col.name} (уже есть)`)
        } else {
          console.error(`Error adding ${col.name}:`, e?.message)
          results.push(`❌ ${col.name}: ${e?.message}`)
        }
      }
    }

    return NextResponse.json({ 
      success: true,
      message: 'Колонки обработаны',
      results
    })
  } catch (error: any) {
    console.error('Add columns error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error?.message || String(error)
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
