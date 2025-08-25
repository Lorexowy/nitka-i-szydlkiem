'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthService } from '@/lib/auth'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { Lock, Mail, Eye, EyeOff, ShieldCheck } from 'lucide-react'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Sprawdź czy user jest już zalogowany jako admin
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const isAdmin = await AuthService.isAdmin(user.uid)
        if (isAdmin) {
          router.push('/admin/dashboard')
        }
      }
    })

    return () => unsubscribe()
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const user = await AuthService.loginUser(email, password)
      
      // Sprawdź czy to admin
      if (user.role !== 'admin') {
        await AuthService.logoutUser()
        throw new Error('Brak uprawnień administratora')
      }

      // Przekieruj do dashboardu
      router.push('/admin/dashboard')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Panel Administratora
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Zaloguj się do panelu zarządzania
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email administratora
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="admin@nitkaiszydlkiem.pl"
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Hasło
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10"
                  placeholder="Wprowadź hasło"
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm text-center">{error}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary flex items-center justify-center space-x-2 py-3"
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner"></div>
                  <span>Logowanie...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span>Zaloguj się jako Administrator</span>
                </>
              )}
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              ← Wróć do strony głównej
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}