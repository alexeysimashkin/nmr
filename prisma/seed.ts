import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Создаём админа
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@aso.ru' },
    update: {},
    create: {
      email: 'admin@aso.ru',
      password: hashedPassword,
      role: 'admin'
    }
  })

  console.log('Admin created:', admin.email)

  // Создаём тестовое бронирование
  const booking = await prisma.booking.create({
    data: {
      bookingCode: 'TEST01',
      lastName: 'Иванов',
      firstName: 'Иван',
      middleName: 'Иванович',
      flightNumber: 'SU1234',
      departureDate: new Date('2024-01-15'),
      departureTime: new Date('2024-01-15T10:00:00'),
      arrivalTime: new Date('2024-01-15T12:00:00'),
      originCity: 'Москва',
      originCode: 'SVO',
      destinationCity: 'Санкт-Петербург',
      destinationCode: 'LED',
      checkInDesks: '1-10',
      gate: 'A12',
      boardingType: 'jetbridge',
    }
  })

  console.log('Test booking created:', booking.bookingCode)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
