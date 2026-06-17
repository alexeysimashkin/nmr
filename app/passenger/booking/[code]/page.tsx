'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Notification {
  id: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
}

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
  notifications: Notification[]
}

export default function BookingDetails() {
  const params = useParams()
  const searchParams = useSearchParams()
  const lastName = searchParams.get('lastName')

  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    loadBooking()
    const interval = setInterval(loadBooking, 30000) // Обновление каждые 30 секунд
    return () => clearInterval(interval)
  }, [])

  const loadBooking = async () => {
    try {
      const response = await fetch('/api/passenger/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          lastName: lastName, 
          bookingCode: params.code 
        })
      })

      if (!response.ok) {
        throw new Error('Бронирование не найдено')
      }

      const data = await response.json()
      setBooking(data.booking)
      setNotifications(data.booking.notifications.filter((n: Notification) => !n.isRead))
    } catch (error) {
      toast.error('Ошибка загрузки бронирования')
    } finally {
      setLoading(false)
    }
  }

  const markNotificationsAsRead = async (notificationIds: string[]) => {
    try {
      await fetch(`/api/passenger/notifications/${booking?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds })
      })
      
      setNotifications(prev => prev.filter(n => !notificationIds.includes(n.id)))
    } catch (error) {
      console.error('Error marking notifications as read:', error)
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aviation-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка бронирования...</p>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Бронирование не найдено</h2>
          <p className="text-gray-600 mb-4">
            Проверьте правильность фамилии и кода бронирования
          </p>
          <Link href="/passenger" className="btn-primary inline-block">
            Вернуться к поиску
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header с уведомлениями */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/passenger" className="text-aviation-600 hover:text-aviation-700">
            ← Назад
          </Link>
          
          <h1 className="text-xl font-bold text-gray-900">НМР - Найди мой рейс</h1>
          
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {notifications.length > 0 && (
                <span className="notification-badge">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Выпадающий список уведомлений */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-20">
                <div className="p-4 border-b">
                  <h3 className="font-semibold">Уведомления</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      Нет новых уведомлений
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div key={notification.id} className="p-4 border-b hover:bg-gray-50">
                        <p className="text-sm text-gray-800">{notification.message}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-gray-500">
                            {formatDateTime(notification.createdAt)}
                          </span>
                          <button
                            onClick={() => markNotificationsAsRead([notification.id])}
                            className="text-xs text-aviation-600 hover:text-aviation-700"
                          >
                            Прочитано
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {notifications.length > 0 && (
                  <div className="p-3 border-t">
                    <button
                      onClick={() => markNotificationsAsRead(notifications.map(n => n.id))}
                      className="text-sm text-aviation-600 hover:text-aviation-700 w-full"
                    >
                      Отметить все как прочитанные
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Основной контент */}
      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Статус рейса */}
        <div className="card">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">
                Рейс {booking.flightNumber}
              </h2>
              <p className="text-gray-600">
                {booking.originCity} ({booking.originCode}) → {booking.destinationCity} ({booking.destinationCode})
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Код бронирования</p>
              <p className="text-2xl font-mono font-bold text-aviation-600">
                {booking.bookingCode}
              </p>
            </div>
          </div>

          {/* Статусы */}
          <div className="mt-4 flex flex-wrap gap-2">
            {booking.isDelayed && (
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                Задержан
                {booking.delayedUntil && ` до ${formatDateTime(booking.delayedUntil)}`}
              </span>
            )}
            {booking.isCheckedIn && !booking.checkInClosed && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Регистрация открыта
              </span>
            )}
            {booking.checkInClosed && (
              <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                Регистрация закончена
              </span>
            )}
            {booking.isBoarding && !booking.boardingClosed && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                Идёт посадка
              </span>
            )}
            {booking.boardingClosed && !booking.hasDeparted && (
              <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                Посадка закончена
              </span>
            )}
            {booking.hasDeparted && (
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                Вылетел{booking.actualDeparture ? ` в ${formatTime(booking.actualDeparture)}` : ''}
              </span>
            )}
          </div>
        </div>

        {/* Информация о пассажире */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-3">Пассажир</h3>
          <p className="text-xl">
            {booking.lastName} {booking.firstName} {booking.middleName || ''}
          </p>
        </div>

        {/* Детали рейса */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card">
            <h3 className="text-lg font-semibold mb-3">Вылет</h3>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-600">Дата</p>
                <p className="font-medium">{formatDate(booking.departureDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Время вылета</p>
                <p className="font-medium">{formatTime(booking.departureTime)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Аэропорт</p>
                <p className="font-medium">{booking.originCity} ({booking.originCode})</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-3">Прилёт</h3>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-600">Время прилёта</p>
                <p className="font-medium">{formatTime(booking.arrivalTime)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Аэропорт</p>
                <p className="font-medium">{booking.destinationCity} ({booking.destinationCode})</p>
              </div>
            </div>
          </div>
        </div>

        {/* Информация о регистрации и посадке */}
        {(booking.checkInDesks || booking.gate) && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-3">Информация в аэропорту</h3>
            <div className="space-y-3">
              {booking.checkInDesks && (
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">🛂</div>
                  <div>
                    <p className="text-sm text-gray-600">Стойки регистрации</p>
                    <p className="font-medium text-lg">{booking.checkInDesks}</p>
                  </div>
                </div>
              )}
              {booking.gate && (
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">🚪</div>
                  <div>
                    <p className="text-sm text-gray-600">Выход на посадку</p>
                    <p className="font-medium text-lg">
                      {booking.gate}
                      {booking.boardingType && (
                        <span className="text-sm text-gray-500 ml-2">
                          ({booking.boardingType === 'bus' ? 'Автобус' : 'Телетрап'})
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Информация об отеле при задержке */}
        {booking.hotelAddress && (
          <div className="card bg-yellow-50">
            <h3 className="text-lg font-semibold mb-3 text-yellow-800">Размещение в отеле</h3>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-yellow-700">Адрес отеля</p>
                <p className="font-medium">{booking.hotelAddress}</p>
              </div>
              {booking.hotelRoom && (
                <div>
                  <p className="text-sm text-yellow-700">Номер</p>
                  <p className="font-medium">{booking.hotelRoom}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
