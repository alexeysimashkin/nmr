import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Проверяем подключение
    await prisma.$connect()
    
    // Проверяем таблицы
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `
    
    // Пробуем найти любое бронирование
    const booking = await prisma.booking.findFirst()
    
    return NextResponse.json({
      success: true,
      database: 'connected',
      tables: tables,
      hasBookings: !!booking,
      sampleBooking: booking ? {
        id: booking.id,
        code: booking.bookingCode
      } : null
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error?.message || String(error),
      code: error?.code,
      meta: error?.meta
    })
  } finally {
    await prisma.$disconnect()
  }
}
