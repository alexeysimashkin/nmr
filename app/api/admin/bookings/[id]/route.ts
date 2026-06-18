import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'

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
  console.log('=== PUT START ===')
  console.log('Booking ID:', params.id)
  
  try {
    // Проверяем токен
    const token = getTokenFromRequest(request as any)
    console.log('Token:', token ? 'present' : 'missing')
    
    const decoded = verifyToken(token || '')
    console.log('Decoded:', decoded ? 'valid' : 'invalid')

    if (!decoded || decoded.role !== 'admin') {
      console.log('Auth failed')
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      )
    }

    // Парсим тело запроса
    let updates: any
    try {
      updates = await request.json()
      console.log('Updates received, keys:', Object.keys(updates))
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      return NextResponse.json(
        { error: 'Неверный формат данных' },
        { status: 400 }
      )
    }
    
    // Проверяем что бронирование существует
    let currentBooking
    try {
      currentBooking = await prisma.booking.findUnique({
        where: { id: params.id }
      })
      console.log('Current booking found:', !!currentBooking)
    } catch (findError: any) {
      console.error('Find booking error:', findError)
      return NextResponse.json(
        { 
          error: 'Ошибка поиска бронирования', 
          details: findError?.message || 'Неизвестная ошибка' 
        },
        { status: 500 }
      )
    }

    if (!currentBooking) {
      return NextResponse.json(
        { error: 'Бронирование не найдено' },
        { status: 404 }
      )
    }

    // Собираем только те поля которые пришли
    const updateData: any = {}
    
    // Текстовые поля
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

    // Поля дат
    if (updates.departureDate !== undefined) {
      updateData.departureDate = new Date(updates.departureDate)
    }
    if (updates.departureTime !== undefined) {
      updateData.departureTime = new Date(updates.departureTime)
    }
    if (updates.arrivalTime !== undefined) {
      updateData.arrivalTime = new Date(updates.arrivalTime)
    }
    if (updates.actualDeparture !== undefined) {
      updateData.actualDeparture = updates.actualDeparture ? new Date(updates.actualDeparture) : null
    }
    if (updates.delayedUntil !== undefined) {
      updateData.delayedUntil = updates.delayedUntil ? new Date(updates.delayedUntil) : null
    }

    // Булевые поля
    const boolFields = [
      'isCheckedIn', 'checkInClosed', 'isBoarding', 'boardingClosed',
      'hasDeparted', 'isDelayed', 'isDiverted', 'isDistress'
    ]
    
    for (const field of boolFields) {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field]
      }
    }

    console.log('Update data prepared:', JSON.stringify(updateData, null, 2))

    // Пробуем обновить
    let booking
    try {
      booking = await prisma.booking.update({
        where: { id: params.id },
        data: updateData,
        include: {
          notifications: {
            orderBy: { createdAt: 'desc' }
          }
        }
      })
      console.log('Update successful!')
    } catch (updateError: any) {
      console.error('!!! Prisma update error !!!')
      console.error('Message:', updateError?.message)
      console.error('Code:', updateError?.code)
      console.error('Meta:', JSON.stringify(updateError?.meta))
      
      return NextResponse.json(
        { 
          error: 'Ошибка обновления в базе данных',
          details: updateError?.message || 'Неизвестная ошибка Prisma',
          code: updateError?.code || 'unknown',
          meta: updateError?.meta ? JSON.stringify(updateError.meta) : null
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ booking })
    
  } catch (error: any) {
    console.error('!!! General error !!!')
    console.error('Error:', error)
    console.error('Message:', error?.message)
    console.error('Stack:', error?.stack)
    
    return NextResponse.json(
      { 
        error: 'Внутренняя ошибка сервера',
        details: error?.message || String(error)
      },
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
