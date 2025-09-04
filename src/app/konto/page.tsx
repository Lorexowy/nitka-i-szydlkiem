'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { AuthService } from '@/lib/auth'
import { User } from '@/lib/firestore-types'
import { 
  User as UserIcon, 
  Settings, 
  Package, 
  Heart, 
  MapPin, 
  LogOut,
  Edit,
  Mail,
  Calendar,
  Shield,
  ChevronRight,
  Bell,
  CreditCard,
  Truck
} from 'lucide-react'

export default function UserAccountPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        router.push('/logowanie')
        return
      }

      try {
        const userData = await AuthService.getUserData(firebaseUser.uid)
        if (!userData) {
          throw new Error('Nie znaleziono danych użytkownika')
        }

        // Jeśli to admin, przekieruj do panelu admin
        if (userData.role === 'admin') {
          router.push('/admin/dashboard')
          return
        }

        setUser(userData)
      } catch (error) {
        console.error('Error loading user data:', error)
        router.push('/logowanie')
      } finally {
        setIsLoading(false)
      }
    })

    return () => unsubscribe()
  }, [router])

  const handleLogout = async () => {
    try {
      await AuthService.logoutUser()
      router.push('/')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp || !timestamp.seconds) return 'Brak danych'
    return new Date(timestamp.seconds * 1000).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-600">Ładowanie konta...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Menu items for different sections
  const menuItems = [
    {
      id: 'overview',
      label: 'Przegląd konta',
      icon: <UserIcon className="h-5 w-5" />,
      description: 'Podstawowe informacje o koncie'
    },
    {
      id: 'orders',
      label: 'Moje zamówienia',
      icon: <Package className="h-5 w-5" />,
      description: 'Historia zamówień i statusy'
    },
    {
      id: 'wishlist',
      label: 'Lista życzeń',
      icon: <Heart className="h-5 w-5" />,
      description: 'Ulubione produkty'
    },
    {
      id: 'addresses',
      label: 'Adresy',
      icon: <MapPin className="h-5 w-5" />,
      description: 'Adresy do wysyłki i płatności'
    },
    {
      id: 'settings',
      label: 'Ustawienia',
      icon: <Settings className="h-5 w-5" />,
      description: 'Dane osobowe i preferencje'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Witaj, {user.displayName || 'Użytkowniku'}!
          </h1>
          <p className="text-gray-600">
            Zarządzaj swoim kontem, zamówieniami i preferencjami
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Menu */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              {/* User info */}
              <div className="text-center mb-6 pb-6 border-b border-gray-200">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <UserIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">
                  {user.displayName || 'Użytkownik'}
                </h3>
                <p className="text-sm text-gray-600">{user.email}</p>
                <div className="flex items-center justify-center mt-2">
                  <Shield className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600 font-medium">
                    Zweryfikowany
                  </span>
                </div>
              </div>

              {/* Navigation Menu */}
              <nav className="space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors duration-200 ${
                      activeTab === item.id
                        ? 'bg-pink-50 text-pink-700 border border-pink-200'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {item.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium">{item.label}</div>
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ))}
              </nav>

              {/* Logout */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-3 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="text-sm font-medium">Wyloguj się</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Package className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Zamówienia</p>
                        <p className="text-2xl font-bold text-gray-900">0</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-pink-100 rounded-lg">
                        <Heart className="h-6 w-6 text-pink-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Lista życzeń</p>
                        <p className="text-2xl font-bold text-gray-900">0</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CreditCard className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Wydano</p>
                        <p className="text-2xl font-bold text-gray-900">0 zł</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Info */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Informacje o koncie</h3>
                    <button
                      onClick={() => setActiveTab('settings')}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edytuj</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <UserIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">Imię i nazwisko</p>
                          <p className="text-gray-900">{user.displayName || 'Nie podano'}</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">Email</p>
                          <p className="text-gray-900">{user.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">Członek od</p>
                          <p className="text-gray-900">{formatDate(user.createdAt)}</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Shield className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">Status konta</p>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Aktywne
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Szybkie akcje</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link
                      href="/produkty"
                      className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Package className="h-6 w-6 text-blue-600" />
                      <div>
                        <h4 className="font-medium text-gray-900">Przeglądaj produkty</h4>
                        <p className="text-sm text-gray-600">Odkryj nasze najnowsze kolekcje</p>
                      </div>
                    </Link>

                    <button
                      onClick={() => setActiveTab('addresses')}
                      className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <MapPin className="h-6 w-6 text-green-600" />
                      <div>
                        <h4 className="font-medium text-gray-900">Dodaj adres</h4>
                        <p className="text-sm text-gray-600">Przyspiesz swoje zamówienia</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Historia zamówień</h3>
                
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Brak zamówień</h4>
                  <p className="text-gray-600 mb-6">
                    Nie masz jeszcze żadnych zamówień. Czas na pierwsze zakupy!
                  </p>
                  <Link href="/produkty" className="btn-primary">
                    Rozpocznij zakupy
                  </Link>
                </div>
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Lista życzeń</h3>
                
                <div className="text-center py-12">
                  <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Pusta lista życzeń</h4>
                  <p className="text-gray-600 mb-6">
                    Dodawaj produkty do listy życzeń, aby łatwo do nich wrócić
                  </p>
                  <Link href="/produkty" className="btn-primary">
                    Przeglądaj produkty
                  </Link>
                </div>
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Adresy</h3>
                  <button className="btn-primary text-sm">
                    Dodaj adres
                  </button>
                </div>
                
                <div className="text-center py-12">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Brak zapisanych adresów</h4>
                  <p className="text-gray-600 mb-6">
                    Dodaj adresy do wysyłki i płatności, aby przyspieszyć składanie zamówień
                  </p>
                  <button className="btn-primary">
                    Dodaj pierwszy adres
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                {/* Personal Information */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Dane osobowe</h3>
                  
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                          Imię i nazwisko
                        </label>
                        <input
                          type="text"
                          id="displayName"
                          defaultValue={user.displayName || ''}
                          className="input-field"
                          placeholder="Jan Kowalski"
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          defaultValue={user.email}
                          className="input-field bg-gray-50"
                          disabled
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Email nie może być zmieniony
                        </p>
                      </div>

                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                          Telefon
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          className="input-field"
                          placeholder="+48 123 456 789"
                        />
                      </div>

                      <div>
                        <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                          Data urodzenia
                        </label>
                        <input
                          type="date"
                          id="dateOfBirth"
                          className="input-field"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button type="submit" className="btn-primary">
                        Zapisz zmiany
                      </button>
                    </div>
                  </form>
                </div>

                {/* Notification Preferences */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Preferencje powiadomień</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Bell className="h-5 w-5 text-gray-400" />
                        <div>
                          <h4 className="font-medium text-gray-900">Newsletter</h4>
                          <p className="text-sm text-gray-600">Informacje o nowych produktach i promocjach</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Truck className="h-5 w-5 text-gray-400" />
                        <div>
                          <h4 className="font-medium text-gray-900">Powiadomienia o zamówieniach</h4>
                          <p className="text-sm text-gray-600">Status zamówienia i informacje o dostawie</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-gray-400" />
                        <div>
                          <h4 className="font-medium text-gray-900">Powiadomienia SMS</h4>
                          <p className="text-sm text-gray-600">Ważne informacje przez SMS</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Security */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Bezpieczeństwo</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">Zmień hasło</h4>
                        <p className="text-sm text-gray-600">Ostatnia zmiana: nigdy</p>
                      </div>
                      <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                        Zmień hasło
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">Usuń konto</h4>
                        <p className="text-sm text-gray-600">Trwale usuń swoje konto i wszystkie dane</p>
                      </div>
                      <button className="text-red-600 hover:text-red-700 font-medium text-sm">
                        Usuń konto
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}