'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Booking {
  id: string
  bookingCode: string
  lastName: string
  firstName: string
  middleName: string | null
  flightNumber: string
  departureDate: string
  departureTime: string
  arrivalTime: string
  originCity: string
  originCode: string
  destinationCity: string
  destinationCode: string
  checkInDesks: string | null
  gate: string | null
  boardingType: string | null
  isCheckedIn: boolean
  checkInClosed: boolean
  isBoarding: boolean
  boardingClosed: boolean
  hasDeparted: boolean
  actualDeparture: string | null
  isDelayed: boolean
  delayedUntil: string | null
  hotelAddress: string | null
  hotelRoom: string | null
  notifications: any[]
}

export default function EditBooking() {
  const params = useParams()
  const router = useRouter()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Состояния для управления статусами
  const [isDelayed, setIsDelayed] = useState(false)
  const [delayedUntil, setDelayedUntil] = useState('')
  const [hotelAddress, setHotelAddress] = useState('')
  const [hotelRoom, setHotelRoom] = useState('')
  const [actualDeparture, setActualDeparture] = useState('')

  useEffect(() => {
    loadBooking()
  }, [])

  const loadBooking = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/bookings/${params.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) throw new Error('Ошибка загрузки')

      const data = await response.json()
      setBooking(data.booking)
      
      // Инициализируем состояния
      setIsDelayed(data.booking.isDelayed)
      setDelayedUntil(data.booking.delayedUntil ? 
        new Date(data.booking.delayedUntil).toISOString().slice(0, 16) : '')
      setHotelAddress(data.booking.hotelAddress || '')
      setHotelRoom(data.booking.hotelRoom || '')
      setActualDeparture(data.booking.actualDeparture ? 
        new Date(data.booking.actualDeparture).toISOString().slice(0, 16) : '')
    } catch (error) {
      toast.error('Ошибка загрузки бронирования')
      router.push('/admin/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const updateBookingStatus = async (updates: any) => {
    setSaving(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/bookings/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      })

      if (!response.ok) throw new Error('Ошибка обновления')

      const data = await response.json()
      setBooking(data.booking)
      toast.success('Статус обновлён')
    } catch (error) {
      toast.error('Ошибка обновления статуса')
    } finally {
      setSaving(false)
    }
  }

  const handleDelaySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateBookingStatus({
      isDelayed: true,
      delayedUntil: delayedUntil ? new Date(delayedUntil).toISOString() : null,
      hotelAddress: hotelAddress || null,
      hotelRoom: hotelRoom || null
    })
  }

  const handleDepartureSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateBookingStatus({
      hasDeparted: true,
      actualDeparture: actualDeparture ? new Date(actualDeparture).toISOString() : new Date().toISOString()
    })
  }

  const deleteBooking = async () => {
    if (!confirm('Вы уверены, что хотите удалить это бронирование?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/bookings/${params.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) throw new Error('Ошибка удаления')

      toast.success('Бронирование удалено')
      router.push('/admin/dashboard')
    } catch (error) {
      toast.error('Ошибка удаления бронирования')
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aviation-600"></div>
      </div>
    )
  }

  if (!booking) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Бронирование {booking.bookingCode}
            </h1>
            <p className="text-sm text-gray-600">
              {booking.lastName} {booking.firstName} • {booking.flightNumber}
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={deleteBooking}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Удалить
            </button>
            <Link href="/admin/dashboard" className="btn-secondary">
              ← Назад
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Основная информация */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Информация о бронировании</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Пассажир</p>
              <p className="font-medium">
                {booking.lastName} {booking.firstName} {booking.middleName || ''}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Рейс</p>
              <p className="font-medium">{booking.flightNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Маршрут</p>
              <p className="font-medium">
                {booking.originCity} ({booking.originCode}) → {booking.destinationCity} ({booking.destinationCode})
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Дата вылета</p>
              <p className="font-medium">{new Date(booking.departureDate).toLocaleDateString('ru-RU')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Время вылета</p>
              <p className="font-medium">{new Date(booking.departureTime).toLocaleTimeString('ru-RU')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Время прилёта</p>
              <p className="font-medium">{new Date(booking.arrivalTime).toLocaleTimeString('ru-RU')}</p>
            </div>
            {booking.checkInDesks && (
              <div>
                <p className="text-sm text-gray-600">Стойки регистрации</p>
                <p className="font-medium">{booking.checkInDesks}</p>
              </div>
            )}
            {booking.gate && (
              <div>
                <p className="text-sm text-gray-600">Выход на посадку</p>
                <p className="font-medium">
                  {booking.gate} ({booking.boardingType === 'bus' ? 'Автобус' : 'Телетрап'})
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Управление статусами */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Статусы регистрации и посадки */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Статусы рейса</h2>
            <div className="space-y-3">
              <button
                onClick={() => updateBookingStatus({ 
                  isCheckedIn: !booking.isCheckedIn 
                })}
                disabled={saving}
                className={`w-full px-4 py-2 rounded-lg text-left transition-colors ${
                  booking.isCheckedIn 
                    ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {booking.isCheckedIn ? '✅ Регистрация открыта' : 'Открыть регистрацию'}
              </button>

              <button
                onClick={() => updateBookingStatus({ 
                  checkInClosed: !booking.checkInClosed 
                })}
                disabled={saving || !booking.isCheckedIn}
                className={`w-full px-4 py-2 rounded-lg text-left transition-colors ${
                  booking.checkInClosed 
                    ? 'bg-gray-200 text-gray-800' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                } disabled:opacity-50`}
              >
                {booking.checkInClosed ? '🔒 Регистрация закончена' : 'Закрыть регистрацию'}
              </button>

              <button
                onClick={() => updateBookingStatus({ 
                  isBoarding: !booking.isBoarding 
                })}
                disabled={saving}
                className={`w-full px-4 py-2 rounded-lg text-left transition-colors ${
                  booking.isBoarding 
                    ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {booking.isBoarding ? '🚶 Посадка идёт' : 'Начать посадку'}
              </button>

              <button
                onClick={() => updateBookingStatus({ 
                  boardingClosed: !booking.boardingClosed 
                })}
                disabled={saving || !booking.isBoarding}
                className={`w-full px-4 py-2 rounded-lg text-left transition-colors ${
                  booking.boardingClosed 
                    ? 'bg-orange-100 text-orange-800' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                } disabled:opacity-50`}
              >
                {booking.boardingClosed ? '🔒 Посадка закончена' : 'Закрыть посадку'}
              </button>
            </div>
          </div>

          {/* Задержка и отель */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Задержка рейса</h2>
            
            {!booking.isDelayed ? (
              <form onSubmit={handleDelaySubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Задержан до
                  </label>
                  <input
                    type="datetime-local"
                    value={delayedUntil}
                    onChange={(e) => setDelayedUntil(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Адрес отеля
                  </label>
                  <input
                    type="text"
                    value={hotelAddress}
                    onChange={(e) => setHotelAddress(e.target.value)}
                    className="input-field"
                    placeholder="ул. Примерная, 123"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Номер в отеле
                  </label>
                  <input
                    type="text"
                    value={hotelRoom}
                    onChange={(e) => setHotelRoom(e.target.value)}
                    className="input-field"
                    placeholder="101"
                  />
                </div>
                <button type="submit" disabled={saving} className="btn-primary w-full">
                  Установить задержку
                </button>
              </form>
            ) : (
              <div className="space-y-3">
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-red-800 font-medium">Рейс задержан</p>
                  {booking.delayedUntil && (
                    <p className="text-red-600 text-sm mt-1">
                      До: {formatDateTime(booking.delayedUntil)}
                    </p>
                  )}
                  {booking.hotelAddress && (
                    <div className="mt-2 text-sm">
                      <p className="font-medium">Отель:</p>
                      <p>{booking.hotelAddress}</p>
                      {booking.hotelRoom && <p>Номер: {booking.hotelRoom}</p>}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => updateBookingStatus({ isDelayed: false })}
                  disabled={saving}
                  className="btn-secondary w-full"
                >
                  Отменить задержку
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Отметка о вылете */}
        {!booking.hasDeparted && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Отметка о вылете</h2>
            <form onSubmit={handleDepartureSubmit} className="flex items-end gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Фактическое время вылета
                </label>
                <input
                  type="datetime-local"
                  value={actualDeparture}
                  onChange={(e) => setActualDeparture(e.target.value)}
                  className="input-field"
                />
              </div>
              <button type="submit" disabled={saving} className="btn-primary">
                Рейс вылетел
              </button>
            </form>
          </div>
        )}

        {/* История уведомлений */}
        {booking.notifications && booking.notifications.length > 0 && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">История уведомлений</h2>
            <div className="space-y-2">
              {booking.notifications.map((notification: any) => (
                <div key={notification.id} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDateTime(notification.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
