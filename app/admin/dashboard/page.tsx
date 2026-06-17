'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Booking {
  id: string
  bookingCode: string
  lastName: string
  firstName: string
  flightNumber: string
  originCity: string
  destinationCity: string
  departureDate: string
  isDelayed: boolean
  hasDeparted: boolean
}

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    loadBookings()
  }, [])

  const checkAuth = () => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/admin/login')
    }
  }

  const loadBookings = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Ошибка загрузки')
      }

      const data = await response.json()
      setBookings(data.bookings)
    } catch (error) {
      toast.error('Ошибка загрузки бронирований')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/admin/login')
  }

  const filteredBookings = bookings.filter(booking => 
    booking.bookingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.flightNumber.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">НМР Админ</h1>
            <p className="text-sm text-gray-600">Управление бронированиями</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link href="/admin/bookings/create" className="btn-primary">
              + Новое бронирование
            </Link>
            <button
              onClick={handleLogout}
              className="btn-secondary"
            >
              Выйти
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        {/* Поиск */}
        <div className="mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field max-w-md"
            placeholder="Поиск по коду, фамилии или номеру рейса..."
          />
        </div>

        {/* Список бронирований */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aviation-600 mx-auto"></div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Бронирования не найдены</p>
            <Link href="/admin/bookings/create" className="btn-primary inline-block mt-4">
              Создать первое бронирование
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredBookings.map((booking) => (
              <Link
                key={booking.id}
                href={`/admin/bookings/${booking.id}`}
                className="card hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold">
                        {booking.lastName} {booking.firstName}
                      </h3>
                      <span className="px-2 py-1 bg-aviation-100 text-aviation-800 rounded text-sm font-mono">
                        {booking.bookingCode}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Рейс</p>
                        <p className="font-medium">{booking.flightNumber}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Маршрут</p>
                        <p className="font-medium">{booking.originCity} → {booking.destinationCity}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Дата</p>
                        <p className="font-medium">{formatDate(booking.departureDate)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Статус</p>
                        <div className="flex gap-1">
                          {booking.isDelayed && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded text-xs">
                              Задержан
                            </span>
                          )}
                          {booking.hasDeparted && (
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-xs">
                              Вылетел
                            </span>
                          )}
                          {!booking.isDelayed && !booking.hasDeparted && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs">
                              Активен
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
