'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { AuthService } from '@/lib/auth'
import { User, UserProfile, Address } from '@/lib/firestore-types'
import { useToast } from '@/contexts/ToastContext'
import AddressManager from '@/components/AddressManager'
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
  Truck,
  Save,
  Phone,
  Cake,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

export default function UserAccountPage() {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [isSaving, setIsSaving] = useState(false)
  
  // Form states
  const [profileFormData, setProfileFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    gender: '' as 'male' | 'female' | 'other' | 'prefer_not_to_say' | ''
  })
  
  const [preferencesFormData, setPreferencesFormData] = useState({
    newsletter: false,
    smsNotifications: false,
    emailNotifications: true,
    orderNotifications: true,
    marketingEmails: false
  })

  const [profileFormErrors, setProfileFormErrors] = useState<Record<string, string>>({})
  const router = useRouter()
  const { showSuccess, showError } = useToast()

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

        // Pobierz profil użytkownika
        const profileData = await AuthService.getUserProfile(firebaseUser.uid)
        if (profileData) {
          setUserProfile(profileData)
          setProfileFormData({
            firstName: profileData.firstName || '',
            lastName: profileData.lastName || '',
            phone: profileData.phone || '',
            dateOfBirth: profileData.dateOfBirth || '',
            gender: profileData.gender || ''
          })
          setPreferencesFormData({
            newsletter: profileData.preferences.newsletter,
            smsNotifications: profileData.preferences.smsNotifications,
            emailNotifications: profileData.preferences.emailNotifications,
            orderNotifications: profileData.preferences.orderNotifications ?? true,
            marketingEmails: profileData.preferences.marketingEmails ?? false
          })
        }

        // Pobierz adresy
        const userAddresses = await AuthService.getUserAddresses(firebaseUser.uid)
        setAddresses(userAddresses)

      } catch (error) {
        console.error('Error loading user data:', error)
        showError('Błąd', 'Nie udało się wczytać danych użytkownika')
        router.push('/logowanie')
      } finally {
        setIsLoading(false)
      }
    })

    return () => unsubscribe()
  }, [router, showError])

  const handleLogout = async () => {
    try {
      await AuthService.logoutUser()
      router.push('/')
    } catch (error) {
      console.error('Error logging out:', error)
      showError('Błąd', 'Nie udało się wylogować')
    }
  }

  const validateProfileForm = () => {
    const errors: Record<string, string> = {}

    if (!profileFormData.firstName.trim()) {
      errors.firstName = 'Imię jest wymagane'
    }

    if (!profileFormData.lastName.trim()) {
      errors.lastName = 'Nazwisko jest wymagane'
    }

    if (profileFormData.phone && !/^[\+]?[\d\s\-\(\)]{9,}$/.test(profileFormData.phone)) {
      errors.phone = 'Nieprawidłowy format numeru telefonu'
    }

    if (profileFormData.dateOfBirth) {
      const birthDate = new Date(profileFormData.dateOfBirth)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      
      if (birthDate > today) {
        errors.dateOfBirth = 'Data urodzenia nie może być w przyszłości'
      } else if (age > 150) {
        errors.dateOfBirth = 'Nieprawidłowa data urodzenia'
      }
    }

    setProfileFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateProfileForm() || !user) return

    setIsSaving(true)
    try {
      const updates = {
        firstName: profileFormData.firstName.trim(),
        lastName: profileFormData.lastName.trim(),
        phone: profileFormData.phone.trim() || undefined,
        dateOfBirth: profileFormData.dateOfBirth || undefined,
        gender: profileFormData.gender || undefined
      }

      await AuthService.updateUserProfile(user.uid, updates)
      
      // Odśwież dane
      const updatedProfile = await AuthService.getUserProfile(user.uid)
      if (updatedProfile) {
        setUserProfile(updatedProfile)
      }

      const updatedUser = await AuthService.getUserData(user.uid)
      if (updatedUser) {
        setUser(updatedUser)
      }

      showSuccess('Sukces', 'Profil został zaktualizowany')
    } catch (error: any) {
      console.error('Error updating profile:', error)
      showError('Błąd', error.message || 'Nie udało się zaktualizować profilu')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSavePreferences = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      await AuthService.updateUserPreferences(user.uid, preferencesFormData)
      
      // Odśwież dane profilu
      const updatedProfile = await AuthService.getUserProfile(user.uid)
      if (updatedProfile) {
        setUserProfile(updatedProfile)
      }

      showSuccess('Sukces', 'Preferencje zostały zaktualizowane')
    } catch (error: any) {
      console.error('Error updating preferences:', error)
      showError('Błąd', error.message || 'Nie udało się zaktualizować preferencji')
    } finally {
      setIsSaving(false)
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

  const getGenderLabel = (gender?: string) => {
    switch (gender) {
      case 'male': return 'Mężczyzna'
      case 'female': return 'Kobieta'
      case 'other': return 'Inna'
      case 'prefer_not_to_say': return 'Wolę nie podawać'
      default: return 'Nie podano'
    }
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
                        <p className="text-2xl font-bold text-gray-900">
                          {userProfile?.totalOrders || 0}
                        </p>
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
                        <p className="text-2xl font-bold text-gray-900">
                          {(userProfile?.totalSpent || 0).toFixed(2)} zł
                        </p>
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
                          <p className="text-gray-900">
                            {userProfile?.firstName && userProfile?.lastName
                              ? `${userProfile.firstName} ${userProfile.lastName}`
                              : user.displayName || 'Nie podano'
                            }
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">Email</p>
                          <p className="text-gray-900">{user.email}</p>
                        </div>
                      </div>

                      {userProfile?.phone && (
                        <div className="flex items-start space-x-3">
                          <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-600">Telefon</p>
                            <p className="text-gray-900">{userProfile.phone}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">Członek od</p>
                          <p className="text-gray-900">{formatDate(user.createdAt)}</p>
                        </div>
                      </div>

                      {userProfile?.dateOfBirth && (
                        <div className="flex items-start space-x-3">
                          <Cake className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-600">Data urodzenia</p>
                            <p className="text-gray-900">
                              {new Date(userProfile.dateOfBirth).toLocaleDateString('pl-PL')}
                            </p>
                          </div>
                        </div>
                      )}

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
                        <h4 className="font-medium text-gray-900">Zarządzaj adresami</h4>
                        <p className="text-sm text-gray-600">
                          Masz {addresses.length} {addresses.length === 1 ? 'adres' : 'adresów'}
                        </p>
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
                <AddressManager
                  userId={user.uid}
                  initialAddresses={addresses}
                  onAddressChange={setAddresses}
                />
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                {/* Personal Information */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Dane osobowe</h3>
                  
                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                          Imię *
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          value={profileFormData.firstName}
                          onChange={(e) => setProfileFormData({ 
                            ...profileFormData, 
                            firstName: e.target.value 
                          })}
                          className={`input-field ${profileFormErrors.firstName ? 'border-red-300' : ''}`}
                          placeholder="Jan"
                        />
                        {profileFormErrors.firstName && (
                          <p className="text-red-600 text-sm mt-1">{profileFormErrors.firstName}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                          Nazwisko *
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          value={profileFormData.lastName}
                          onChange={(e) => setProfileFormData({ 
                            ...profileFormData, 
                            lastName: e.target.value 
                          })}
                          className={`input-field ${profileFormErrors.lastName ? 'border-red-300' : ''}`}
                          placeholder="Kowalski"
                        />
                        {profileFormErrors.lastName && (
                          <p className="text-red-600 text-sm mt-1">{profileFormErrors.lastName}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                          Telefon
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          value={profileFormData.phone}
                          onChange={(e) => setProfileFormData({ 
                            ...profileFormData, 
                            phone: e.target.value 
                          })}
                          className={`input-field ${profileFormErrors.phone ? 'border-red-300' : ''}`}
                          placeholder="+48 123 456 789"
                        />
                        {profileFormErrors.phone && (
                          <p className="text-red-600 text-sm mt-1">{profileFormErrors.phone}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                          Data urodzenia
                        </label>
                        <input
                          type="date"
                          id="dateOfBirth"
                          value={profileFormData.dateOfBirth}
                          onChange={(e) => setProfileFormData({ 
                            ...profileFormData, 
                            dateOfBirth: e.target.value 
                          })}
                          className={`input-field ${profileFormErrors.dateOfBirth ? 'border-red-300' : ''}`}
                        />
                        {profileFormErrors.dateOfBirth && (
                          <p className="text-red-600 text-sm mt-1">{profileFormErrors.dateOfBirth}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                          Płeć
                        </label>
                        <select
                          id="gender"
                          value={profileFormData.gender}
                          onChange={(e) => setProfileFormData({ 
                            ...profileFormData, 
                            gender: e.target.value as any 
                          })}
                          className="input-field"
                        >
                          <option value="">Wybierz płeć</option>
                          <option value="male">Mężczyzna</option>
                          <option value="female">Kobieta</option>
                          <option value="other">Inna</option>
                          <option value="prefer_not_to_say">Wolę nie podawać</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          value={user.email}
                          className="input-field bg-gray-50"
                          disabled
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Email nie może być zmieniony
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button 
                        type="submit" 
                        disabled={isSaving}
                        className="btn-primary flex items-center space-x-2"
                      >
                        {isSaving ? (
                          <>
                            <div className="loading-spinner"></div>
                            <span>Zapisywanie...</span>
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            <span>Zapisz zmiany</span>
                          </>
                        )}
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
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={preferencesFormData.newsletter}
                          onChange={(e) => setPreferencesFormData({
                            ...preferencesFormData,
                            newsletter: e.target.checked
                          })}
                        />
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
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={preferencesFormData.orderNotifications}
                          onChange={(e) => setPreferencesFormData({
                            ...preferencesFormData,
                            orderNotifications: e.target.checked
                          })}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-gray-400" />
                        <div>
                          <h4 className="font-medium text-gray-900">Powiadomienia email</h4>
                          <p className="text-sm text-gray-600">Ważne informacje przez email</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={preferencesFormData.emailNotifications}
                          onChange={(e) => setPreferencesFormData({
                            ...preferencesFormData,
                            emailNotifications: e.target.checked
                          })}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-gray-400" />
                        <div>
                          <h4 className="font-medium text-gray-900">Powiadomienia SMS</h4>
                          <p className="text-sm text-gray-600">Ważne informacje przez SMS</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={preferencesFormData.smsNotifications}
                          onChange={(e) => setPreferencesFormData({
                            ...preferencesFormData,
                            smsNotifications: e.target.checked
                          })}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-gray-400" />
                        <div>
                          <h4 className="font-medium text-gray-900">Materiały marketingowe</h4>
                          <p className="text-sm text-gray-600">Promocje, konkursy i oferty specjalne</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={preferencesFormData.marketingEmails}
                          onChange={(e) => setPreferencesFormData({
                            ...preferencesFormData,
                            marketingEmails: e.target.checked
                          })}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <button 
                      type="button"
                      onClick={handleSavePreferences}
                      disabled={isSaving}
                      className="btn-primary flex items-center space-x-2"
                    >
                      {isSaving ? (
                        <>
                          <div className="loading-spinner"></div>
                          <span>Zapisywanie...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          <span>Zapisz preferencje</span>
                        </>
                      )}
                    </button>
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
                      <Link 
                        href="/resetowanie-hasla"
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        Zmień hasło
                      </Link>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                      <div>
                        <h4 className="font-medium text-gray-900 flex items-center">
                          <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
                          Usuń konto
                        </h4>
                        <p className="text-sm text-gray-600">Trwale usuń swoje konto i wszystkie dane</p>
                      </div>
                      <button 
                        className="text-red-600 hover:text-red-700 font-medium text-sm"
                        onClick={() => {
                          // TODO: Implementacja usuwania konta
                          alert('Ta funkcja będzie dostępna wkrótce')
                        }}
                      >
                        Usuń konto
                      </button>
                    </div>
                  </div>
                </div>

                {/* Account Status */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Status konta</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                      <div>
                        <h4 className="font-medium text-green-900">Konto zweryfikowane</h4>
                        <p className="text-sm text-green-700">
                          Twój adres email został potwierdzony
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <strong>ID konta:</strong> {user.uid.slice(0, 8)}...
                      </div>
                      <div>
                        <strong>Utworzono:</strong> {formatDate(user.createdAt)}
                      </div>
                      <div>
                        <strong>Ostatnia aktualizacja:</strong> {formatDate(user.updatedAt)}
                      </div>
                      <div>
                        <strong>Typ konta:</strong> {user.role === 'customer' ? 'Klient' : 'Administrator'}
                      </div>
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