'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { AuthService } from '@/lib/auth'
import { ProductService } from '@/lib/products'
import { getCategoryById } from '@/lib/categories'
import { Product } from '@/lib/firestore-types'
import { 
  ArrowLeft, 
  Edit, 
  Trash2,
  Package,
  Star,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  Calendar,
  User,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  ShoppingCart
} from 'lucide-react'

interface ProductViewPageProps {
  params: Promise<{ id: string }>
}

export default function AdminProductViewPage({ params }: ProductViewPageProps) {
  // Use React 19's use() hook to read the async params
  const { id } = use(params)
  
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [product, setProduct] = useState<Product | null>(null)
  const [currentImage, setCurrentImage] = useState(0)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
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
          alert('Produkt nie został znaleziony')
          router.push('/admin/products')
          return
        }

        setProduct(productData)
      } catch (error) {
        console.error('Error loading product:', error)
        alert('Nie udało się załadować produktu')
        router.push('/admin/products')
      }
    }

    loadProduct()
  }, [id, isAdmin, router])

  const handleDeleteProduct = async () => {
    if (!product) return

    try {
      await ProductService.deleteProduct(product.id)
      router.push('/admin/products?success=deleted')
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Nie udało się usunąć produktu')
    }
  }

  const handleToggleFeatured = async () => {
    if (!product) return

    try {
      const updatedStatus = !product.featured
      await ProductService.updateProduct(product.id, { featured: updatedStatus })
      setProduct(prev => prev ? { ...prev, featured: updatedStatus } : null)
      
      alert(updatedStatus ? 'Produkt został oznaczony jako polecany' : 'Produkt został usunięty z polecanych')
    } catch (error) {
      console.error('Error toggling featured status:', error)
      alert('Nie udało się zmienić statusu produktu')
    }
  }

  const handleCopyId = () => {
    if (product) {
      navigator.clipboard.writeText(product.id)
      alert('ID produktu zostało skopiowane do schowka')
    }
  }

  const nextImage = () => {
    if (!product || product.images.length <= 1) return
    setCurrentImage((prev) => 
      prev === product.images.length - 1 ? 0 : prev + 1
    )
  }

  const prevImage = () => {
    if (!product || product.images.length <= 1) return
    setCurrentImage((prev) => 
      prev === 0 ? product.images.length - 1 : prev - 1
    )
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp || !timestamp.seconds) return 'Brak danych'
    return new Date(timestamp.seconds * 1000).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const categoryInfo = product ? getCategoryById(product.category) : null

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <h1 className="text-2xl font-bold text-gray-900">Podgląd produktu</h1>
              <p className="text-gray-600">{product.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href={`/produkty/szczegoly/${product.id}`}
              target="_blank"
              className="btn-outline flex items-center space-x-2"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Zobacz na stronie</span>
            </Link>
            <Link
              href={`/admin/products/edit/${product.id}`}
              className="btn-primary flex items-center space-x-2"
            >
              <Edit className="h-4 w-4" />
              <span>Edytuj</span>
            </Link>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Usuń</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product images and basic info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative">
                {product.images.length > 0 ? (
                  <div className="aspect-square bg-white">
                    <img
                      src={product.images[currentImage]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    
                    {product.images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                        
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                          {product.images.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImage(index)}
                              className={`w-3 h-3 rounded-full ${
                                currentImage === index ? 'bg-white' : 'bg-white/50'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    <Package className="h-24 w-24 text-gray-400" />
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col space-y-2">
                  {product.featured && (
                    <span className="bg-yellow-500 text-white px-3 py-1 rounded-lg text-sm font-medium">
                      Polecane
                    </span>
                  )}
                  {!product.inStock && (
                    <span className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-medium">
                      Brak w magazynie
                    </span>
                  )}
                  {product.originalPrice && (
                    <span className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm font-medium">
                      Promocja -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                    </span>
                  )}
                </div>
              </div>

              {/* Thumbnail gallery */}
              {product.images.length > 1 && (
                <div className="p-4 border-t">
                  <div className="flex space-x-2 overflow-x-auto">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImage(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                          currentImage === index ? 'border-blue-500' : 'border-gray-200'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`Miniatura ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Product description */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Opis produktu</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 mb-4">{product.description}</p>
                
                {product.longDescription && (
                  <div className="whitespace-pre-line text-gray-700 mb-4">
                    {product.longDescription}
                  </div>
                )}

                {product.features.length > 0 && (
                  <div>
                    <h3 className="text-md font-semibold text-gray-900 mb-2">Cechy produktu:</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {product.features.map((feature, index) => (
                        <li key={index} className="text-gray-700">{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Product details sidebar */}
          <div className="space-y-6">
            {/* Status and actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Status produktu</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Dostępność</span>
                  <div className="flex items-center space-x-2">
                    {product.inStock ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-green-600 font-medium">W magazynie</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="text-red-600 font-medium">Brak w magazynie</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Ilość</span>
                  <span className="font-medium">{product.stockQuantity} szt.</span>
                </div>

                {product.stockQuantity < 5 && product.inStock && (
                  <div className="flex items-center space-x-2 p-3 bg-yellow-50 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-yellow-700 text-sm">Niski stan magazynowy</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status polecany</span>
                  <button
                    onClick={handleToggleFeatured}
                    className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      product.featured
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Star className={`h-4 w-4 ${product.featured ? 'fill-current' : ''}`} />
                    <span>{product.featured ? 'Polecany' : 'Zwykły'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Price information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Cena</h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Aktualna cena</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {product.price.toFixed(2)} zł
                  </span>
                </div>

                {product.originalPrice && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Cena przed promocją</span>
                      <span className="text-lg text-gray-500 line-through">
                        {product.originalPrice.toFixed(2)} zł
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Oszczędność</span>
                      <span className="text-green-600 font-medium">
                        {(product.originalPrice - product.price).toFixed(2)} zł 
                        ({Math.round((1 - product.price / product.originalPrice) * 100)}%)
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Category and details */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Szczegóły</h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Kategoria</span>
                  <div className="text-right">
                    <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${categoryInfo?.color || 'bg-gray-100 text-gray-800'}`}>
                      {categoryInfo?.name || product.category}
                    </div>
                    {categoryInfo && (
                      <div className="text-xs text-gray-500 mt-1">
                        Grupa: {categoryInfo.group}
                      </div>
                    )}
                  </div>
                </div>

                {product.weight && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Waga</span>
                    <span className="font-medium">{product.weight}g</span>
                  </div>
                )}

                {product.dimensions && (product.dimensions.length > 0 || product.dimensions.width > 0 || product.dimensions.height > 0) && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Wymiary</span>
                    <span className="font-medium">
                      {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height} cm
                    </span>
                  </div>
                )}

                <div className="flex items-start justify-between">
                  <span className="text-gray-600">Materiały</span>
                  <div className="text-right">
                    {product.materials.map((material, index) => (
                      <div key={index} className="text-sm font-medium">
                        {material}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-start justify-between">
                  <span className="text-gray-600">Kolory</span>
                  <div className="text-right">
                    <div className="flex flex-wrap gap-1">
                      {product.colors.map((color, index) => (
                        <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {color}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">ID produktu</span>
                  <button
                    onClick={handleCopyId}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                  >
                    <span className="font-mono text-sm">{product.id}</span>
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Informacje systemowe</h2>
              
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Utworzono</span>
                  </div>
                  <span className="text-sm text-gray-900 text-right">
                    {formatDate(product.createdAt)}
                  </span>
                </div>

                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <Edit className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Ostatnia zmiana</span>
                  </div>
                  <span className="text-sm text-gray-900 text-right">
                    {formatDate(product.updatedAt)}
                  </span>
                </div>

                {product.createdBy && (
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Utworzył</span>
                    </div>
                    <span className="text-sm text-gray-900 font-mono">
                      {product.createdBy}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Delete confirmation modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Usuń produkt
                  </h3>
                </div>
              </div>
              
              <p className="text-gray-600 mb-6">
                Czy na pewno chcesz usunąć produkt <strong>"{product.name}"</strong>? 
                Ta akcja jest nieodwracalna i usunie również wszystkie zdjęcia produktu.
              </p>

              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn-outline"
                >
                  Anuluj
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    handleDeleteProduct()
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Usuń produkt
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}