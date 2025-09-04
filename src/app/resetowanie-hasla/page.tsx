'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AuthService } from '@/lib/auth'
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'

export default function PasswordResetPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      setError('Podaj adres email')
      return
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Podaj prawidłowy adres email')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await AuthService.sendPasswordResetEmail(email)
      setSuccess(true)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Email wysłany!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Sprawdź swoją skrzynkę pocztową
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm">
                  Wysłaliśmy link do resetowania hasła na adres:
                </p>
                <p className="text-green-900 font-semibold mt-1">
                  {email}
                </p>
              </div>

              <div className="text-left text-sm text-gray-600 space-y-2">
                <p><strong>Co dalej?</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Sprawdź swoją skrzynkę pocztową (również folder spam)</li>
                  <li>Kliknij w link w otrzymanym emailu</li>
                  <li>Ustaw nowe hasło</li>
                  <li>Zaloguj się używając nowego hasła</li>
                </ul>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Nie otrzymałeś emaila? 
                  <button 
                    onClick={() => setSuccess(false)}
                    className="text-blue-600 hover:text-blue-700 ml-1"
                  >
                    Wyślij ponownie
                  </button>
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link 
              href="/logowanie"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Powrót do logowania</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Resetuj hasło
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Podaj swój email, a wyślemy Ci link do resetowania hasła
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Adres email
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (error) setError(null)
                  }}
                  className="input-field pl-10"
                  placeholder="twój@email.com"
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary flex items-center justify-center space-x-2 py-3"
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner"></div>
                  <span>Wysyłanie...</span>
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  <span>Wyślij link resetujący</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link 
              href="/logowanie"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Powrót do logowania</span>
            </Link>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <Mail className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Wskazówka bezpieczeństwa</p>
              <p className="mt-1">
                Jeśli nie masz konta w naszym sklepie, nie otrzymasz emaila. 
                To zabezpiecza przed sprawdzaniem, czy dany email jest zarejestrowany.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}