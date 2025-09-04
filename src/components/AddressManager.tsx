'use client'

import { useState, useEffect } from 'react'
import { AuthService } from '@/lib/auth'
import { Address } from '@/lib/firestore-types'
import { useToast } from '@/contexts/ToastContext'
import { useConfirmation } from '@/hooks/useConfirmation'
import ConfirmationModal from '@/components/ConfirmationModal'
import {
  MapPin,
  Plus,
  Edit,
  Trash2,
  Star,
  StarOff,
  Home,
  Building,
  Phone,
  User,
  Mail,
  CheckCircle,
  X
} from 'lucide-react'

interface AddressManagerProps {
  userId: string
  initialAddresses?: Address[]
  onAddressChange?: (addresses: Address[]) => void
}

interface AddressFormData {
  type: 'shipping' | 'billing' | 'both'
  isDefault: boolean
  firstName: string
  lastName: string
  company: string
  street: string
  houseNumber: string
  apartmentNumber: string
  postalCode: string
  city: string
  state: string
  country: string
  phone: string
  email: string
  deliveryInstructions: string
  label: string
}

const initialFormData: AddressFormData = {
  type: 'both',
  isDefault: false,
  firstName: '',
  lastName: '',
  company: '',
  street: '',
  houseNumber: '',
  apartmentNumber: '',
  postalCode: '',
  city: '',
  state: '',
  country: 'Polska',
  phone: '',
  email: '',
  deliveryInstructions: '',
  label: ''
}

const addressLabels = [
  { value: '', label: 'Bez etykiety' },
  { value: 'Dom', label: '🏠 Dom' },
  { value: 'Praca', label: '🏢 Praca' },
  { value: 'Rodzice', label: '👨‍👩‍👧‍👦 Rodzice' },
  { value: 'Inne', label: '📍 Inne' }
]

const polishStates = [
  'dolnośląskie', 'kujawsko-pomorskie', 'lubelskie', 'lubuskie',
  'łódzkie', 'małopolskie', 'mazowieckie', 'opolskie',
  'podkarpackie', 'podlaskie', 'pomorskie', 'śląskie',
  'świętokrzyskie', 'warmińsko-mazurskie', 'wielkopolskie', 'zachodniopomorskie'
]

