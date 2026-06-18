import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST() {
  try {
    await prisma.$connect()

    // Проверяем существует ли админ
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@aso.ru' }
    })

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash('admin123', 10)

    if (existingAdmin) {
      await prisma.user.update({
        where: { email: 'admin@aso.ru' },
        data: { password: hashedPassword }
      })
    } else {
      await prisma.user.create({
        data: {
          email: 'admin@aso.ru',
          password: hashedPassword,
          role: 'admin'
        }
      })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Администратор создан/обновлен'
    })
  } catch (error: any) {
    console.error('Create admin error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error?.message || String(error)
    })
  } finally {
    await prisma.$disconnect()
  }
}
