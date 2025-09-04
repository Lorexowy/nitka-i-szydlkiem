'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthService } from '@/lib/auth'
import { User, Mail, Lock, Eye, EyeOff, UserCheck } from 'lucide-react'

export default function RegistrationPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [newsletter, setNewsletter] = useState(false)
  
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (error) setError(null)
  }

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError('Imię jest wymagane')
      return false
    }
    
    if (!formData.lastName.trim()) {
      setError('Nazwisko jest wymagane')
      return false
    }
    
    if (!formData.email.trim()) {
      setError('Email jest wymagany')
      return false
    }
    
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Podaj prawidłowy adres email')
      return false
    }
    
    if (formData.password.length < 6) {
      setError('Hasło musi mieć minimum 6 znaków')
      return false
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Hasła nie są identyczne')
      return false
    }
    
    if (!agreedToTerms) {
      setError('Musisz zaakceptować regulamin')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsLoading(true)
    setError(null)

    try {
      const displayName = `${formData.firstName} ${formData.lastName}`
      await AuthService.registerUser(formData.email, formData.password, displayName)
      
      // Redirect to login with success message
      router.push('/logowanie?registered=true')
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
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
            <UserCheck className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Załóż konto
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Dołącz do społeczności miłośników szydełkowania
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* First Name & Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  Imię *
                </label>
                <div className="mt-1 relative">
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="Anna"
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Nazwisko *
                </label>
                <div className="mt-1">
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Kowalska"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Adres email *
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
                  placeholder="anna@example.com"
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Hasło *
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pl-10 pr-10"
                  placeholder="Minimum 6 znaków"
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

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Potwierdź hasło *
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-field pl-10 pr-10"
                  placeholder="Powtórz hasło"
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-3">
              <div className="flex items-start">
                <input
                  id="terms"
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                />
                <label htmlFor="terms" className="ml-3 text-sm text-gray-700">
                  Akceptuję{' '}
                  <Link href="/regulamin" className="text-pink-600 hover:text-pink-700">
                    regulamin
                  </Link>
                  {' '}i{' '}
                  <Link href="/polityka-prywatnosci" className="text-pink-600 hover:text-pink-700">
                    politykę prywatności
                  </Link>
                  {' '}<span className="text-red-500">*</span>
                </label>
              </div>

              <div className="flex items-start">
                <input
                  id="newsletter"
                  type="checkbox"
                  checked={newsletter}
                  onChange={(e) => setNewsletter(e.target.checked)}
                  className="mt-1 w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                />
                <label htmlFor="newsletter" className="ml-3 text-sm text-gray-700">
                  Chcę otrzymywać newsletter z informacjami o nowych produktach i promocjach
                </label>
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
                    <span>Tworzenie konta...</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="h-4 w-4" />
                    <span>Załóż konto</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Login link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Masz już konto?{' '}
              <Link href="/logowanie" className="text-pink-600 hover:text-pink-700 font-medium">
                Zaloguj się
              </Link>
            </p>
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            Korzyści z posiadania konta
          </h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-pink-600 text-xs">✓</span>
              </div>
              <span>Szybsze składanie zamówień</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-pink-600 text-xs">✓</span>
              </div>
              <span>Historia zamówień i statusy dostaw</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-pink-600 text-xs">✓</span>
              </div>
              <span>Lista życzeń z ulubionymi produktami</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-pink-600 text-xs">✓</span>
              </div>
              <span>Ekskluzywne promocje i nowości</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}