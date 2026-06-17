'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function AdminLogin() {
  const [email, setEmail] = useState('admin@aso.ru')
  const [password, setPassword] = useState('admin123')
  const [loading, setLoading] = useState(false)
  const [errorDetails, setErrorDetails] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorDetails('')

    try {
      console.log('Sending login request...')
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()
      console.log('Response:', { status: response.status, data })

      if (!response.ok) {
        const errorMsg = data.error || 'Ошибка входа'
        setErrorDetails(JSON.stringify(data, null, 2))
        toast.error(errorMsg)
        return
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      toast.success('Вход выполнен успешно!')
      router.push('/admin/dashboard')
    } catch (error) {
      console.error('Login error:', error)
      setErrorDetails(String(error))
      toast.error('Ошибка при входе. Проверьте консоль.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            НМР Админ
          </h1>
          <p className="text-gray-400">
            ASO Company • Управление бронированиями
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="admin@aso.ru"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Пароль
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>

            {errorDetails && (
              <div className="p-3 bg-red-50 rounded-lg">
                <p className="text-sm text-red-800 font-medium mb-1">Ошибка:</p>
                <pre className="text-xs text-red-600 overflow-auto max-h-32">
                  {errorDetails}
                </pre>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Тестовые данные:</strong><br/>
              Email: admin@aso.ru<br/>
              Пароль: admin123
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <a 
            href="/passenger" 
            className="text-sm text-gray-400 hover:text-white"
          >
            Вернуться на страницу пассажира
          </a>
        </div>
      </div>
    </div>
  )
}