export default function AddressManager({ 
  userId, 
  initialAddresses = [], 
  onAddressChange 
}: AddressManagerProps) {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses)
  const [isLoading, setIsLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [formData, setFormData] = useState<AddressFormData>(initialFormData)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)

  const { showSuccess, showError } = useToast()
  const { confirmation, confirm, closeConfirmation } = useConfirmation()

  // Wczytaj adresy przy pierwszym renderowaniu
  useEffect(() => {
    if (initialAddresses.length === 0) {
      loadAddresses()
    }
  }, [userId])

  // Powiadom o zmianach
  useEffect(() => {
    onAddressChange?.(addresses)
  }, [addresses, onAddressChange])

  const loadAddresses = async () => {
    setIsLoading(true)
    try {
      const userAddresses = await AuthService.getUserAddresses(userId)
      setAddresses(userAddresses)
    } catch (error) {
      console.error('Error loading addresses:', error)
      showError('Błąd', 'Nie udało się wczytać adresów')
    } finally {
      setIsLoading(false)
    }
  }

  const handleShowAddForm = () => {
    setEditingAddress(null)
    setFormData(initialFormData)
    setFormErrors({})
    setShowForm(true)
  }

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address)
    setFormData({
      type: address.type,
      isDefault: address.isDefault,
      firstName: address.firstName,
      lastName: address.lastName,
      company: address.company || '',
      street: address.street,
      houseNumber: address.houseNumber,
      apartmentNumber: address.apartmentNumber || '',
      postalCode: address.postalCode,
      city: address.city,
      state: address.state || '',
      country: address.country,
      phone: address.phone || '',
      email: address.email || '',
      deliveryInstructions: address.deliveryInstructions || '',
      label: address.label || ''
    })
    setFormErrors({})
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingAddress(null)
    setFormData(initialFormData)
    setFormErrors({})
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    // Wymagane pola
    if (!formData.firstName.trim()) errors.firstName = 'Imię jest wymagane'
    if (!formData.lastName.trim()) errors.lastName = 'Nazwisko jest wymagane'
    if (!formData.street.trim()) errors.street = 'Ulica jest wymagana'
    if (!formData.houseNumber.trim()) errors.houseNumber = 'Numer domu jest wymagany'
    if (!formData.postalCode.trim()) errors.postalCode = 'Kod pocztowy jest wymagany'
    if (!formData.city.trim()) errors.city = 'Miasto jest wymagane'
    if (!formData.country.trim()) errors.country = 'Kraj jest wymagany'

    // Walidacja kodu pocztowego (polski format)
    if (formData.postalCode && formData.country === 'Polska') {
      const postalCodeRegex = /^\d{2}-\d{3}$/
      if (!postalCodeRegex.test(formData.postalCode)) {
        errors.postalCode = 'Kod pocztowy musi być w formacie XX-XXX'
      }
    }

    // Walidacja telefonu (opcjonalnie)
    if (formData.phone && !/^[\+]?[\d\s\-\(\)]{9,}$/.test(formData.phone)) {
      errors.phone = 'Nieprawidłowy format numeru telefonu'
    }

    // Walidacja email (opcjonalnie)
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Nieprawidłowy format email'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Funkcja pomocnicza do tworzenia czystego obiektu bez pustych stringów
  const createCleanAddressData = () => {
    const baseData = {
      userId,
      type: formData.type,
      isDefault: formData.isDefault,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      street: formData.street.trim(),
      houseNumber: formData.houseNumber.trim(),
      postalCode: formData.postalCode.trim(),
      city: formData.city.trim(),
      country: formData.country.trim()
    }

    // Dodaj opcjonalne pola tylko jeśli nie są puste
    const optionalFields: Partial<Address> = {}
    
    if (formData.company.trim()) {
      optionalFields.company = formData.company.trim()
    }
    
    if (formData.apartmentNumber.trim()) {
      optionalFields.apartmentNumber = formData.apartmentNumber.trim()
    }
    
    if (formData.state.trim()) {
      optionalFields.state = formData.state.trim()
    }
    
    if (formData.phone.trim()) {
      optionalFields.phone = formData.phone.trim()
    }
    
    if (formData.email.trim()) {
      optionalFields.email = formData.email.trim()
    }
    
    if (formData.deliveryInstructions.trim()) {
      optionalFields.deliveryInstructions = formData.deliveryInstructions.trim()
    }
    
    if (formData.label.trim()) {
      optionalFields.label = formData.label.trim()
    }

    return { ...baseData, ...optionalFields }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSaving(true)
    try {
      // Utwórz czysty obiekt bez pustych stringów
      const addressData = createCleanAddressData()

      if (editingAddress) {
        // Aktualizuj istniejący adres
        await AuthService.updateUserAddress(editingAddress.id, addressData)
        showSuccess('Sukces', 'Adres został zaktualizowany')
      } else {
        // Dodaj nowy adres
        await AuthService.addUserAddress(addressData)
        showSuccess('Sukces', 'Nowy adres został dodany')
      }

      // Odśwież listę adresów
      await loadAddresses()
      handleCloseForm()
    } catch (error: any) {
      console.error('Error saving address:', error)
      showError('Błąd', error.message || 'Nie udało się zapisać adresu')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAddress = async (address: Address) => {
    const confirmed = await confirm({
      title: 'Usuń adres',
      message: `Czy na pewno chcesz usunąć adres "${address.label || `${address.street} ${address.houseNumber}`}"?`,
      confirmText: 'Usuń',
      type: 'danger'
    })

    if (confirmed) {
      try {
        await AuthService.deleteUserAddress(address.id)
        showSuccess('Sukces', 'Adres został usunięty')
        await loadAddresses()
      } catch (error: any) {
        console.error('Error deleting address:', error)
        showError('Błąd', error.message || 'Nie udało się usunąć adresu')
      }
    }
  }

  const handleSetDefault = async (address: Address) => {
    try {
      await AuthService.setDefaultAddress(address.id, userId, address.type === 'both' ? 'shipping' : address.type)
      showSuccess('Sukces', 'Ustawiono jako domyślny adres')
      await loadAddresses()
    } catch (error: any) {
      console.error('Error setting default address:', error)
      showError('Błąd', error.message || 'Nie udało się ustawić domyślnego adresu')
    }
  }

  const getAddressTypeLabel = (type: Address['type']) => {
    switch (type) {
      case 'shipping': return '📦 Dostawa'
      case 'billing': return '🧾 Płatności'
      case 'both': return '📦🧾 Uniwersalny'
      default: return type
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="loading-spinner w-6 h-6 mr-2"></div>
        <span className="text-gray-600">Ładowanie adresów...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Twoje adresy</h3>
        <button
          onClick={handleShowAddForm}
          className="btn-primary text-sm flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Dodaj adres</span>
        </button>
      </div>

      {/* Lista adresów */}
      {addresses.length === 0 ? (
        <div className="text-center py-8 border border-gray-200 rounded-lg bg-gray-50">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="font-medium text-gray-900 mb-2">Brak zapisanych adresów</h4>
          <p className="text-gray-600 mb-4">
            Dodaj swój pierwszy adres, aby przyspieszyć składanie zamówień
          </p>
          <button
            onClick={handleShowAddForm}
            className="btn-primary"
          >
            Dodaj pierwszy adres
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`border rounded-lg p-4 relative ${
                address.isDefault
                  ? 'border-blue-200 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Badges */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                    {getAddressTypeLabel(address.type)}
                  </span>
                  {address.isDefault && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center space-x-1">
                      <Star className="h-3 w-3 fill-current" />
                      <span>Domyślny</span>
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-1">
                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefault(address)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Ustaw jako domyślny"
                    >
                      <StarOff className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleEditAddress(address)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Edytuj adres"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteAddress(address)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Usuń adres"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Adres */}
              <div className="space-y-1">
                <div className="flex items-start space-x-2">
                  <User className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {address.firstName} {address.lastName}
                    </p>
                    {address.company && (
                      <p className="text-sm text-gray-600">{address.company}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-gray-700">
                    <p>{address.street} {address.houseNumber}{address.apartmentNumber && `/${address.apartmentNumber}`}</p>
                    <p>{address.postalCode} {address.city}</p>
                    {address.state && <p>{address.state}</p>}
                    <p>{address.country}</p>
                  </div>
                </div>

                {address.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{address.phone}</span>
                  </div>
                )}

                {address.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{address.email}</span>
                  </div>
                )}

                {address.deliveryInstructions && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                    <p className="text-yellow-800">{address.deliveryInstructions}</p>
                  </div>
                )}
              </div>

              {address.label && (
                <div className="absolute top-2 right-2">
                  <span className="text-xs text-gray-500 bg-white px-1 rounded">
                    {address.label}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Formularz dodawania/edycji adresu */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingAddress ? 'Edytuj adres' : 'Dodaj nowy adres'}
                </h3>
                <button
                  onClick={handleCloseForm}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={isSaving}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Typ adresu */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Typ adresu
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'shipping', label: '📦 Dostawa', desc: 'Tylko do wysyłki' },
                      { value: 'billing', label: '🧾 Płatności', desc: 'Tylko do faktur' },
                      { value: 'both', label: '📦🧾 Uniwersalny', desc: 'Dostawa i płatności' }
                    ].map((type) => (
                      <label
                        key={type.value}
                        className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                          formData.type === type.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="type"
                          value={type.value}
                          checked={formData.type === type.value}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                          className="sr-only"
                        />
                        <div className="text-center">
                          <div className="font-medium text-sm">{type.label}</div>
                          <div className="text-xs text-gray-500 mt-1">{type.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Etykieta i domyślny */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="label" className="block text-sm font-medium text-gray-700 mb-1">
                      Etykieta adresu
                    </label>
                    <select
                      id="label"
                      value={formData.label}
                      onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                      className="input-field"
                    >
                      {addressLabels.map((label) => (
                        <option key={label.value} value={label.value}>
                          {label.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.isDefault}
                        onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Ustaw jako domyślny</span>
                    </label>
                  </div>
                </div>

                {/* Dane osobowe */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      Imię *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className={`input-field ${formErrors.firstName ? 'border-red-300' : ''}`}
                      placeholder="Jan"
                    />
                    {formErrors.firstName && <p className="text-red-600 text-sm mt-1">{formErrors.firstName}</p>}
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Nazwisko *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className={`input-field ${formErrors.lastName ? 'border-red-300' : ''}`}
                      placeholder="Kowalski"
                    />
                    {formErrors.lastName && <p className="text-red-600 text-sm mt-1">{formErrors.lastName}</p>}
                  </div>
                </div>

                {/* Firma */}
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                    Firma (opcjonalnie)
                  </label>
                  <input
                    type="text"
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="input-field"
                    placeholder="Nazwa firmy"
                  />
                </div>

                {/* Adres */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
                      Ulica *
                    </label>
                    <input
                      type="text"
                      id="street"
                      value={formData.street}
                      onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                      className={`input-field ${formErrors.street ? 'border-red-300' : ''}`}
                      placeholder="ul. Przykładowa"
                    />
                    {formErrors.street && <p className="text-red-600 text-sm mt-1">{formErrors.street}</p>}
                  </div>

                  <div>
                    <label htmlFor="houseNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Nr domu *
                    </label>
                    <input
                      type="text"
                      id="houseNumber"
                      value={formData.houseNumber}
                      onChange={(e) => setFormData({ ...formData, houseNumber: e.target.value })}
                      className={`input-field ${formErrors.houseNumber ? 'border-red-300' : ''}`}
                      placeholder="123"
                    />
                    {formErrors.houseNumber && <p className="text-red-600 text-sm mt-1">{formErrors.houseNumber}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="apartmentNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Nr mieszkania
                    </label>
                    <input
                      type="text"
                      id="apartmentNumber"
                      value={formData.apartmentNumber}
                      onChange={(e) => setFormData({ ...formData, apartmentNumber: e.target.value })}
                      className="input-field"
                      placeholder="45"
                    />
                  </div>

                  <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                      Kod pocztowy *
                    </label>
                    <input
                      type="text"
                      id="postalCode"
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      className={`input-field ${formErrors.postalCode ? 'border-red-300' : ''}`}
                      placeholder="00-000"
                    />
                    {formErrors.postalCode && <p className="text-red-600 text-sm mt-1">{formErrors.postalCode}</p>}
                  </div>

                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      Miasto *
                    </label>
                    <input
                      type="text"
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className={`input-field ${formErrors.city ? 'border-red-300' : ''}`}
                      placeholder="Warszawa"
                    />
                    {formErrors.city && <p className="text-red-600 text-sm mt-1">{formErrors.city}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                      Województwo
                    </label>
                    <select
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="input-field"
                    >
                      <option value="">Wybierz województwo</option>
                      {polishStates.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                      Kraj *
                    </label>
                    <select
                      id="country"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className={`input-field ${formErrors.country ? 'border-red-300' : ''}`}
                    >
                      <option value="Polska">Polska</option>
                      <option value="Czechy">Czechy</option>
                      <option value="Słowacja">Słowacja</option>
                      <option value="Niemcy">Niemcy</option>
                      <option value="Austria">Austria</option>
                    </select>
                    {formErrors.country && <p className="text-red-600 text-sm mt-1">{formErrors.country}</p>}
                  </div>
                </div>

                {/* Kontakt */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={`input-field ${formErrors.phone ? 'border-red-300' : ''}`}
                      placeholder="+48 123 456 789"
                    />
                    {formErrors.phone && <p className="text-red-600 text-sm mt-1">{formErrors.phone}</p>}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email dodatkowy
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`input-field ${formErrors.email ? 'border-red-300' : ''}`}
                      placeholder="adres@email.com"
                    />
                    {formErrors.email && <p className="text-red-600 text-sm mt-1">{formErrors.email}</p>}
                  </div>
                </div>

                {/* Instrukcje dostawy */}
                <div>
                  <label htmlFor="deliveryInstructions" className="block text-sm font-medium text-gray-700 mb-1">
                    Instrukcje dostawy (opcjonalnie)
                  </label>
                  <textarea
                    id="deliveryInstructions"
                    value={formData.deliveryInstructions}
                    onChange={(e) => setFormData({ ...formData, deliveryInstructions: e.target.value })}
                    rows={3}
                    className="input-field"
                    placeholder="np. Dzwonek przy bramie, kod do bramy: 1234"
                  />
                </div>

                {/* Przyciski */}
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    disabled={isSaving}
                    className="btn-outline"
                  >
                    Anuluj
                  </button>
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
                        <CheckCircle className="h-4 w-4" />
                        <span>{editingAddress ? 'Aktualizuj' : 'Dodaj'} adres</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

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