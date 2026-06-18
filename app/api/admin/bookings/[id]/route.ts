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
    
    const currentBooking = await prisma.booking.findUnique({
      where: { id: params.id }
    })

    if (!currentBooking) {
      return NextResponse.json(
        { error: 'Бронирование не найдено' },
        { status: 404 }
      )
    }

    const notifications: any[] = []

    // Проверяем изменения стоек регистрации
    if (updates.checkInDesks !== undefined && updates.checkInDesks !== currentBooking.checkInDesks) {
      notifications.push({
        message: getNotificationMessage('checkin_desks_changed', { desks: updates.checkInDesks }),
        type: 'checkin_desks_changed'
      })
    }

    // Проверяем изменения выхода на посадку
    if (updates.gate !== undefined && updates.gate !== currentBooking.gate) {
      notifications.push({
        message: getNotificationMessage('gate_changed', { 
          gate: updates.gate, 
          boardingType: updates.boardingType || currentBooking.boardingType 
        }),
        type: 'gate_changed'
      })
    }

    // Проверяем изменение времени вылета/прилёта
    if ((updates.departureTime && updates.departureTime !== currentBooking.departureTime) ||
        (updates.arrivalTime && updates.arrivalTime !== currentBooking.arrivalTime)) {
      notifications.push({
        message: getNotificationMessage('time_changed'),
        type: 'time_changed'
      })
    }

    // Проверяем задержку рейса
    if (updates.isDelayed === true && !currentBooking.isDelayed) {
      notifications.push({
        message: getNotificationMessage('flight_delayed', { 
          delayedUntil: updates.delayedUntil 
        }),
        type: 'flight_delayed'
      })
    }

    // Проверяем отмену задержки
    if (updates.isDelayed === false && currentBooking.isDelayed) {
      notifications.push({
        message: 'Задержка рейса отменена. Актуальное время вылета: ' + 
          new Date(currentBooking.departureTime).toLocaleTimeString('ru-RU'),
        type: 'time_changed'
      })
    }

    // Проверяем предоставление отеля (отдельно от задержки)
    if (updates.hotelAddress !== undefined && 
        updates.hotelAddress !== currentBooking.hotelAddress && 
        updates.hotelAddress !== null) {
      notifications.push({
        message: getNotificationMessage('hotel_provided', {
          hotelAddress: updates.hotelAddress || currentBooking.hotelAddress,
          hotelRoom: updates.hotelRoom || currentBooking.hotelRoom
        }),
        type: 'hotel_provided'
      })
    }

    // Проверяем удаление отеля
    if (updates.hotelAddress === null && currentBooking.hotelAddress) {
      notifications.push({
        message: 'Информация об отеле удалена',
        type: 'time_changed'
      })
    }

    // Проверяем начало регистрации
    if (updates.isCheckedIn === true && !currentBooking.isCheckedIn) {
      notifications.push({
        message: getNotificationMessage('checkin_opened', { 
          desks: updates.checkInDesks || currentBooking.checkInDesks 
        }),
        type: 'checkin_opened'
      })
    }

    // Проверяем окончание регистрации
    if (updates.checkInClosed === true && !currentBooking.checkInClosed) {
      notifications.push({
        message: getNotificationMessage('checkin_closed'),
        type: 'checkin_closed'
      })
    }

    // Проверяем начало посадки
    if (updates.isBoarding === true && !currentBooking.isBoarding) {
      notifications.push({
        message: getNotificationMessage('boarding_started', { 
          gate: updates.gate || currentBooking.gate 
        }),
        type: 'boarding_started'
      })
    }

    // Проверяем окончание посадки
    if (updates.boardingClosed === true && !currentBooking.boardingClosed) {
      notifications.push({
        message: getNotificationMessage('boarding_closed'),
        type: 'boarding_closed'
      })
    }

    // Проверяем вылет
    if (updates.hasDeparted === true && !currentBooking.hasDeparted) {
      notifications.push({
        message: getNotificationMessage('flight_departed', {
          actualDeparture: updates.actualDeparture || new Date()
        }),
        type: 'flight_departed'
      })
    }

    // Проверяем отмену вылета
    if (updates.hasDeparted === false && currentBooking.hasDeparted) {
      notifications.push({
        message: 'Отметка о вылете отменена',
        type: 'time_changed'
      })
    }

    // Проверяем перенаправление в другой аэропорт
    if (updates.isDiverted === true && !currentBooking.isDiverted) {
      notifications.push({
        message: getNotificationMessage('flight_diverted', {
          city: updates.divertedToCity,
          code: updates.divertedToCode
        }),
        type: 'flight_diverted'
      })
    }

    // Проверяем отмену перенаправления
    if (updates.isDiverted === false && currentBooking.isDiverted) {
      notifications.push({
        message: 'Перенаправление рейса отменено. Самолёт следует по маршруту.',
        type: 'time_changed'
      })
    }

    // Проверяем сигнал бедствия
    if (updates.isDistress === true && !currentBooking.isDistress) {
      notifications.push({
        message: getNotificationMessage('flight_distress', {
          distressCode: updates.distressCode
        }),
        type: 'flight_distress'
      })
    }

    // Проверяем отмену сигнала бедствия
    if (updates.isDistress === false && currentBooking.isDistress) {
      notifications.push({
        message: 'Сигнал бедствия отменён. Рейс в безопасности.',
        type: 'time_changed'
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
