'use client'

import { useState } from 'react'

export default function Setup() {
  const [step, setStep] = useState(1)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (log: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${log}`])
  }

  const checkDatabase = async () => {
    setLoading(true)
    setMessage('')
    addLog('Проверка базы данных...')
    
    try {
      const response = await fetch('/api/setup/check-db')
      const text = await response.text()
      addLog(`Ответ сервера: ${text}`)
      
      let data
      try {
        data = JSON.parse(text)
      } catch {
        addLog('Ошибка парсинга JSON')
        setMessage('❌ Сервер вернул не JSON. Смотри логи.')
        return
      }
      
      if (data.tablesExist) {
        addLog('✅ Таблицы существуют')
        setMessage('✅ База данных настроена!')
        setStep(3)
      } else {
        addLog('❌ Таблицы не найдены')
        setMessage('❌ Таблицы не найдены. Нужно создать.')
        setStep(2)
      }
    } catch (error: any) {
      addLog(`Ошибка: ${error.message}`)
      setMessage('❌ Ошибка: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const createTables = async () => {
    setLoading(true)
    setMessage('')
    addLog('Создание таблиц...')
    
    try {
      const response = await fetch('/api/setup/create-tables', {
        method: 'POST'
      })
      const text = await response.text()
      addLog(`Ответ: ${text}`)
      
      let data
      try {
        data = JSON.parse(text)
      } catch {
        addLog('Ответ не JSON')
        // Пробуем проверить ещё раз
        addLog('Проверяем результат...')
        const checkResponse = await fetch('/api/setup/check-db')
        const checkText = await checkResponse.text()
        addLog(`Проверка: ${checkText}`)
        
        try {
          const checkData = JSON.parse(checkText)
          if (checkData.tablesExist) {
            setMessage('✅ Таблицы созданы!')
            setStep(3)
          } else {
            setMessage('❌ Таблицы не создались. Смотри логи.')
          }
        } catch {
          setMessage('❌ Ошибка. Смотри логи внизу.')
        }
        return
      }
      
      if (data.success) {
        addLog('✅ Таблицы созданы')
        setMessage('✅ Таблицы созданы успешно!')
        setStep(3)
      } else {
        addLog(`Ошибка: ${data.error}`)
        setMessage('❌ Ошибка: ' + (data.error || 'Неизвестная'))
      }
    } catch (error: any) {
      addLog(`Ошибка: ${error.message}`)
      setMessage('❌ Ошибка: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const createAdmin = async () => {
    setLoading(true)
    setMessage('')
    addLog('Создание администратора...')
    
    try {
      const response = await fetch('/api/setup/create-admin', {
        method: 'POST'
      })
      const text = await response.text()
      addLog(`Ответ: ${text}`)
      
      let data
      try {
        data = JSON.parse(text)
      } catch {
        setMessage('❌ Ошибка. Смотри логи.')
        return
      }
      
      if (data.success) {
        addLog('✅ Админ создан')
        setMessage('✅ Администратор создан!')
        setStep(4)
      } else {
        addLog(`Ошибка: ${data.error}`)
        setMessage('❌ Ошибка: ' + data.error)
      }
    } catch (error: any) {
      addLog(`Ошибка: ${error.message}`)
      setMessage('❌ Ошибка: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const createTestBooking = async () => {
    setLoading(true)
    setMessage('')
    addLog('Создание бронирования...')
    
    try {
      const response = await fetch('/api/setup/create-test-booking', {
        method: 'POST'
      })
      const text = await response.text()
      addLog(`Ответ: ${text}`)
      
      let data
      try {
        data = JSON.parse(text)
      } catch {
        setMessage('❌ Ошибка. Смотри логи.')
        return
      }
      
      if (data.success) {
        addLog('✅ Бронирование создано')
        setMessage('✅ Бронирование создано!')
        setStep(5)
      } else {
        addLog(`Ошибка: ${data.error}`)
        setMessage('❌ Ошибка: ' + data.error)
      }
    } catch (error: any) {
      addLog(`Ошибка: ${error.message}`)
      setMessage('❌ Ошибка: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold">🚀 Настройка НМР</h1>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-4">
          <div className="flex gap-2 justify-center mb-4">
            {[1,2,3,4,5].map(s => (
              <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                step >= s ? 'bg-green-500 text-white' : 'bg-gray-200'
              }`}>
                {step > s ? '✓' : s}
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {step === 1 && (
              <button onClick={checkDatabase} disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {loading ? '⏳ Проверка...' : '1. Проверить базу данных'}
              </button>
            )}
            
            {step === 2 && (
              <button onClick={createTables} disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {loading ? '⏳ Создание...' : '2. Создать таблицы'}
              </button>
            )}
            
            {step === 3 && (
              <button onClick={createAdmin} disabled={loading}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50">
                {loading ? '⏳ Создание...' : '3. Создать администратора'}
              </button>
            )}
            
            {step === 4 && (
              <button onClick={createTestBooking} disabled={loading}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50">
                {loading ? '⏳ Создание...' : '4. Создать тестовое бронирование'}
              </button>
            )}
            
            {step === 5 && (
              <div className="text-center">
                <p className="text-xl mb-4">🎉 Готово!</p>
                <div className="space-y-2">
                  <a href="/admin/login" 
                    className="block w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700">
                    Войти как админ
                  </a>
                  <a href="/passenger" 
                    className="block w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700">
                    Страница пассажира
                  </a>
                </div>
              </div>
            )}
          </div>

          {message && (
            <div className={`mt-4 p-3 rounded-lg text-sm ${
              message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {message}
            </div>
          )}
        </div>

        {/* Логи */}
        {logs.length > 0 && (
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs font-mono max-h-64 overflow-y-auto">
            {logs.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
