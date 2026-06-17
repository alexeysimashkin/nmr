import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    await prisma.$connect()

    const existingBooking = await prisma.booking.findUnique({
      where: { bookingCode: 'TEST01' }
    })

    if (!existingBooking) {
      await prisma.booking.create({
        data: {
          id: 'booking001',
          bookingCode: 'TEST01',
          lastName: 'Иванов',
          firstName: 'Иван',
          middleName: 'Иванович',
          flightNumber: 'SU1234',
          departureDate: new Date('2024-12-20'),
          departureTime: new Date('2024-12-20T10:00:00'),
          arrivalTime: new Date('2024-12-20T12:00:00'),
          originCity: 'Москва',
          originCode: 'SVO',
          destinationCity: 'Санкт-Петербург',
          destinationCode: 'LED',
          checkInDesks: '1-10',
          gate: 'A12',
          boardingType: 'jetbridge'
        }
      })
    }

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
