'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Setup() {
  const [step, setStep] = useState(1)
  const [sqlCode, setSqlCode] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [dbUrl, setDbUrl] = useState('')
  const router = useRouter()

  const checkDatabase = async () => {
    setLoading(true)
    setMessage('Проверяю базу данных...')
    
    try {
      const response = await fetch('/api/setup/check-db')
      const data = await response.json()
      
      if (data.tablesExist) {
        setMessage('✅ База данных настроена! Таблицы существуют.')
        setStep(3)
      } else {
        setMessage('❌ Таблицы не найдены. Нужно создать.')
        setStep(2)
      }
    } catch (error) {
      setMessage('❌ Ошибка подключения: ' + String(error))
    } finally {
      setLoading(false)
    }
  }

  const createTables = async () => {
    setLoading(true)
    setMessage('Создаю таблицы...')
    
    try {
      const response = await fetch('/api/setup/create-tables')
      const data = await response.json()
      
      if (data.success) {
        setMessage('✅ Таблицы созданы успешно!')
        setStep(3)
      } else {
        setMessage('❌ Ошибка: ' + data.error)
      }
    } catch (error) {
      setMessage('❌ Ошибка: ' + String(error))
    } finally {
      setLoading(false)
    }
  }

  const createAdmin = async () => {
    setLoading(true)
    setMessage('Создаю администратора...')
    
    try {
      const response = await fetch('/api/setup/create-admin')
      const data = await response.json()
      
      if (data.success) {
        setMessage('✅ Администратор создан! Email: admin@aso.ru, Пароль: admin123')
        setStep(4)
      } else {
        setMessage('❌ Ошибка: ' + data.error)
      }
    } catch (error) {
      setMessage('❌ Ошибка: ' + String(error))
    } finally {
      setLoading(false)
    }
  }

  const createTestBooking = async () => {
    setLoading(true)
    setMessage('Создаю тестовое бронирование...')
    
    try {
      const response = await fetch('/api/setup/create-test-booking')
      const data = await response.json()
      
      if (data.success) {
        setMessage('✅ Тестовое бронирование создано! Код: TEST01, Фамилия: Иванов')
        setStep(5)
      } else {
        setMessage('❌ Ошибка: ' + data.error)
      }
    } catch (error) {
      setMessage('❌ Ошибка: ' + String(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🚀 Настройка НМР
          </h1>
          <p className="text-gray-600">
            Пошаговая настройка базы данных и создание администратора
          </p>
        </div>

        {/* Прогресс */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= s
                    ? 'bg-aviation-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step > s ? '✓' : s}
              </div>
            ))}
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-full bg-aviation-600 rounded-full transition-all"
              style={{ width: `${(step - 1) * 25}%` }}
            />
          </div>
        </div>

        {/* Шаги */}
        <div className="card">
          {step === 1 && (
            <div className="text-center">
              <div className="text-6xl mb-4">🗄️</div>
              <h2 className="text-xl font-semibold mb-4">Шаг 1: Проверка базы данных</h2>
              <p className="text-gray-600 mb-6">
                Проверим, созданы ли таблицы в базе данных
              </p>
              <button
                onClick={checkDatabase}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Проверка...' : 'Проверить базу данных'}
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="text-center">
              <div className="text-6xl mb-4">📋</div>
              <h2 className="text-xl font-semibold mb-4">Шаг 2: Создание таблиц</h2>
              <p className="text-gray-600 mb-6">
                Нужно создать таблицы в базе данных
              </p>
              <button
                onClick={createTables}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Создание...' : 'Создать таблицы'}
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="text-center">
              <div className="text-6xl mb-4">👤</div>
              <h2 className="text-xl font-semibold mb-4">Шаг 3: Создание администратора</h2>
              <p className="text-gray-600 mb-6">
                Создадим учётную запись администратора
              </p>
              <button
                onClick={createAdmin}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Создание...' : 'Создать администратора'}
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="text-center">
              <div className="text-6xl mb-4">✈️</div>
              <h2 className="text-xl font-semibold mb-4">Шаг 4: Тестовое бронирование</h2>
              <p className="text-gray-600 mb-6">
                Создадим тестовое бронирование для проверки
              </p>
              <button
                onClick={createTestBooking}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Создание...' : 'Создать бронирование'}
              </button>
            </div>
          )}

          {step === 5 && (
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-xl font-semibold mb-4">Готово!</h2>
              <p className="text-gray-600 mb-6">
                Всё настроено! Теперь можно пользоваться системой.
              </p>
              <div className="space-y-3">
                <div className="bg-green-50 p-4 rounded-lg text-left">
                  <p className="font-medium text-green-800">Данные администратора:</p>
                  <p className="text-green-700">Email: admin@aso.ru</p>
                  <p className="text-green-700">Пароль: admin123</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg text-left">
                  <p className="font-medium text-blue-800">Тестовое бронирование:</p>
                  <p className="text-blue-700">Код: TEST01</p>
                  <p className="text-blue-700">Фамилия: Иванов</p>
                </div>
                <div className="flex gap-3 justify-center mt-4">
                  <a href="/admin/login" className="btn-primary">
                    Войти как админ
                  </a>
                  <a href="/passenger" className="btn-secondary">
                    Страница пассажира
                  </a>
                </div>
              </div>
            </div>
          )}

          {message && (
            <div className={`mt-6 p-4 rounded-lg ${
              message.includes('✅') 
                ? 'bg-green-50 text-green-800' 
                : message.includes('❌') 
                  ? 'bg-red-50 text-red-800'
                  : 'bg-blue-50 text-blue-800'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
