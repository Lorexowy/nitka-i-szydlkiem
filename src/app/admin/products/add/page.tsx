'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { AuthService } from '@/lib/auth'
import { ProductService } from '@/lib/products'
import { useImageUpload } from '@/hooks/useImageUpload'
import { getCategoryOptionsGrouped, getCategoryById } from '@/lib/categories'
import { useToast } from '@/contexts/ToastContext'
import { useConfirmation } from '@/hooks/useConfirmation'
import ConfirmationModal from '@/components/ConfirmationModal'
import { 
  ArrowLeft, 
  Upload, 
  X, 
  Save,
  Eye,
  Package,
  Star,
  Info,
  Calculator,
  AlertCircle,
  DollarSign,
  TrendingUp
} from 'lucide-react'

export default function AddProductPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [showTaxInfo, setShowTaxInfo] = useState(false)
  const router = useRouter()
  const { uploadImages, isUploading, error: uploadError } = useImageUpload()
  const { showSuccess, showError, showWarning, showInfo } = useToast()
  const { confirmation, confirm, closeConfirmation } = useConfirmation()

  // Get category options grouped by category groups
  const categoryGroups = getCategoryOptionsGrouped()

  // Tax calculator state
  const [taxCalculator, setTaxCalculator] = useState({
    costsAmount: 0, // amount in PLN
    costsPercent: 30, // percentage of costs
    isPercentMode: true // true = percentage mode, false = amount mode
  })

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    longDescription: '',
    price: '',
    originalPrice: '',
    category: '',
    stockQuantity: '',
    weight: '',
    dimensions: {
      length: '',
      width: '',
      height: ''
    },
    materials: [''],
    colors: [''],
    features: [''],
    featured: false,
    inStock: true
  })

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
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  // Tax calculations
  const calculateTaxInfo = (grossPrice: number) => {
    if (!grossPrice || grossPrice <= 0) {
      return {
        netPrice: 0,
        costsAmount: 0,
        costsPercent: 0,
        income: 0,
        tax: 0,
        netIncome: 0
      }
    }

    // For unregistered activity, gross price = net price (no VAT)
    const netPrice = grossPrice
    
    // Calculate costs based on current mode
    let costsAmount = 0
    let costsPercent = 0
    
    if (taxCalculator.isPercentMode) {
      costsPercent = taxCalculator.costsPercent
      costsAmount = (netPrice * costsPercent) / 100
    } else {
      costsAmount = taxCalculator.costsAmount
      costsPercent = netPrice > 0 ? (costsAmount / netPrice) * 100 : 0
    }
    
    // Calculate income after costs
    const income = netPrice - costsAmount
    
    // Tax calculation (12% for income up to 120,000 PLN yearly)
    // For simplicity, we'll calculate tax assuming this is the only income source
    // and use the 12% rate (first tax bracket)
    const taxRate = 0.12
    
    // Annual income estimation (simplified - just this product sale)
    // We'll show tax per product for clarity
    let taxPerProduct = 0
    
    if (income > 0) {
      // Simplified calculation - assume income is within first tax bracket
      // In reality, tax is calculated on total annual income minus tax-free amount
      taxPerProduct = income * taxRate
      
      // If this would be the only income and it's below tax-free amount (30,000 PLN annually)
      // the tax would be 0, but we'll show the theoretical tax amount for transparency
    }
    
    const netIncome = income - taxPerProduct

    return {
      netPrice: netPrice,
      costsAmount: costsAmount,
      costsPercent: costsPercent,
      income: income,
      tax: taxPerProduct,
      netIncome: netIncome
    }
  }

  const taxInfo = calculateTaxInfo(parseFloat(formData.price) || 0)

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Sprawdź limit plików (max 5)
    if (selectedFiles.length + files.length > 5) {
      showWarning('Limit zdjęć', 'Możesz dodać maksymalnie 5 zdjęć')
      return
    }

    // Waliduj każdy plik
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        showError('Nieprawidłowy format', `Plik ${file.name} nie jest obrazem. Dozwolone formaty: JPEG, PNG, WebP`)
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        showError('Plik zbyt duży', `Plik ${file.name} jest zbyt duży (maksymalny rozmiar: 10MB)`)
        return
      }
    }

    // Dodaj do istniejących plików
    const newFiles = [...selectedFiles, ...files]
    setSelectedFiles(newFiles)

    // Create preview URLs for new files
    const newUrls = files.map(file => URL.createObjectURL(file))
    setPreviewUrls(prev => [...prev, ...newUrls])
  }

  // Remove selected file
  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    const newUrls = previewUrls.filter((_, i) => i !== index)
    
    // Revoke the removed URL to prevent memory leaks
    URL.revokeObjectURL(previewUrls[index])
    
    setSelectedFiles(newFiles)
    setPreviewUrls(newUrls)
    
    // Reset file input
    const fileInput = document.getElementById('images') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

  // Update form field
  const updateField = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Update array field
  const updateArrayField = (field: 'materials' | 'colors' | 'features', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }))
  }

  // Add array item
  const addArrayItem = (field: 'materials' | 'colors' | 'features') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }))
  }

  // Remove array item
  const removeArrayItem = (field: 'materials' | 'colors' | 'features', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  // Get category info for display
  const selectedCategoryInfo = formData.category ? getCategoryById(formData.category) : null

  // Handle cancel with confirmation
  const handleCancel = async () => {
    if (formData.name || selectedFiles.length > 0 || formData.description) {
      const confirmed = await confirm({
        title: 'Opuścić bez zapisywania?',
        message: 'Masz niezapisane zmiany. Czy na pewno chcesz opuścić tę stronę?',
        confirmText: 'Tak, opuść',
        cancelText: 'Zostań tutaj',
        type: 'warning'
      })

      if (confirmed) {
        router.push('/admin/dashboard')
      }
    } else {
      router.push('/admin/dashboard')
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // Walidacja
      if (!formData.name || !formData.description || !formData.price || !formData.category) {
        showError('Błąd walidacji', 'Wypełnij wszystkie wymagane pola (nazwa, opis, cena, kategoria)')
        return
      }

      const cleanMaterials = formData.materials.filter(m => m.trim())
      const cleanColors = formData.colors.filter(c => c.trim())

      if (cleanMaterials.length === 0) {
        showError('Błąd walidacji', 'Dodaj przynajmniej jeden materiał')
        return
      }

      if (cleanColors.length === 0) {
        showError('Błąd walidacji', 'Dodaj przynajmniej jeden kolor')
        return
      }

      // Walidacja numerycznych wartości
      if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
        showError('Błąd walidacji', 'Cena musi być liczbą większą od zera')
        return
      }

      if (isNaN(parseInt(formData.stockQuantity)) || parseInt(formData.stockQuantity) < 0) {
        showError('Błąd walidacji', 'Ilość w magazynie musi być liczbą nieujemną')
        return
      }

      // Create product data
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        longDescription: formData.longDescription.trim(),
        price: parseFloat(formData.price),
        // Tylko dodaj originalPrice jeśli jest wprowadzona
        ...(formData.originalPrice && { originalPrice: parseFloat(formData.originalPrice) }),
        category: formData.category,
        stockQuantity: parseInt(formData.stockQuantity),
        // Tylko dodaj weight jeśli jest wprowadzona
        ...(formData.weight && { weight: parseFloat(formData.weight) }),
        dimensions: {
          length: parseFloat(formData.dimensions.length) || 0,
          width: parseFloat(formData.dimensions.width) || 0,
          height: parseFloat(formData.dimensions.height) || 0
        },
        materials: cleanMaterials,
        colors: cleanColors,
        features: formData.features.filter(f => f.trim()),
        featured: formData.featured,
        inStock: formData.inStock && parseInt(formData.stockQuantity) > 0,
        images: [], // Będzie zaktualizowane po upload zdjęć
        createdBy: auth.currentUser?.uid || ''
      }

      // Utwórz produkt
      const productId = await ProductService.createProduct(productData)

      // Upload zdjęć jeśli są wybrane
      let imageUrls: string[] = []
      if (selectedFiles.length > 0) {
        imageUrls = await uploadImages(productId, selectedFiles)
        
        // Aktualizuj produkt z URL-ami zdjęć
        await ProductService.updateProduct(productId, {
          images: imageUrls
        })
      }

      // Pokazuj sukces
      showSuccess(
        'Produkt utworzony!', 
        `Produkt "${formData.name}" został pomyślnie dodany do sklepu${imageUrls.length > 0 ? ` z ${imageUrls.length} zdjęciem/zdjęciami` : ''}.`
      )

      // Przekieruj do widoku produktu po krótkim opóźnieniu
      setTimeout(() => {
        router.push(`/admin/products/view/${productId}`)
      }, 1500)

    } catch (error: any) {
      console.error('Error creating product:', error)
      showError(
        'Błąd podczas tworzenia produktu', 
        error.message || 'Nie udało się utworzyć produktu. Sprawdź dane i spróbuj ponownie.'
      )
    } finally {
      setIsSaving(false)
    }
  }

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <h1 className="text-2xl font-bold text-gray-900">Dodaj nowy produkt</h1>
              <p className="text-gray-600">Utwórz nowy produkt w swoim sklepie</p>
            </div>
          </div>
          <Link
            href="/admin/products"
            className="btn-outline flex items-center space-x-2"
          >
            <Eye className="h-4 w-4" />
            <span>Zobacz wszystkie</span>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Podstawowe informacje</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nazwa produktu *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="input-field"
                  placeholder="np. Szydełkowa torba na zakupy"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Kategoria *
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => updateField('category', e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="">Wybierz kategorię</option>
                  {categoryGroups.map((group) => (
                    <optgroup key={group.label} label={group.label}>
                      {group.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                
                {selectedCategoryInfo && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-blue-800 font-medium">
                          {selectedCategoryInfo.description}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          Przykłady: {selectedCategoryInfo.examples.slice(0, 3).join(', ')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => updateField('featured', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>Produkt polecany</span>
                  </span>
                </label>
              </div>

              <div></div> {/* Empty div for grid spacing */}

              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Krótki opis *
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  rows={3}
                  className="input-field"
                  placeholder="Krótki opis produktu (będzie widoczny na liście produktów)"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="longDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  Szczegółowy opis
                </label>
                <textarea
                  id="longDescription"
                  value={formData.longDescription}
                  onChange={(e) => updateField('longDescription', e.target.value)}
                  rows={6}
                  className="input-field"
                  placeholder="Szczegółowy opis produktu z materiałami, wymiarami, pielęgnacją itp."
                />
              </div>
            </div>
          </div>

          {/* Pricing and tax calculator */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Cena i rozliczenie podatkowe</span>
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left column - Price inputs */}
              <div className="space-y-6">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                    Cena brutto *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="price"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => updateField('price', e.target.value)}
                      className="input-field pr-12"
                      placeholder="0.00"
                      required
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      zł
                    </span>
                  </div>
                </div>

                <div>
                  <label htmlFor="originalPrice" className="block text-sm font-medium text-gray-700 mb-1">
                    Cena brutto przed promocją
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="originalPrice"
                      step="0.01"
                      min="0"
                      value={formData.originalPrice}
                      onChange={(e) => updateField('originalPrice', e.target.value)}
                      className="input-field pr-12"
                      placeholder="0.00"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      zł
                    </span>
                  </div>
                </div>

                <div>
                  <label htmlFor="stockQuantity" className="block text-sm font-medium text-gray-700 mb-1">
                    Ilość w magazynie *
                  </label>
                  <input
                    type="number"
                    id="stockQuantity"
                    min="0"
                    value={formData.stockQuantity}
                    onChange={(e) => updateField('stockQuantity', e.target.value)}
                    className="input-field"
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              {/* Right column - Tax calculator */}
              {formData.price && parseFloat(formData.price) > 0 && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-800 flex items-center space-x-2">
                      <Calculator className="h-4 w-4 text-blue-600" />
                      <span>Kalkulator podatkowy</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowTaxInfo(!showTaxInfo)}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                      title="Informacje o działalności nierejestrowanej"
                    >
                      <Info className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Tax calculator inputs */}
                  <div className="space-y-4 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Szacunkowe koszty (materiały, narzędzia)
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            max={formData.price ? parseFloat(formData.price) : undefined}
                            step="0.01"
                            value={taxCalculator.isPercentMode ? '' : taxCalculator.costsAmount}
                            onChange={(e) => {
                              const amount = parseFloat(e.target.value) || 0
                              setTaxCalculator(prev => ({
                                ...prev,
                                costsAmount: amount,
                                isPercentMode: false
                              }))
                            }}
                            className="input-field text-xs pr-8"
                            placeholder="0.00"
                          />
                          <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">
                            zł
                          </span>
                        </div>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="1"
                            value={taxCalculator.isPercentMode ? taxCalculator.costsPercent : ''}
                            onChange={(e) => {
                              const percent = parseFloat(e.target.value) || 0
                              setTaxCalculator(prev => ({
                                ...prev,
                                costsPercent: Math.min(100, Math.max(0, percent)),
                                isPercentMode: true
                              }))
                            }}
                            className="input-field text-xs pr-8"
                            placeholder="30"
                          />
                          <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">
                            %
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Wpisz kwotę (zł) lub procent (%) kosztów
                      </p>
                    </div>
                  </div>

                  {/* Tax calculation results */}
                  <div className="bg-white rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Cena netto (bez VAT):</span>
                      <span className="font-medium">{taxInfo.netPrice.toFixed(2)} zł</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Koszty ({taxInfo.costsPercent.toFixed(1)}%):</span>
                      <span className="font-medium text-red-500">-{taxInfo.costsAmount.toFixed(2)} zł</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Dochód (po kosztach):</span>
                      <span className="font-medium">{taxInfo.income.toFixed(2)} zł</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Podatek dochodowy (12%):</span>
                      <span className="font-medium text-red-600">{taxInfo.tax.toFixed(2)} zł</span>
                    </div>
                    
                    <div className="border-t pt-2">
                      <div className="flex justify-between items-center text-sm font-semibold">
                        <span className="text-gray-800">Dochód "na rękę":</span>
                        <span className="text-green-600">{taxInfo.netIncome.toFixed(2)} zł</span>
                      </div>
                    </div>
                    
                    <div className="bg-amber-50 border border-amber-200 rounded p-3 mt-3">
                      <div className="flex items-start space-x-2">
                        <TrendingUp className="h-4 w-4 text-amber-600 mt-0.5" />
                        <div>
                          <p className="text-xs text-amber-800 font-medium">
                            Pamiętaj o podatku:
                          </p>
                          <p className="text-sm text-amber-900 font-semibold">
                            Odłóż {taxInfo.tax.toFixed(2)} zł z tej sprzedaży
                          </p>
                          <p className="text-xs text-amber-700 mt-1">
                            Podatek płacisz raz w roku do 30 kwietnia
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Tax information modal/panel */}
            {showTaxInfo && (
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">
                      Działalność nierejestrowana - podstawowe informacje
                    </h4>
                    
                    <div className="text-xs text-blue-800 space-y-2">
                      <p>
                        <strong>Limit miesięczny:</strong> 3 499,50 zł przychodu (75% minimalnego wynagrodzenia)
                      </p>
                      <p>
                        <strong>Podatek dochodowy:</strong> Skala podatkowa - 12% do 120 000 zł rocznego dochodu, 32% powyżej
                      </p>
                      <p>
                        <strong>VAT:</strong> Zwolnienie (przychody poniżej 200 000 zł rocznie)
                      </p>
                      <p>
                        <strong>ZUS:</strong> Brak składek (tylko przy sprzedaży produktów)
                      </p>
                      <p>
                        <strong>Rozliczenie:</strong> Roczne w PIT-36, termin do 30 kwietnia roku następnego
                      </p>
                      <p>
                        <strong>Podstawa prawna:</strong> Art. 5 ustawy Prawo przedsiębiorców
                      </p>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setShowTaxInfo(false)}
                      className="mt-3 text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Zwiń informacje
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Product details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Szczegóły produktu</h2>
            
            <div className="space-y-6">
              {/* Weight and dimensions */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
                    Waga (g)
                  </label>
                  <input
                    type="number"
                    id="weight"
                    min="0"
                    value={formData.weight}
                    onChange={(e) => updateField('weight', e.target.value)}
                    className="input-field"
                    placeholder="200"
                  />
                </div>
                <div>
                  <label htmlFor="length" className="block text-sm font-medium text-gray-700 mb-1">
                    Długość (cm)
                  </label>
                  <input
                    type="number"
                    id="length"
                    min="0"
                    value={formData.dimensions.length}
                    onChange={(e) => updateField('dimensions', {
                      ...formData.dimensions,
                      length: e.target.value
                    })}
                    className="input-field"
                    placeholder="40"
                  />
                </div>
                <div>
                  <label htmlFor="width" className="block text-sm font-medium text-gray-700 mb-1">
                    Szerokość (cm)
                  </label>
                  <input
                    type="number"
                    id="width"
                    min="0"
                    value={formData.dimensions.width}
                    onChange={(e) => updateField('dimensions', {
                      ...formData.dimensions,
                      width: e.target.value
                    })}
                    className="input-field"
                    placeholder="35"
                  />
                </div>
                <div>
                  <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
                    Wysokość (cm)
                  </label>
                  <input
                    type="number"
                    id="height"
                    min="0"
                    value={formData.dimensions.height}
                    onChange={(e) => updateField('dimensions', {
                      ...formData.dimensions,
                      height: e.target.value
                    })}
                    className="input-field"
                    placeholder="15"
                  />
                </div>
              </div>

              {/* Materials */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Materiały * 
                </label>
                <div className="space-y-2">
                  {formData.materials.map((material, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={material}
                        onChange={(e) => updateArrayField('materials', index, e.target.value)}
                        className="input-field"
                        placeholder="np. Bawełna organiczna"
                        required={index === 0}
                      />
                      {formData.materials.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem('materials', index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('materials')}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    + Dodaj materiał
                  </button>
                </div>
              </div>

              {/* Colors */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Dostępne kolory *
                </label>
                <div className="space-y-2">
                  {formData.colors.map((color, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={color}
                        onChange={(e) => updateArrayField('colors', index, e.target.value)}
                        className="input-field"
                        placeholder="np. Naturalny"
                        required={index === 0}
                      />
                      {formData.colors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem('colors', index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('colors')}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    + Dodaj kolor
                  </button>
                </div>
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Cechy produktu
                </label>
                <div className="space-y-2">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => updateArrayField('features', index, e.target.value)}
                        className="input-field"
                        placeholder="np. Ręcznie robiona"
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayItem('features', index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('features')}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    + Dodaj cechę
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Zdjęcia produktu</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-2">
                  Dodaj zdjęcia (max 5 zdjęć, 10MB każde)
                </label>
                <input
                  type="file"
                  id="images"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="input-field"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Dozwolone formaty: JPEG, PNG, WebP. Pierwsze zdjęcie będzie głównym.
                  Możesz dodawać zdjęcia po kolei.
                </p>
              </div>

              {/* Image previews */}
              {previewUrls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                          Główne
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {uploadError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm">{uploadError}</p>
                </div>
              )}
            </div>
          </div>

          {/* Submit buttons */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleCancel}
              className="btn-outline"
            >
              Anuluj
            </button>

            <button
              type="submit"
              disabled={isSaving || isUploading}
              className="btn-primary flex items-center space-x-2"
            >
              {isSaving || isUploading ? (
                <>
                  <div className="loading-spinner"></div>
                  <span>
                    {isUploading ? 'Przesyłanie zdjęć...' : 'Zapisywanie...'}
                  </span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Utwórz produkt</span>
                </>
              )}
            </button>
          </div>
        </form>
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