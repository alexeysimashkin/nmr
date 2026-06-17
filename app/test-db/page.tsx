'use client'

import { useState } from 'react'

export default function TestDB() {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    try {
      // Пробуем создать админа через API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: 'admin@aso.ru', 
          password: 'admin123' 
        })
      })

      const data = await response.json()
      setResult(JSON.stringify(data, null, 2))
    } catch (error) {
      setResult('Ошибка: ' + String(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Проверка базы данных</h1>
      
      <button
        onClick={testConnection}
        disabled={loading}
        className="btn-primary mb-4"
      >
        {loading ? 'Проверка...' : 'Создать/обновить админа'}
      </button>

      {result && (
        <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
          {result}
        </pre>
      )}

      <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
        <p className="text-sm">
          После успешного создания админа, перейди на {' '}
          <a href="/admin/login" className="text-blue-600 underline">
            страницу входа
          </a>
          {' '}и войди с email: admin@aso.ru, пароль: admin123
        </p>
      </div>
    </div>
  )
}
