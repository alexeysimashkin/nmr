import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST() {
  try {
    await prisma.$connect()

    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@aso.ru' }
    })

    const hashedPassword = await bcrypt.hash('admin123', 10)

    if (existingAdmin) {
      await prisma.user.update({
        where: { email: 'admin@aso.ru' },
        data: { password: hashedPassword }
      })
    } else {
      await prisma.user.create({
        data: {
          id: 'admin001',
          email: 'admin@aso.ru',
          password: hashedPassword,
          role: 'admin'
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
