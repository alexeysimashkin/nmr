import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const token = getTokenFromRequest(request as any)
    const decoded = verifyToken(token || '')

    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      )
    }

    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        notifications: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    })

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error('Get bookings error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const token = getTokenFromRequest(request as any)
    const decoded = verifyToken(token || '')

    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      )
    }

    const data = await request.json()
    
    // Генерируем код бронирования
    const bookingCode = generateBookingCode()
    
    const booking = await prisma.booking.create({
      data: {
        ...data,
        bookingCode,
        departureDate: new Date(data.departureDate),
        departureTime: new Date(data.departureTime),
        arrivalTime: new Date(data.arrivalTime),
      }
    })

    return NextResponse.json({ booking }, { status: 201 })
  } catch (error) {
    console.error('Create booking error:', error)
    return NextResponse.json(
      { error: 'Ошибка создания бронирования' },
      { status: 500 }
    )
  }
}

function generateBookingCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}
