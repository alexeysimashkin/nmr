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
  isDiverted: boolean
  divertedToCity: string | null
  divertedToCode: string | null
  isDistress: boolean
  distressCode: string | null
  notifications: any[]
}

function InfoField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className={`font-medium ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  )
}

function StatusButton({ 
  active, 
  activeText, 
  inactiveText, 
  activeColor, 
  onClick, 
  disabled 
}: { 
  active: boolean
  activeText: string
  inactiveText: string
  activeColor: string
  onClick: () => void
  disabled: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full px-4 py-3 rounded-lg text-left transition-colors disabled:opacity-50 ${
        active ? activeColor : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
      }`}
    >
      {active ? activeText : inactiveText}
    </button>
  )
}

export default function EditBooking() {
  const params = useParams()
  const router = useRouter()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('info')

  const [editForm, setEditForm] = useState({
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

  const [delayedUntil, setDelayedUntil] = useState('')
  const [hotelAddress, setHotelAddress] = useState('')
  const [hotelRoom, setHotelRoom] = useState('')
  const [actualDeparture, setActualDeparture] = useState('')
  const [divertedToCity, setDivertedToCity] = useState('')
  const [divertedToCode, setDivertedToCode] = useState('')
  const [distressCode, setDistressCode] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    loadBooking()
  }, [])

  const loadBooking = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/admin/login')
        return
      }

      const response = await fetch(`/api/admin/bookings/${params.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) throw new Error('Ошибка загрузки')

      const data = await response.json()
      setBooking(data.booking)
      
      setEditForm({
        lastName: data.booking.lastName || '',
        firstName: data.booking.firstName || '',
        middleName: data.booking.middleName || '',
        flightNumber: data.booking.flightNumber || '',
        departureDate: data.booking.departureDate ? new Date(data.booking.departureDate).toISOString().split('T')[0] : '',
        departureTime: data.booking.departureTime ? new Date(data.booking.departureTime).toTimeString().slice(0,5) : '',
        arrivalTime: data.booking.arrivalTime ? new Date(data.booking.arrivalTime).toTimeString().slice(0,5) : '',
        originCity: data.booking.originCity || '',
        originCode: data.booking.originCode || '',
        destinationCity: data.booking.destinationCity || '',
        destinationCode: data.booking.destinationCode || '',
        checkInDesks: data.booking.checkInDesks || '',
        gate: data.booking.gate || '',
        boardingType: data.booking.boardingType || 'jetbridge',
      })
      
      setDelayedUntil(data.booking.delayedUntil ? 
        new Date(data.booking.delayedUntil).toISOString().slice(0, 16) : '')
      setHotelAddress(data.booking.hotelAddress || '')
      setHotelRoom(data.booking.hotelRoom || '')
      setActualDeparture(data.booking.actualDeparture ? 
        new Date(data.booking.actualDeparture).toISOString().slice(0, 16) : '')
      setDivertedToCity(data.booking.divertedToCity || '')
      setDivertedToCode(data.booking.divertedToCode || '')
      setDistressCode(data.booking.distressCode || '')
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
      
      if (!token) {
        toast.error('Не авторизован')
        router.push('/admin/login')
        return
      }
      
      const response = await fetch(`/api/admin/bookings/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      })

      if (response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/admin/login')
        return
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || errorData.details || 'Ошибка обновления')
      }

      const data = await response.json()
      setBooking(data.booking)
      toast.success('Обновлено!')
    } catch (error: any) {
      console.error('Update error:', error)
      toast.error(error.message || 'Ошибка обновления')
    } finally {
      setSaving(false)
    }
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateBookingStatus({
      lastName: editForm.lastName,
      firstName: editForm.firstName,
      middleName: editForm.middleName || null,
      flightNumber: editForm.flightNumber,
      departureDate: new Date(editForm.departureDate).toISOString(),
      departureTime: new Date(`${editForm.departureDate}T${editForm.departureTime}:00`).toISOString(),
      arrivalTime: new Date(`${editForm.departureDate}T${editForm.arrivalTime}:00`).toISOString(),
      originCity: editForm.originCity,
      originCode: editForm.originCode.toUpperCase(),
      destinationCity: editForm.destinationCity,
      destinationCode: editForm.destinationCode.toUpperCase(),
      checkInDesks: editForm.checkInDesks || null,
      gate: editForm.gate || null,
      boardingType: editForm.boardingType,
    })
    setShowEditModal(false)
  }

  const handleDelaySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateBookingStatus({
      isDelayed: true,
      delayedUntil: delayedUntil ? new Date(delayedUntil).toISOString() : null,
    })
  }

  const handleHotelSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateBookingStatus({
      hotelAddress: hotelAddress || null,
      hotelRoom: hotelRoom || null,
    })
  }

  const handleDepartureSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateBookingStatus({
      hasDeparted: true,
      actualDeparture: actualDeparture ? new Date(actualDeparture).toISOString() : new Date().toISOString()
    })
  }

  const handleDivertSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!divertedToCity || !divertedToCode) {
      toast.error('Укажите город и код ИАТА')
      return
    }
    updateBookingStatus({
      isDiverted: true,
      divertedToCity,
      divertedToCode: divertedToCode.toUpperCase()
    })
  }

  const handleDistressSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!distressCode) {
      toast.error('Укажите код сигнала бедствия')
      return
    }
    updateBookingStatus({
      isDistress: true,
      distressCode: distressCode.toUpperCase()
    })
  }

  const deleteBooking = async () => {
    if (!confirm('Удалить бронирование навсегда?')) return
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/bookings/${params.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!response.ok) throw new Error('Ошибка удаления')
      toast.success('Удалено')
      router.push('/admin/dashboard')
    } catch (error) {
      toast.error('Ошибка удаления')
    }
  }

  const formatDateTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('ru-RU')
    } catch {
      return '—'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aviation-600"></div>
      </div>
    )
  }

  if (!booking) return null

  const tabs = [
    { id: 'info', label: '📋 Информация' },
    { id: 'status', label: '🔄 Статусы' },
    { id: 'delay', label: '⏰ Задержка' },
    { id: 'hotel', label: '🏨 Отель' },
    { id: 'divert', label: '🛬 Перенаправление' },
    { id: 'distress', label: '⚠️ Бедствие' },
    { id: 'departure', label: '✈️ Вылет' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
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
                onClick={() => setShowEditModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                ✏️ Редактировать
              </button>
              <button
                onClick={deleteBooking}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                🗑️ Удалить
              </button>
              <Link href="/admin/dashboard" className="btn-secondary">
                ← Назад
              </Link>
            </div>
          </div>

          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-aviation-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        <div className="flex flex-wrap gap-2 mb-6">
          {booking.isDistress && (
            <span className="px-3 py-1 bg-red-600 text-white rounded-full text-sm font-bold animate-pulse">
              ⚠ Сигнал бедствия: {booking.distressCode}
            </span>
          )}
          {booking.isDiverted && (
            <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
              ✈️ Перенаправлен в {booking.divertedToCity} ({booking.divertedToCode})
            </span>
          )}
          {booking.isDelayed && (
            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
              ⏰ Задержан
            </span>
          )}
          {booking.hasDeparted && (
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
              Вылетел
            </span>
          )}
          {booking.isBoarding && !booking.boardingClosed && (
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              Посадка
            </span>
          )}
        </div>

        {activeTab === 'info' && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Информация о рейсе</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InfoField label="Пассажир" value={`${booking.lastName} ${booking.firstName} ${booking.middleName || ''}`} />
              <InfoField label="Код бронирования" value={booking.bookingCode} mono />
              <InfoField label="Рейс" value={booking.flightNumber} />
              <InfoField label="Дата вылета" value={new Date(booking.departureDate).toLocaleDateString('ru-RU')} />
              <InfoField label="Время вылета" value={new Date(booking.departureTime).toLocaleTimeString('ru-RU', {hour:'2-digit',minute:'2-digit'})} />
              <InfoField label="Время прилёта" value={new Date(booking.arrivalTime).toLocaleTimeString('ru-RU', {hour:'2-digit',minute:'2-digit'})} />
              <InfoField label="Откуда" value={`${booking.originCity} (${booking.originCode})`} />
              <InfoField label="Куда" value={`${booking.destinationCity} (${booking.destinationCode})`} />
              {booking.checkInDesks && <InfoField label="Стойки регистрации" value={booking.checkInDesks} />}
              {booking.gate && <InfoField label="Выход на посадку" value={`${booking.gate} (${booking.boardingType === 'bus' ? 'Автобус' : 'Телетрап'})`} />}
              {booking.hotelAddress && <InfoField label="Отель" value={booking.hotelAddress} />}
              {booking.hotelRoom && <InfoField label="Номер" value={booking.hotelRoom} />}
              {booking.delayedUntil && <InfoField label="Задержан до" value={formatDateTime(booking.delayedUntil)} />}
              {booking.actualDeparture && <InfoField label="Фактический вылет" value={formatDateTime(booking.actualDeparture)} />}
            </div>
          </div>
        )}

        {activeTab === 'status' && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Управление статусами</h2>
            <div className="space-y-3">
              <StatusButton
                active={booking.isCheckedIn}
                activeText="✅ Регистрация открыта"
                inactiveText="Открыть регистрацию"
                activeColor="bg-green-100 text-green-800"
                onClick={() => updateBookingStatus({ isCheckedIn: !booking.isCheckedIn })}
                disabled={saving}
              />
              <StatusButton
                active={booking.checkInClosed}
                activeText="🔒 Регистрация закончена"
                inactiveText="Закрыть регистрацию"
                activeColor="bg-gray-200 text-gray-800"
                onClick={() => updateBookingStatus({ checkInClosed: !booking.checkInClosed })}
                disabled={saving || !booking.isCheckedIn}
              />
              <StatusButton
                active={booking.isBoarding}
                activeText="🚶 Посадка идёт"
                inactiveText="Начать посадку"
                activeColor="bg-blue-100 text-blue-800"
                onClick={() => updateBookingStatus({ isBoarding: !booking.isBoarding })}
                disabled={saving}
              />
              <StatusButton
                active={booking.boardingClosed}
                activeText="🔒 Посадка закончена"
                inactiveText="Закрыть посадку"
                activeColor="bg-orange-100 text-orange-800"
                onClick={() => updateBookingStatus({ boardingClosed: !booking.boardingClosed })}
                disabled={saving || !booking.isBoarding}
              />
            </div>
          </div>
        )}

        {activeTab === 'delay' && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">⏰ Задержка рейса</h2>
            {!booking.isDelayed ? (
              <form onSubmit={handleDelaySubmit} className="space-y-4">
                <p className="text-sm text-gray-600">
                  Установите задержку рейса. Отель можно добавить отдельно на вкладке &quot;Отель&quot;.
                </p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Задержан до</label>
                  <input
                    type="datetime-local"
                    value={delayedUntil}
                    onChange={(e) => setDelayedUntil(e.target.value)}
                    className="input-field"
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
                    <p className="text-red-600 mt-1">До: {formatDateTime(booking.delayedUntil)}</p>
                  )}
                </div>
                <button
                  onClick={() => updateBookingStatus({ isDelayed: false, delayedUntil: null })}
                  disabled={saving}
                  className="btn-secondary w-full"
                >
                  Отменить задержку
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'hotel' && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">🏨 Отель для пассажиров</h2>
            <form onSubmit={handleHotelSubmit} className="space-y-4">
              <p className="text-sm text-gray-600">
                Информация об отеле добавляется отдельно от задержки рейса.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Адрес отеля</label>
                <input
                  type="text"
                  value={hotelAddress}
                  onChange={(e) => setHotelAddress(e.target.value)}
                  className="input-field"
                  placeholder="ул. Гостиничная, 1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Номер в отеле</label>
                <input
                  type="text"
                  value={hotelRoom}
                  onChange={(e) => setHotelRoom(e.target.value)}
                  className="input-field"
                  placeholder="101"
                />
              </div>
              <button type="submit" disabled={saving} className="btn-primary w-full">
                {booking.hotelAddress ? 'Обновить информацию об отеле' : 'Добавить отель'}
              </button>
              {booking.hotelAddress && (
                <button
                  type="button"
                  onClick={() => updateBookingStatus({ hotelAddress: null, hotelRoom: null })}
                  disabled={saving}
                  className="btn-secondary w-full"
                >
                  Удалить информацию об отеле
                </button>
              )}
            </form>
            {booking.hotelAddress && (
              <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                <p className="font-medium">Текущая информация:</p>
                <p className="text-sm mt-1">Адрес: {booking.hotelAddress}</p>
                {booking.hotelRoom && <p className="text-sm">Номер: {booking.hotelRoom}</p>}
              </div>
            )}
          </div>
        )}

        {activeTab === 'divert' && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">🛬 Перенаправление рейса</h2>
            {!booking.isDiverted ? (
              <form onSubmit={handleDivertSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Город *</label>
                    <input type="text" value={divertedToCity} onChange={(e) => setDivertedToCity(e.target.value)} className="input-field" placeholder="Казань" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Код ИАТА *</label>
                    <input type="text" value={divertedToCode} onChange={(e) => setDivertedToCode(e.target.value.toUpperCase())} className="input-field" placeholder="KZN" maxLength={3} required />
                  </div>
                </div>
                <button type="submit" disabled={saving} className="btn-primary w-full">
                  Подтвердить перенаправление
                </button>
              </form>
            ) : (
              <div className="space-y-3">
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <p className="text-orange-800 font-medium">Самолёт перенаправлен</p>
                  <p className="text-orange-700 mt-1">Аэропорт: {booking.divertedToCity} ({booking.divertedToCode})</p>
                </div>
                <button onClick={() => updateBookingStatus({ isDiverted: false, divertedToCity: null, divertedToCode: null })} disabled={saving} className="btn-secondary w-full">
                  Отменить перенаправление
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'distress' && (
          <div className="card border-2 border-red-200">
            <h2 className="text-xl font-semibold mb-4 text-red-800">⚠️ Сигнал бедствия</h2>
            {!booking.isDistress ? (
              <form onSubmit={handleDistressSubmit} className="space-y-4">
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-red-800 text-sm font-medium">Внимание! Это создаст экстренное уведомление для пассажиров!</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Код сигнала *</label>
                  <input type="text" value={distressCode} onChange={(e) => setDistressCode(e.target.value.toUpperCase())} className="input-field text-lg font-mono" placeholder="7700" maxLength={4} required />
                  <p className="text-xs text-gray-500 mt-1">7700 - общая тревога, 7600 - отказ связи, 7500 - захват</p>
                </div>
                <button type="submit" disabled={saving} className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold">
                  ⚠ ПОДАТЬ СИГНАЛ БЕДСТВИЯ
                </button>
              </form>
            ) : (
              <div className="space-y-3">
                <div className="bg-red-600 text-white p-6 rounded-lg animate-pulse">
                  <p className="text-2xl font-bold">⚠️ СИГНАЛ БЕДСТВИЯ АКТИВЕН</p>
                  <p className="text-xl font-mono mt-2">Код: {booking.distressCode}</p>
                </div>
                <button onClick={() => updateBookingStatus({ isDistress: false, distressCode: null })} disabled={saving} className="btn-secondary w-full">
                  Отменить сигнал бедствия
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'departure' && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">✈️ Отметка о вылете</h2>
            {!booking.hasDeparted ? (
              <form onSubmit={handleDepartureSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Фактическое время вылета</label>
                  <input type="datetime-local" value={actualDeparture} onChange={(e) => setActualDeparture(e.target.value)} className="input-field" />
                </div>
                <button type="submit" disabled={saving} className="btn-primary w-full">
                  Рейс вылетел
                </button>
              </form>
            ) : (
              <div className="space-y-3">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-purple-800 font-medium">Рейс вылетел</p>
                  {booking.actualDeparture && (
                    <p className="text-purple-600 mt-1">Время: {formatDateTime(booking.actualDeparture)}</p>
                  )}
                </div>
                <button onClick={() => updateBookingStatus({ hasDeparted: false, actualDeparture: null })} disabled={saving} className="btn-secondary w-full">
                  Отменить отметку о вылете
                </button>
              </div>
            )}
          </div>
        )}

        {booking.notifications && booking.notifications.length > 0 && (
          <div className="card mt-6">
            <h2 className="text-xl font-semibold mb-4">📢 История уведомлений</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {booking.notifications.map((n: any) => (
                <div key={n.id} className={`p-3 rounded-lg ${n.type === 'flight_distress' ? 'bg-red-100 border border-red-300' : 'bg-gray-50'}`}>
                  <p className="text-sm">{n.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatDateTime(n.createdAt)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">✏️ Редактирование бронирования</h3>
                <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
              </div>
              
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <h4 className="font-semibold text-gray-700">Пассажир</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Фамилия *</label>
                    <input type="text" value={editForm.lastName} onChange={e => setEditForm({...editForm, lastName: e.target.value})} className="input-field" required />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Имя *</label>
                    <input type="text" value={editForm.firstName} onChange={e => setEditForm({...editForm, firstName: e.target.value})} className="input-field" required />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Отчество</label>
                    <input type="text" value={editForm.middleName} onChange={e => setEditForm({...editForm, middleName: e.target.value})} className="input-field" />
                  </div>
                </div>

                <h4 className="font-semibold text-gray-700">Рейс</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Номер рейса *</label>
                    <input type="text" value={editForm.flightNumber} onChange={e => setEditForm({...editForm, flightNumber: e.target.value})} className="input-field" required />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Дата вылета *</label>
                    <input type="date" value={editForm.departureDate} onChange={e => setEditForm({...editForm, departureDate: e.target.value})} className="input-field" required />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Время вылета *</label>
                    <input type="time" value={editForm.departureTime} onChange={e => setEditForm({...editForm, departureTime: e.target.value})} className="input-field" required />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Время прилёта *</label>
                    <input type="time" value={editForm.arrivalTime} onChange={e => setEditForm({...editForm, arrivalTime: e.target.value})} className="input-field" required />
                  </div>
                </div>

                <h4 className="font-semibold text-gray-700">Маршрут</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Город вылета *</label>
                    <input type="text" value={editForm.originCity} onChange={e => setEditForm({...editForm, originCity: e.target.value})} className="input-field" required />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Код ИАТА *</label>
                    <input type="text" value={editForm.originCode} onChange={e => setEditForm({...editForm, originCode: e.target.value.toUpperCase()})} className="input-field" maxLength={3} required />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Город прилёта *</label>
                    <input type="text" value={editForm.destinationCity} onChange={e => setEditForm({...editForm, destinationCity: e.target.value})} className="input-field" required />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Код ИАТА *</label>
                    <input type="text" value={editForm.destinationCode} onChange={e => setEditForm({...editForm, destinationCode: e.target.value.toUpperCase()})} className="input-field" maxLength={3} required />
                  </div>
                </div>

                <h4 className="font-semibold text-gray-700">Аэропорт</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Стойки</label>
                    <input type="text" value={editForm.checkInDesks} onChange={e => setEditForm({...editForm, checkInDesks: e.target.value})} className="input-field" placeholder="1-10" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Выход</label>
                    <input type="text" value={editForm.gate} onChange={e => setEditForm({...editForm, gate: e.target.value})} className="input-field" placeholder="A12" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Тип посадки</label>
                    <select value={editForm.boardingType} onChange={e => setEditForm({...editForm, boardingType: e.target.value})} className="input-field">
                      <option value="jetbridge">Телетрап</option>
                      <option value="bus">Автобус</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" disabled={saving} className="btn-primary flex-1">
                    💾 Сохранить изменения
                  </button>
                  <button type="button" onClick={() => setShowEditModal(false)} className="btn-secondary">
                    Отмена
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
