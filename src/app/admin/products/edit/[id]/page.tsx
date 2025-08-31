'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { AuthService } from '@/lib/auth'
import { ProductService } from '@/lib/products'
import { useImageUpload } from '@/hooks/useImageUpload'
import { getCategoryOptionsGrouped, getCategoryById } from '@/lib/categories'
import { Product } from '@/lib/firestore-types'
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
  AlertTriangle,
  Image as ImageIcon,
  Trash2
} from 'lucide-react'

interface ProductEditPageProps {
  params: Promise<{ id: string }>
}

export default function ProductEditPage({ params }: ProductEditPageProps) {
  // Use React 19's use() hook to read the async params
  const { id } = use(params)

  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([])
  const router = useRouter()
  const { uploadImages, deleteImage, isUploading, error: uploadError } = useImageUpload()
  const { showSuccess, showError, showWarning, showInfo } = useToast()
  const { confirmation, confirm, closeConfirmation } = useConfirmation()

  // Get category options grouped by category groups
  const categoryGroups = getCategoryOptionsGrouped()

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

  // Load product data
  useEffect(() => {
    const loadProduct = async () => {
      if (!id || !isAdmin) return

      try {
        const productData = await ProductService.getProductById(id)
        if (!productData) {
          showError('Produkt nie znaleziony', 'Nie udało się znaleźć produktu o podanym ID')
          router.push('/admin/products')
          return
        }

        setProduct(productData)
        setExistingImages(productData.images || [])

        // Populate form data
        setFormData({
          name: productData.name,
          description: productData.description,
          longDescription: productData.longDescription || '',
          price: productData.price.toString(),
          originalPrice: productData.originalPrice?.toString() || '',
          category: productData.category,
          stockQuantity: productData.stockQuantity.toString(),
          weight: productData.weight?.toString() || '',
          dimensions: {
            length: productData.dimensions?.length?.toString() || '',
            width: productData.dimensions?.width?.toString() || '',
            height: productData.dimensions?.height?.toString() || ''
          },
          materials: productData.materials.length > 0 ? productData.materials : [''],
          colors: productData.colors.length > 0 ? productData.colors : [''],
          features: productData.features.length > 0 ? productData.features : [''],
          featured: productData.featured,
          inStock: productData.inStock
        })
      } catch (error) {
        console.error('Error loading product:', error)
        showError('Błąd ładowania', 'Nie udało się załadować danych produktu')
        router.push('/admin/products')
      }
    }

    loadProduct()
  }, [id, isAdmin, router, showError])

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Sprawdź limit plików (max 5 łącznie z istniejącymi)
    const totalImages = existingImages.length - imagesToDelete.length + selectedFiles.length + files.length
    if (totalImages > 5) {
      showWarning('Limit zdjęć', 'Możesz mieć maksymalnie 5 zdjęć łącznie')
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

  // Remove new file
  const removeNewFile = (index: number) => {
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

  // Mark existing image for deletion
  const markImageForDeletion = (imageUrl: string) => {
    setImagesToDelete(prev => [...prev, imageUrl])
  }

  // Restore image from deletion
  const restoreImage = (imageUrl: string) => {
    setImagesToDelete(prev => prev.filter(url => url !== imageUrl))
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

  // Check if form has changes
  const hasChanges = () => {
    if (!product) return false

    return (
      formData.name !== product.name ||
      formData.description !== product.description ||
      formData.longDescription !== (product.longDescription || '') ||
      formData.price !== product.price.toString() ||
      formData.originalPrice !== (product.originalPrice?.toString() || '') ||
      formData.category !== product.category ||
      formData.stockQuantity !== product.stockQuantity.toString() ||
      formData.weight !== (product.weight?.toString() || '') ||
      formData.featured !== product.featured ||
      formData.inStock !== product.inStock ||
      selectedFiles.length > 0 ||
      imagesToDelete.length > 0 ||
      JSON.stringify(formData.materials) !== JSON.stringify(product.materials) ||
      JSON.stringify(formData.colors) !== JSON.stringify(product.colors) ||
      JSON.stringify(formData.features) !== JSON.stringify(product.features)
    )
  }

  // Handle cancel with confirmation
  const handleCancel = async () => {
    if (hasChanges()) {
      const confirmed = await confirm({
        title: 'Odrzucić zmiany?',
        message: 'Masz niezapisane zmiany w tym produkcie. Czy na pewno chcesz je odrzucić?',
        confirmText: 'Tak, odrzuć',
        cancelText: 'Zostań tutaj',
        type: 'warning'
      })

      if (confirmed) {
        router.push('/admin/products')
      }
    } else {
      router.push('/admin/products')
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      if (!product) {
        showError('Błąd systemu', 'Brak danych produktu do aktualizacji')
        return
      }

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

      // Create updated product data
      const updatedProductData = {
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
        inStock: formData.inStock && parseInt(formData.stockQuantity) > 0
      }

      // Aktualizuj podstawowe dane produktu
      await ProductService.updateProduct(id, updatedProductData)

      // Usuń zaznaczone zdjęcia
      for (const imageUrl of imagesToDelete) {
        try {
          await deleteImage(imageUrl)
        } catch (error) {
          console.error('Error deleting image:', error)
        }
      }

      // Upload nowych zdjęć jeśli są wybrane
      let newImageUrls: string[] = []
      if (selectedFiles.length > 0) {
        newImageUrls = await uploadImages(id, selectedFiles)
      }

      // Zaktualizuj listę zdjęć
      const remainingImages = existingImages.filter(url => !imagesToDelete.includes(url))
      const allImages = [...remainingImages, ...newImageUrls]

      await ProductService.updateProduct(id, {
        images: allImages
      })

      // Pokaż sukces z szczegółami
      const changesCount = [
        hasChanges() && 'dane produktu',
        newImageUrls.length > 0 && `${newImageUrls.length} nowe zdjęcie/zdjęć`,
        imagesToDelete.length > 0 && `${imagesToDelete.length} usunięte zdjęcie/zdjęć`
      ].filter(Boolean).join(', ')

      showSuccess(
        'Produkt zaktualizowany!',
        `Pomyślnie zapisano zmiany: ${changesCount || 'podstawowe informacje'}.`
      )

      // Przekieruj po krótkim opóźnieniu
      setTimeout(() => {
        router.push(`/admin/products/view/${id}`)
      }, 1500)

    } catch (error: any) {
      console.error('Error updating product:', error)
      showError(
        'Błąd podczas aktualizacji',
        error.message || 'Nie udało się zaktualizować produktu. Sprawdź dane i spróbuj ponownie.'
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

  if (!isAdmin || !product) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link
              href="/admin/products"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edytuj produkt</h1>
              <p className="text-gray-600">{product.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href={`/admin/products/view/${id}`}
              className="btn-outline flex items-center space-x-2"
            >
              <Eye className="h-4 w-4" />
              <span>Podgląd</span>
            </Link>
            <Link
              href="/admin/products"
              className="btn-outline"
            >
              Lista produktów
            </Link>
          </div>
        </div>

        {/* Changes indicator */}
        {hasChanges() && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <Info className="h-4 w-4 text-blue-600" />
              <span className="text-blue-800 text-sm font-medium">
                Masz niezapisane zmiany w tym produkcie
              </span>
            </div>
          </div>
        )}

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

          {/* Pricing and inventory */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Cena i magazyn</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Cena *
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
                  Cena przed promocją
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
                          onClick={() => removeArrayItem('features', index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
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

            <div className="space-y-6">
              {/* Existing images */}
              {existingImages.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Obecne zdjęcia</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {existingImages.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Zdjęcie ${index + 1}`}
                          className={`w-full h-32 object-cover rounded-lg border border-gray-200 ${
                            imagesToDelete.includes(url) ? 'opacity-50 grayscale' : ''
                          }`}
                        />
                        {imagesToDelete.includes(url) ? (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => restoreImage(url)}
                              className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                            >
                              Przywróć
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => markImageForDeletion(url)}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                        {index === 0 && !imagesToDelete.includes(url) && (
                          <span className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                            Główne
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add new images */}
              <div>
                <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-2">
                  Dodaj nowe zdjęcia (max {5 - existingImages.length + imagesToDelete.length} zdjęć)
                </label>
                <input
                  type="file"
                  id="images"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="input-field"
                  disabled={existingImages.length - imagesToDelete.length + selectedFiles.length >= 5}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Dozwolone formaty: JPEG, PNG, WebP. Maksymalnie 5 zdjęć łącznie.
                </p>
              </div>

              {/* New image previews */}
              {previewUrls.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Nowe zdjęcia</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Nowe zdjęcie ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewFile(index)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {uploadError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm">{uploadError}</p>
                </div>
              )}

              {imagesToDelete.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-yellow-800 text-sm font-medium">Uwaga</p>
                      <p className="text-yellow-700 text-xs mt-1">
                        {imagesToDelete.length} zdjęcie/zdjęć zostanie usunięte po zapisaniu zmian.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit buttons */}
          <div className="flex items-center justify-between bg-white rounded-lg shadow-md p-6">
            <button
              type="button"
              onClick={handleCancel}
              className="btn-outline"
            >
              Anuluj
            </button>

            <div className="flex items-center space-x-3">
              <Link
                href={`/admin/products/view/${id}`}
                className="btn-outline flex items-center space-x-2"
              >
                <Eye className="h-4 w-4" />
                <span>Podgląd</span>
              </Link>

              <button
                type="submit"
                disabled={isSaving || isUploading || !hasChanges()}
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
                    <span>Zapisz zmiany</span>
                  </>
                )}
              </button>
            </div>
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
