'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { AuthService } from '@/lib/auth'
import { Mail, Lock, Eye, EyeOff, LogIn, CheckCircle } from 'lucide-react'

function LoginContent() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rememberMe, setRememberMe] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Check for registration success message
  const registered = searchParams.get('registered')
  const redirectTo = searchParams.get('redirect') || '/konto'

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (error) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const user = await AuthService.loginUser(formData.email, formData.password)
      
      // Sprawdź czy to nie admin (adminów przekierowuj do panelu admin)
      if (user.role === 'admin') {
        router.push('/admin/dashboard')
      } else {
        // Zwykli użytkownicy - przekieruj do konta lub gdzie chcieli iść
        router.push(redirectTo)
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <LogIn className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Zaloguj się
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Witaj ponownie! Miło Cię widzieć.
          </p>
        </div>

        {/* Success message after registration */}
        {registered && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <h3 className="text-green-800 font-medium">Konto utworzone!</h3>
                <p className="text-green-700 text-sm">Możesz się teraz zalogować.</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Adres email
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="twój@email.com"
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* Password */}
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
                  value={formData.password}
                  onChange={handleChange}
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

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="remember-me" className="ml-2 text-sm text-gray-700">
                  Zapamiętaj mnie
                </label>
              </div>

              <div>
                <Link 
                  href="/resetowanie-hasla" 
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Zapomniałeś hasła?
                </Link>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Submit button */}
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
                    <LogIn className="h-4 w-4" />
                    <span>Zaloguj się</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Registration link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Nie masz jeszcze konta?{' '}
              <Link href="/rejestracja" className="text-blue-600 hover:text-blue-700 font-medium">
                Załóż konto
              </Link>
            </p>
          </div>
        </div>

        {/* Quick access for admins */}
        <div className="bg-gray-100 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600 mb-2">
            Jesteś administratorem?
          </p>
          <Link 
            href="/admin/login" 
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Zaloguj się do panelu administratora
          </Link>
        </div>

        {/* Guest checkout info */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Możesz też{' '}
            <Link href="/koszyk" className="text-blue-600 hover:text-blue-700">
              kontynuować jako gość
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}