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
    
    const requiredFields = [
      'lastName', 'firstName', 'flightNumber', 
      'departureDate', 'departureTime', 'arrivalTime',
      'originCity', 'originCode', 'destinationCity', 'destinationCode'
    ]
    
    const missingFields = requiredFields.filter(field => !data[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Отсутствуют обязательные поля: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    let bookingCode = ''
    let isUnique = false
    let attempts = 0
    
    while (!isUnique && attempts < 10) {
      bookingCode = generateBookingCode()
      const existing = await prisma.booking.findUnique({
        where: { bookingCode }
      })
      if (!existing) {
        isUnique = true
      }
      attempts++
    }

    if (!isUnique) {
      return NextResponse.json(
        { error: 'Не удалось сгенерировать уникальный код бронирования' },
        { status: 500 }
      )
    }

    const booking = await prisma.booking.create({
      data: {
        bookingCode,
        lastName: data.lastName,
        firstName: data.firstName,
        middleName: data.middleName || null,
        flightNumber: data.flightNumber,
        departureDate: new Date(data.departureDate),
        departureTime: new Date(data.departureTime),
        arrivalTime: new Date(data.arrivalTime),
        originCity: data.originCity,
        originCode: data.originCode.toUpperCase(),
        destinationCity: data.destinationCity,
        destinationCode: data.destinationCode.toUpperCase(),
        checkInDesks: data.checkInDesks || null,
        gate: data.gate || null,
        boardingType: data.boardingType || 'jetbridge',
      }
    })

    return NextResponse.json({ booking }, { status: 201 })
  } catch (error: any) {
    console.error('Create booking error:', error)
    
    let errorMessage = 'Ошибка создания бронирования'
    
    if (error?.code === 'P2002') {
      errorMessage = 'Бронирование с таким кодом уже существует'
    } else if (error?.message) {
      errorMessage = `Ошибка: ${error.message}`
    }
    
    return NextResponse.json(
      { error: errorMessage },
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
