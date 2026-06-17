import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'
import { getNotificationMessage } from '@/lib/notificationMessages'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = getTokenFromRequest(request as any)
    const decoded = verifyToken(token || '')

    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      )
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        notifications: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Бронирование не найдено' },
        { status: 404 }
      )
    }

    return NextResponse.json({ booking })
  } catch (error) {
    console.error('Get booking error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = getTokenFromRequest(request as any)
    const decoded = verifyToken(token || '')

    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      )
    }

    const updates = await request.json()
    
    // Получаем текущее бронирование для сравнения
    const currentBooking = await prisma.booking.findUnique({
      where: { id: params.id }
    })

    if (!currentBooking) {
      return NextResponse.json(
        { error: 'Бронирование не найдено' },
        { status: 404 }
      )
    }

    // Создаём уведомления на основе изменений
    const notifications = []

    // Проверяем изменения стоек регистрации
    if (updates.checkInDesks && updates.checkInDesks !== currentBooking.checkInDesks) {
      notifications.push({
        message: getNotificationMessage('checkin_desks_changed', { desks: updates.checkInDesks }),
        type: 'checkin_desks_changed'
      })
    }

    // Проверяем изменения выхода на посадку
    if (updates.gate && updates.gate !== currentBooking.gate) {
      notifications.push({
        message: getNotificationMessage('gate_changed', { 
          gate: updates.gate, 
          boardingType: updates.boardingType || currentBooking.boardingType 
        }),
        type: 'gate_changed'
      })
    }

    // Проверяем задержку рейса
    if (updates.isDelayed && !currentBooking.isDelayed) {
      notifications.push({
        message: getNotificationMessage('flight_delayed', { 
          delayedUntil: updates.delayedUntil 
        }),
        type: 'flight_delayed'
      })
    }

    // Проверяем предоставление отеля
    if (updates.hotelAddress && updates.hotelAddress !== currentBooking.hotelAddress) {
      notifications.push({
        message: getNotificationMessage('hotel_provided', {
          hotelAddress: updates.hotelAddress,
          hotelRoom: updates.hotelRoom
        }),
        type: 'hotel_provided'
      })
    }

    // Проверяем начало регистрации
    if (updates.isCheckedIn && !currentBooking.isCheckedIn) {
      notifications.push({
        message: getNotificationMessage('checkin_opened', { 
          desks: updates.checkInDesks || currentBooking.checkInDesks 
        }),
        type: 'checkin_opened'
      })
    }

    // Проверяем окончание регистрации
    if (updates.checkInClosed && !currentBooking.checkInClosed) {
      notifications.push({
        message: getNotificationMessage('checkin_closed'),
        type: 'checkin_closed'
      })
    }

    // Проверяем начало посадки
    if (updates.isBoarding && !currentBooking.isBoarding) {
      notifications.push({
        message: getNotificationMessage('boarding_started', { 
          gate: updates.gate || currentBooking.gate 
        }),
        type: 'boarding_started'
      })
    }

    // Проверяем окончание посадки
    if (updates.boardingClosed && !currentBooking.boardingClosed) {
      notifications.push({
        message: getNotificationMessage('boarding_closed'),
        type: 'boarding_closed'
      })
    }

    // Проверяем вылет
    if (updates.hasDeparted && !currentBooking.hasDeparted) {
      notifications.push({
        message: getNotificationMessage('flight_departed', {
          actualDeparture: updates.actualDeparture || new Date()
        }),
        type: 'flight_departed'
      })
    }

    // Обновляем бронирование с уведомлениями
    const booking = await prisma.booking.update({
      where: { id: params.id },
      data: {
        ...updates,
        notifications: {
          create: notifications
        }
      },
      include: {
        notifications: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    return NextResponse.json({ booking })
  } catch (error) {
    console.error('Update booking error:', error)
    return NextResponse.json(
      { error: 'Ошибка обновления бронирования' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = getTokenFromRequest(request as any)
    const decoded = verifyToken(token || '')

    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      )
    }

    await prisma.booking.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete booking error:', error)
    return NextResponse.json(
      { error: 'Ошибка удаления бронирования' },
      { status: 500 }
    )
  }
}
