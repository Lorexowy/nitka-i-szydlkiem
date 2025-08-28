'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { AuthService } from '@/lib/auth'
import CreateAdminTool from '@/components/CreateAdminTool'
import { 
  ArrowLeft,
  Settings,
  User,
  Shield,
  Database,
  Bell,
  Mail,
  Globe,
  Palette,
  Info
} from 'lucide-react'

export default function AdminSettingsPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [showCreateAdmin, setShowCreateAdmin] = useState(false)
  const router = useRouter()

  // Auth check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/admin/login')
        return
      }

      const adminStatus = await AuthService.isAdmin(user.uid)
      if (!adminStatus) {
        router.push('/admin/login')
        return
      }

      setIsAdmin(true)
      setCurrentUser(user)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link
              href="/admin/dashboard"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Ustawienia administratora</h1>
              <p className="text-gray-600">Zarządzaj ustawieniami systemu i administratorami</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* System status */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Status systemu</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <Database className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="text-sm font-medium text-green-900">Firebase</div>
                  <div className="text-xs text-green-600">Połączono</div>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <Shield className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="text-sm font-medium text-green-900">Autoryzacja</div>
                  <div className="text-xs text-green-600">Aktywna</div>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <Globe className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="text-sm font-medium text-green-900">Strona</div>
                  <div className="text-xs text-green-600">Online</div>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Szybkie akcje</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  href="/admin/products"
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Database className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Zarządzaj produktami</h3>
                      <p className="text-sm text-gray-600">Dodawaj, edytuj i usuwaj produkty</p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/admin/categories"
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Settings className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Zarządzaj kategoriami</h3>
                      <p className="text-sm text-gray-600">Organizuj kategorie produktów</p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/admin/orders"
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Mail className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Zamówienia</h3>
                      <p className="text-sm text-gray-600">Zobacz i zarządzaj zamówieniami</p>
                    </div>
                  </div>
                </Link>

                <button
                  onClick={() => setShowCreateAdmin(true)}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <User className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Dodaj administratora</h3>
                      <p className="text-sm text-gray-600">Utwórz nowe konto administratora</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Store settings */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Palette className="h-5 w-5" />
                <span>Ustawienia sklepu</span>
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nazwa sklepu
                  </label>
                  <input
                    type="text"
                    value="Nitką i Szydełkiem"
                    readOnly
                    className="input-field bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Obecnie tylko do odczytu - skontaktuj się z developerem aby zmienić
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email kontaktowy
                  </label>
                  <input
                    type="email"
                    value="kontakt@nitkaiszydlkiem.pl"
                    readOnly
                    className="input-field bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value="+48 123 456 789"
                    readOnly
                    className="input-field bg-gray-50"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Info className="h-4 w-4 text-blue-600" />
                    <span className="text-blue-800 text-sm">
                      Aby zmienić te ustawienia, edytuj plik Header.tsx i Footer.tsx
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications settings */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Powiadomienia</span>
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Nowe zamówienia</h3>
                    <p className="text-xs text-gray-600">Otrzymuj powiadomienia o nowych zamówieniach</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Niski stan magazynowy</h3>
                    <p className="text-xs text-gray-600">Powiadomienia gdy produkt ma mniej niż 5 sztuk</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Nowe recenzje</h3>
                    <p className="text-xs text-gray-600">Powiadomienia o nowych opiniach klientów</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current admin info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Twoje konto</h2>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {currentUser?.displayName || 'Administrator'}
                    </div>
                    <div className="text-xs text-gray-600">{currentUser?.email}</div>
                  </div>
                </div>
                
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Rola</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                      Administrator
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Status</span>
                  <span className="text-green-600 font-medium">Aktywny</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">UID</span>
                  <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                    {currentUser?.uid?.substring(0, 8)}...
                  </span>
                </div>
              </div>
            </div>

            {/* System info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Informacje systemowe</h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Wersja</span>
                  <span className="font-mono">1.0.0</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Framework</span>
                  <span>Next.js 14</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Baza danych</span>
                  <span>Firebase Firestore</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Storage</span>
                  <span>Firebase Storage</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Hosting</span>
                  <span>Vercel</span>
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Szybkie statystyki</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Produkty</span>
                  <span className="font-semibold">-</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Kategorie</span>
                  <span className="font-semibold">23</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Zamówienia</span>
                  <span className="font-semibold">-</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Klienci</span>
                  <span className="font-semibold">-</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <Link
                  href="/admin/dashboard"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Zobacz pełne statystyki →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Create admin modal */}
        {showCreateAdmin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-1">
              <div className="flex items-center justify-between p-5 pb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  Dodaj nowego administratora
                </h3>
                <button
                  onClick={() => setShowCreateAdmin(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-xl">&times;</span>
                </button>
              </div>
              
              <div className="px-1">
                <CreateAdminTool />
              </div>
              
              <div className="p-5 pt-3">
                <button
                  onClick={() => setShowCreateAdmin(false)}
                  className="w-full btn-outline"
                >
                  Zamknij
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}