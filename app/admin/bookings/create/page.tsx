'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function CreateBooking() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    middleName: '',
    flightNumber: '',
    departureDate: '',
    departureTime: '',
    arrivalTime: '',
    originCity: '',
    originCode: '',
    destinationCity: '',
    destinationCode: '',
    checkInDesks: '',
    gate: '',
    boardingType: 'jetbridge',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      
      // Форматируем даты
      const bookingData = {
        ...formData,
        departureDate: new Date(formData.departureDate).toISOString(),
        departureTime: new Date(`${formData.departureDate}T${formData.departureTime}`).toISOString(),
        arrivalTime: new Date(`${formData.departureDate}T${formData.arrivalTime}`).toISOString(),
        middleName: formData.middleName || null,
        checkInDesks: formData.checkInDesks || null,
        gate: formData.gate || null,
      }

      const response = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка создания бронирования')
      }

      toast.success('Бронирование создано!')
      router.push(`/admin/bookings/${data.booking.id}`)
    } catch (error: any) {
      toast.error(error.message || 'Ошибка создания бронирования')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Новое бронирование</h1>
            <p className="text-sm text-gray-600">Заполните информацию о рейсе и пассажире</p>
          </div>
          <Link href="/admin/dashboard" className="btn-secondary">
            ← Назад
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Информация о пассажире */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Пассажир</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Фамилия *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Имя *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Отчество
                </label>
                <input
                  type="text"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Необязательно"
                />
              </div>
            </div>
          </div>

          {/* Информация о рейсе */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Рейс</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Номер рейса *
                </label>
                <input
                  type="text"
                  name="flightNumber"
                  value={formData.flightNumber}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="SU1234"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Дата вылета *
                </label>
                <input
                  type="date"
                  name="departureDate"
                  value={formData.departureDate}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Время вылета *
                </label>
                <input
                  type="time"
                  name="departureTime"
                  value={formData.departureTime}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Время прилёта *
                </label>
                <input
                  type="time"
                  name="arrivalTime"
                  value={formData.arrivalTime}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
            </div>
          </div>

          {/* Маршрут */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Маршрут</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium text-gray-700">Откуда</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Город *
                  </label>
                  <input
                    type="text"
                    name="originCity"
                    value={formData.originCity}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Москва"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Код ИАТА *
                  </label>
                  <input
                    type="text"
                    name="originCode"
                    value={formData.originCode}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="SVO"
                    maxLength={3}
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-gray-700">Куда</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Город *
                  </label>
                  <input
                    type="text"
                    name="destinationCity"
                    value={formData.destinationCity}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Санкт-Петербург"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Код ИАТА *
                  </label>
                  <input
                    type="text"
                    name="destinationCode"
                    value={formData.destinationCode}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="LED"
                    maxLength={3}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Информация в аэропорту */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Информация в аэропорту</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Стойки регистрации
                </label>
                <input
                  type="text"
                  name="checkInDesks"
                  value={formData.checkInDesks}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="1-10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Выход на посадку
                </label>
                <input
                  type="text"
                  name="gate"
                  value={formData.gate}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="A12"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Тип посадки
                </label>
                <select
                  name="boardingType"
                  value={formData.boardingType}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="jetbridge">Телетрап</option>
                  <option value="bus">Автобус</option>
                </select>
              </div>
            </div>
          </div>

          {/* Кнопки */}
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {loading ? 'Создание...' : 'Создать бронирование'}
            </button>
            <Link href="/admin/dashboard" className="btn-secondary">
              Отмена
            </Link>
          </div>
        </form>
      </main>
    </div>
  )
}
