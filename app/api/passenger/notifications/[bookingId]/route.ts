import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { bookingId: string } }
) {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        bookingId: params.bookingId,
        isRead: false
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error('Get notifications error:', error)
    return NextResponse.json(
      { error: 'Ошибка получения уведомлений' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { bookingId: string } }
) {
  try {
    const { notificationIds } = await request.json()

    await prisma.notification.updateMany({
      where: {
        id: {
          in: notificationIds
        },
        bookingId: params.bookingId
      },
      data: {
        isRead: true
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Mark notifications as read error:', error)
    return NextResponse.json(
      { error: 'Ошибка обновления уведомлений' },
      { status: 500 }
    )
  }
}
