'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { AuthService } from '@/lib/auth'
import { User, UserProfile, Address } from '@/lib/firestore-types'
import { useToast } from '@/contexts/ToastContext'
import { useConfirmation } from '@/hooks/useConfirmation'
import ConfirmationModal from '@/components/ConfirmationModal'
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Calendar,
  Shield,
  MapPin,
  ToggleLeft,
  ToggleRight,
  ArrowLeft,
  LogOut,
  Edit,
  Trash2,
  Plus,
  Home,
  Building,
  CreditCard
} from 'lucide-react'

export default function UserDetailsPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'activity'>('profile')
  
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string
  
  const { showSuccess, showError, showWarning, showInfo } = useToast()
  const { confirmation, confirm, closeConfirmation } = useConfirmation()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/admin/login')
        return
      }

      const adminStatus = await AuthService.isAdmin(currentUser.uid)
      if (!adminStatus) {
        router.push('/admin/login')
        return
      }

      setIsAdmin(true)
      await loadUserData()
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [router, userId])

  const loadUserData = async () => {
    try {
      // Load user data
      const userData = await AuthService.getUserData(userId)
      if (!userData) {
        showError('Błąd', 'Nie znaleziono użytkownika')
        router.push('/admin/users')
        return
      }
      setUser(userData)

      // Load user profile
      const userProfile = await AuthService.getUserProfile(userId)
      setProfile(userProfile)

      // Load user addresses
      const userAddresses = await AuthService.getUserAddresses(userId)
      setAddresses(userAddresses)
    } catch (error) {
      console.error('Error loading user data:', error)
      showError('Błąd ładowania', 'Nie udało się załadować danych użytkownika')
    }
  }

  const handleToggleUserStatus = async () => {
    if (!user) return

    const confirmed = await confirm({
      title: user.isActive !== false ? 'Dezaktywuj użytkownika' : 'Aktywuj użytkownika',
      message: user.isActive !== false 
        ? 'Czy na pewno chcesz dezaktywować tego użytkownika? Nie będzie mógł się zalogować.'
        : 'Czy na pewno chcesz aktywować tego użytkownika?',
      confirmText: user.isActive !== false ? 'Dezaktywuj' : 'Aktywuj',
      cancelText: 'Anuluj',
      type: user.isActive !== false ? 'warning' : 'info'
    })
    
    if (!confirmed) return

    try {
      await AuthService.toggleUserStatus(user.uid, !(user.isActive !== false))
      setUser(prev => prev ? { ...prev, isActive: !(prev.isActive !== false) } : null)
      showSuccess(
        'Status zaktualizowany', 
        `Użytkownik został ${user.isActive === false ? 'aktywowany' : 'dezaktywowany'}`
      )
    } catch (error) {
      console.error('Error toggling user status:', error)
      showError('Błąd aktualizacji', 'Nie udało się zmienić statusu użytkownika')
    }
  }

  const handleDeleteAddress = async (addressId: string) => {
    const confirmed = await confirm({
      title: 'Usuń adres',
      message: 'Czy na pewno chcesz usunąć ten adres?',
      confirmText: 'Usuń',
      cancelText: 'Anuluj',
      type: 'danger'
    })
    
    if (!confirmed) return

    try {
      await AuthService.deleteUserAddress(addressId)
      setAddresses(prev => prev.filter(addr => addr.id !== addressId))
      showSuccess('Adres usunięty', 'Adres został pomyślnie usunięty')
    } catch (error) {
      console.error('Error deleting address:', error)
      showError('Błąd usuwania', 'Nie udało się usunąć adresu')
    }
  }

  const handleLogout = async () => {
    try {
      await AuthService.logoutUser()
      router.push('/admin/login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Nieznana data'
    const date = new Date(timestamp.seconds * 1000)
    return date.toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatAddressType = (type: string) => {
    switch (type) {
      case 'shipping': return 'Dostawa'
      case 'billing': return 'Faktura'
      case 'both': return 'Dostawa i faktura'
      default: return type
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-600">Ładowanie danych użytkownika...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin || !user) {
    return null // Redirect handled in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/users"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Powrót do listy</span>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {user.displayName || `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || 'Użytkownik'}
                </h1>
                <p className="text-gray-600">Szczegóły konta użytkownika</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Zobacz stronę
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
              >
                <LogOut className="h-4 w-4" />
                <span>Wyloguj</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Header Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className={`h-20 w-20 rounded-full flex items-center justify-center ${
                user.role === 'admin' 
                  ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
                  : 'bg-gradient-to-br from-pink-400 to-purple-500'
              }`}>
                {user.role === 'admin' ? (
                  <Shield className="h-10 w-10 text-white" />
                ) : (
                  <UserIcon className="h-10 w-10 text-white" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {user.displayName || `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || 'Brak nazwy'}
                </h2>
                <p className="text-gray-600">{user.email}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
                    user.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role === 'admin' ? 'Administrator' : 'Klient'}
                  </span>
                  <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
                    user.isActive !== false 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.isActive !== false ? 'Aktywny' : 'Nieaktywny'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleToggleUserStatus}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  user.isActive !== false 
                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                }`}
              >
                {user.isActive !== false ? (
                  <ToggleLeft className="h-4 w-4" />
                ) : (
                  <ToggleRight className="h-4 w-4" />
                )}
                <span>{user.isActive !== false ? 'Dezaktywuj' : 'Aktywuj'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Profil
              </button>
              <button
                onClick={() => setActiveTab('addresses')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'addresses'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Adresy ({addresses.length})
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'activity'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Aktywność
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Podstawowe informacje</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Email:</span>
                        <span className="text-sm font-medium">{user.email}</span>
                      </div>
                      {profile?.phone && (
                        <div className="flex items-center space-x-3">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Telefon:</span>
                          <span className="text-sm font-medium">{profile.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Data rejestracji:</span>
                        <span className="text-sm font-medium">{formatDate(user.createdAt)}</span>
                      </div>
                      {profile?.dateOfBirth && (
                        <div className="flex items-center space-x-3">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Data urodzenia:</span>
                          <span className="text-sm font-medium">{profile.dateOfBirth}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Personal Details */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Dane osobowe</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-600">Imię:</span>
                        <p className="text-sm font-medium">{profile?.firstName || 'Nie podano'}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Nazwisko:</span>
                        <p className="text-sm font-medium">{profile?.lastName || 'Nie podano'}</p>
                      </div>
                      {profile?.gender && (
                        <div>
                          <span className="text-sm text-gray-600">Płeć:</span>
                          <p className="text-sm font-medium">
                            {profile.gender === 'male' ? 'Mężczyzna' : 
                             profile.gender === 'female' ? 'Kobieta' : 
                             profile.gender === 'other' ? 'Inna' : 'Nie chcę podawać'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Preferences */}
                {profile?.preferences && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Preferencje</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Newsletter</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            profile.preferences.newsletter ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {profile.preferences.newsletter ? 'Tak' : 'Nie'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Powiadomienia email</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            profile.preferences.emailNotifications ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {profile.preferences.emailNotifications ? 'Tak' : 'Nie'}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Powiadomienia SMS</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            profile.preferences.smsNotifications ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {profile.preferences.smsNotifications ? 'Tak' : 'Nie'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Powiadomienia o zamówieniach</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            profile.preferences.orderNotifications ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {profile.preferences.orderNotifications ? 'Tak' : 'Nie'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Statistics */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Statystyki</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">{profile?.totalOrders || 0}</div>
                      <div className="text-sm text-gray-600">Zamówienia</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">{(profile?.totalSpent || 0).toFixed(2)} zł</div>
                      <div className="text-sm text-gray-600">Wydane łącznie</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">
                        {profile?.lastOrderDate ? formatDate(profile.lastOrderDate) : 'Brak'}
                      </div>
                      <div className="text-sm text-gray-600">Ostatnie zamówienie</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Adresy użytkownika</h3>
                  <button className="btn-primary flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Dodaj adres</span>
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <div className="text-center py-12">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Brak adresów</h4>
                    <p className="text-gray-600">Ten użytkownik nie ma jeszcze dodanych adresów.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map((address) => (
                      <div key={address.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            {address.type === 'shipping' ? (
                              <Home className="h-4 w-4 text-blue-600" />
                            ) : address.type === 'billing' ? (
                              <CreditCard className="h-4 w-4 text-green-600" />
                            ) : (
                              <Building className="h-4 w-4 text-purple-600" />
                            )}
                            <span className="font-medium text-gray-900">
                              {address.label || formatAddressType(address.type)}
                            </span>
                            {address.isDefault && (
                              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                Domyślny
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteAddress(address.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>{address.firstName} {address.lastName}</p>
                          <p>{address.street} {address.houseNumber}{address.apartmentNumber && `/${address.apartmentNumber}`}</p>
                          <p>{address.postalCode} {address.city}</p>
                          {address.state && <p>{address.state}</p>}
                          <p>{address.country}</p>
                          {address.phone && (
                            <p className="flex items-center space-x-1">
                              <Phone className="h-3 w-3" />
                              <span>{address.phone}</span>
                            </p>
                          )}
                          {address.deliveryInstructions && (
                            <p className="mt-2 text-xs bg-gray-50 p-2 rounded">
                              <strong>Instrukcje:</strong> {address.deliveryInstructions}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Aktywność użytkownika</h3>
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Brak danych o aktywności</h4>
                  <p className="text-gray-600">System śledzenia aktywności nie jest jeszcze zaimplementowany.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmation && (
        <ConfirmationModal
          isOpen={confirmation.isOpen}
          onClose={confirmation.onCancel}
          onConfirm={confirmation.onConfirm}
          title={confirmation.title}
          message={confirmation.message}
          confirmText={confirmation.confirmText}
          cancelText={confirmation.cancelText}
          type={confirmation.type}
          isLoading={confirmation.isLoading}
        />
      )}
    </div>
  )
}
