'use client'

import { useState } from 'react'
import { AuthService } from '@/lib/auth'
import { User, ShieldCheck } from 'lucide-react'

export default function CreateAdminTool() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)
    setError(null)
    setSuccess(null)

    try {
      const adminUser = await AuthService.createAdminUser(email, password, displayName)
      setSuccess(`Admin został utworzony! UID: ${adminUser.uid}`)
      setEmail('')
      setPassword('')
      setDisplayName('')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg border border-gray-200">
      <div className="text-center mb-6">
        <ShieldCheck className="h-12 w-12 text-blue-600 mx-auto mb-3" />
        <h2 className="text-2xl font-bold text-gray-900">Utwórz Admina</h2>
        <p className="text-gray-600 text-sm">
          Jednorazowe narzędzie do utworzenia pierwszego konta administratora
        </p>
      </div>

      <form onSubmit={handleCreateAdmin} className="space-y-4">
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
            Imię i nazwisko
          </label>
          <input
            type="text"
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="input-field"
            placeholder="np. Anna Kowalska"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email administratora
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            placeholder="admin@nitkaiszydlkiem.pl"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Hasło
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            placeholder="Minimum 6 znaków"
            minLength={6}
            required
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-green-700 text-sm">{success}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isCreating}
          className="w-full btn-primary flex items-center justify-center space-x-2"
        >
          {isCreating ? (
            <>
              <div className="loading-spinner"></div>
              <span>Tworzenie...</span>
            </>
          ) : (
            <>
              <User className="h-4 w-4" />
              <span>Utwórz konto administratora</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          ⚠️ Ten komponent należy usunąć po utworzeniu konta administratora
        </p>
      </div>
    </div>
  )
}