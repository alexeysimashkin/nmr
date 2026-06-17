'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function PassengerLookup() {
  const [lastName, setLastName] = useState('')
  const [bookingCode, setBookingCode] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!lastName.trim() || !bookingCode.trim()) {
      toast.error('Заполните все поля')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/passenger/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          lastName: lastName.trim(), 
          bookingCode: bookingCode.trim().toUpperCase() 
        })
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Бронирование не найдено')
        return
      }

      router.push(`/passenger/booking/${data.booking.bookingCode}?lastName=${encodeURIComponent(lastName)}`)
    } catch (error) {
      toast.error('Ошибка при поиске бронирования')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-aviation-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-aviation-900 mb-2">
            НМР
          </h1>
          <p className="text-xl text-aviation-700">
            Найди мой рейс
          </p>
          <p className="text-sm text-gray-600 mt-2">
            ASO Company • ASO Airlines • Severavia • SamAero • Noris
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Фамилия пассажира
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="input-field"
                placeholder="Введите фамилию"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Код бронирования
              </label>
              <input
                type="text"
                value={bookingCode}
                onChange={(e) => setBookingCode(e.target.value.toUpperCase())}
                className="input-field"
                placeholder="Например: A1B2C3"
                maxLength={6}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? 'Поиск...' : 'Найти бронирование'}
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <a 
            href="/admin/login" 
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Вход для администраторов
          </a>
        </div>
      </div>
    </div>
  )
}
