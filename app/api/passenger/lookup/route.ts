import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { lastName, bookingCode } = await request.json()

    if (!lastName || !bookingCode) {
      return NextResponse.json(
        { error: 'Фамилия и код бронирования обязательны' },
        { status: 400 }
      )
    }

    const booking = await prisma.booking.findFirst({
      where: {
        bookingCode: bookingCode.toUpperCase(),
        lastName: {
          equals: lastName,
          mode: 'insensitive'
        }
      },
      include: {
        notifications: {
          orderBy: { createdAt: 'desc' },
          where: {
            isRead: false
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Бронирование не найдено. Проверьте фамилию и код бронирования.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ booking })
  } catch (error) {
    console.error('Passenger lookup error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
