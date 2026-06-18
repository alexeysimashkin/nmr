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
    
    // Проверяем что бронирование существует
    const currentBooking = await prisma.booking.findUnique({
      where: { id: params.id }
    })

    if (!currentBooking) {
      return NextResponse.json(
        { error: 'Бронирование не найдено' },
        { status: 404 }
      )
    }

    // Подготавливаем уведомления
    const notifications: any[] = []

    // Изменение стоек регистрации
    if (updates.checkInDesks !== undefined && updates.checkInDesks !== currentBooking.checkInDesks) {
      notifications.push({
        message: `Изменены стойки регистрации: ${updates.checkInDesks || 'не указаны'}`,
        type: 'checkin_desks_changed'
      })
    }

    // Изменение выхода на посадку
    if (updates.gate !== undefined && updates.gate !== currentBooking.gate) {
      const boardingType = updates.boardingType || currentBooking.boardingType
      notifications.push({
        message: `Изменён выход на посадку: ${updates.gate || 'не указан'} (${boardingType === 'bus' ? 'автобус' : 'телетрап'})`,
        type: 'gate_changed'
      })
    }

    // Изменение времени
    if ((updates.departureTime && updates.departureTime !== currentBooking.departureTime) ||
        (updates.arrivalTime && updates.arrivalTime !== currentBooking.arrivalTime)) {
      notifications.push({
        message: 'Изменено время вылета/прилёта',
        type: 'time_changed'
      })
    }

    // Начало регистрации
    if (updates.isCheckedIn === true && !currentBooking.isCheckedIn) {
      const desks = updates.checkInDesks || currentBooking.checkInDesks
      notifications.push({
        message: `Регистрация открыта${desks ? '. Стойки: ' + desks : ''}`,
        type: 'checkin_opened'
      })
    }

    // Конец регистрации
    if (updates.checkInClosed === true && !currentBooking.checkInClosed) {
      notifications.push({
        message: 'Регистрация закончена',
        type: 'checkin_closed'
      })
    }

    // Начало посадки
    if (updates.isBoarding === true && !currentBooking.isBoarding) {
      const gate = updates.gate || currentBooking.gate
      notifications.push({
        message: `Посадка началась${gate ? '. Выход: ' + gate : ''}`,
        type: 'boarding_started'
      })
    }

    // Конец посадки
    if (updates.boardingClosed === true && !currentBooking.boardingClosed) {
      notifications.push({
        message: 'Посадка закончена',
        type: 'boarding_closed'
      })
    }

    // Вылет
    if (updates.hasDeparted === true && !currentBooking.hasDeparted) {
      const time = updates.actualDeparture 
        ? new Date(updates.actualDeparture).toLocaleTimeString('ru-RU') 
        : new Date().toLocaleTimeString('ru-RU')
      notifications.push({
        message: `Рейс вылетел в ${time}`,
        type: 'flight_departed'
      })
    }

    // Задержка
    if (updates.isDelayed === true && !currentBooking.isDelayed) {
      const delayTime = updates.delayedUntil 
        ? new Date(updates.delayedUntil).toLocaleString('ru-RU') 
        : 'позднее время'
      notifications.push({
        message: `Рейс задержан до ${delayTime}`,
        type: 'flight_delayed'
      })
    }

    // Отмена задержки
    if (updates.isDelayed === false && currentBooking.isDelayed) {
      notifications.push({
        message: 'Задержка рейса отменена',
        type: 'time_changed'
      })
    }

    // Отель
    if (updates.hotelAddress && updates.hotelAddress !== currentBooking.hotelAddress) {
      notifications.push({
        message: `Предоставлен отель: ${updates.hotelAddress}${updates.hotelRoom ? ', номер: ' + updates.hotelRoom : ''}`,
        type: 'hotel_provided'
      })
    }

    // Удаление отеля
    if (updates.hotelAddress === null && currentBooking.hotelAddress) {
      notifications.push({
        message: 'Информация об отеле удалена',
        type: 'time_changed'
      })
    }

    // Перенаправление
    if (updates.isDiverted === true && !currentBooking.isDiverted) {
      notifications.push({
        message: `Самолёт перенаправлен в аэропорт ${updates.divertedToCity} (${updates.divertedToCode})`,
        type: 'flight_diverted'
      })
    }

    // Отмена перенаправления
    if (updates.isDiverted === false && currentBooking.isDiverted) {
      notifications.push({
        message: 'Перенаправление рейса отменено. Самолёт следует по маршруту.',
        type: 'time_changed'
      })
    }

    // Сигнал бедствия
    if (updates.isDistress === true && !currentBooking.isDistress) {
      notifications.push({
        message: `⚠️ САМОЛЁТ ПОДАЛ СИГНАЛ БЕДСТВИЯ! Код: ${updates.distressCode}`,
        type: 'flight_distress'
      })
    }

    // Отмена бедствия
    if (updates.isDistress === false && currentBooking.isDistress) {
      notifications.push({
        message: 'Сигнал бедствия отменён. Рейс в безопасности.',
        type: 'time_changed'
      })
    }

    // Собираем данные для обновления
    const updateData: any = {}
    
    const textFields = [
      'lastName', 'firstName', 'middleName', 'flightNumber',
      'originCity', 'originCode', 'destinationCity', 'destinationCode',
      'checkInDesks', 'gate', 'boardingType',
      'hotelAddress', 'hotelRoom',
      'divertedToCity', 'divertedToCode', 'distressCode'
    ]
    
    for (const field of textFields) {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field]
      }
    }

    if (updates.departureDate !== undefined) updateData.departureDate = new Date(updates.departureDate)
    if (updates.departureTime !== undefined) updateData.departureTime = new Date(updates.departureTime)
    if (updates.arrivalTime !== undefined) updateData.arrivalTime = new Date(updates.arrivalTime)
    if (updates.actualDeparture !== undefined) updateData.actualDeparture = updates.actualDeparture ? new Date(updates.actualDeparture) : null
    if (updates.delayedUntil !== undefined) updateData.delayedUntil = updates.delayedUntil ? new Date(updates.delayedUntil) : null

    const boolFields = [
      'isCheckedIn', 'checkInClosed', 'isBoarding', 'boardingClosed',
      'hasDeparted', 'isDelayed', 'isDiverted', 'isDistress'
    ]
    
    for (const field of boolFields) {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field]
      }
    }

    // Обновляем бронирование с уведомлениями
    const booking = await prisma.booking.update({
      where: { id: params.id },
      data: {
        ...updateData,
        ...(notifications.length > 0 && {
          notifications: {
            create: notifications
          }
        })
      },
      include: {
        notifications: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    return NextResponse.json({ booking })
    
  } catch (error: any) {
    console.error('Update error:', error)
    return NextResponse.json(
      { error: 'Ошибка обновления бронирования' },
      { status: 500 }
    )
  }
}
