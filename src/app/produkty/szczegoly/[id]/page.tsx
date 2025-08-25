'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { ProductService } from '@/lib/products'
import { Product } from '@/lib/firestore-types'
import { 
  Star, 
  Heart, 
  Share2, 
  ShoppingCart, 
  Minus, 
  Plus,
  Truck,
  Shield,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Package
} from 'lucide-react'

interface ProductDetailsPageProps {
  params: Promise<{ id: string }>
}

export default function ProductDetailsPage({ params }: ProductDetailsPageProps) {
  // Use React 19's use() hook to read the async params
  const { id } = use(params)
  
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentImage, setCurrentImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [activeTab, setActiveTab] = useState('description')

  // Load product data
  useEffect(() => {
    const loadProduct = async () => {
      try {
        const productData = await ProductService.getProductById(id)
        if (productData) {
          setProduct(productData)
          setSelectedColor(productData.colors[0] || '')
        }
      } catch (error) {
        console.error('Error loading product:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProduct()
  }, [id])

  const handleAddToCart = () => {
    if (!product) return
    
    // TODO: Add to cart functionality
    console.log('Adding to cart:', {
      productId: product.id,
      quantity,
      selectedColor
    })
    
    // Temporary feedback
    alert(`Dodano ${quantity}x ${product.name} do koszyka!`)
  }

  const handleQuantityChange = (increment: boolean) => {
    if (!product) return
    
    if (increment && quantity < product.stockQuantity) {
      setQuantity(quantity + 1)
    } else if (!increment && quantity > 1) {
      setQuantity(quantity - 1)
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-600">Ładowanie produktu...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Produkt nie został znaleziony
          </h1>
          <p className="text-gray-600 mb-6">
            Nie znaleziono produktu o podanym ID
          </p>
          <Link href="/produkty" className="btn-primary">
            Wróć do produktów
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-pink-600">Strona główna</Link>
          <span>/</span>
          <Link href="/produkty" className="hover:text-pink-600">Produkty</Link>
          <span>/</span>
          <Link href={`/produkty/${product.category}`} className="hover:text-pink-600 capitalize">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product images */}
          <div className="space-y-4">
            {/* Main image */}
            <div className="relative aspect-square bg-white rounded-lg shadow-md overflow-hidden">
              {product.images.length > 0 ? (
                <img
                  src={product.images[currentImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="aspect-square bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                  <Heart className="h-24 w-24 text-pink-300" />
                </div>
              )}
              
              {/* Navigation arrows */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}

              {/* Sale badge */}
              {product.originalPrice && (
                <div className="absolute top-4 left-4">
                  <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
                    -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                  </span>
                </div>
              )}

              {/* Featured badge */}
              {product.featured && (
                <div className="absolute top-4 right-4">
                  <span className="bg-pink-600 text-white px-2 py-1 rounded text-sm font-semibold">
                    Polecane
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail images */}
            {product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImage(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                      currentImage === index ? 'border-pink-500' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>
              
              {/* Price */}
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-3xl font-bold text-pink-600">
                  {product.price.toFixed(2)} zł
                </span>
                {product.originalPrice && (
                  <span className="text-lg text-gray-500 line-through">
                    {product.originalPrice.toFixed(2)} zł
                  </span>
                )}
              </div>

              {/* Stock status */}
              <div className="mb-6">
                {product.inStock ? (
                  <span className="text-green-600 text-sm font-medium">
                    ✓ Dostępny ({product.stockQuantity} szt.)
                  </span>
                ) : (
                  <span className="text-red-600 text-sm font-medium">
                    ✗ Brak w magazynie
                  </span>
                )}
              </div>
            </div>

            {/* Color selection */}
            {product.colors.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Kolor:</h3>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                        selectedColor === color
                          ? 'border-pink-500 bg-pink-50 text-pink-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Ilość:</h3>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(false)}
                      disabled={quantity <= 1}
                      className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-4 py-2 min-w-[3rem] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(true)}
                      disabled={quantity >= product.stockQuantity}
                      className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className="flex-1 btn-primary flex items-center justify-center space-x-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>{product.inStock ? 'Dodaj do koszyka' : 'Brak w magazynie'}</span>
                </button>
                
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`p-3 border rounded-lg transition-colors ${
                    isWishlisted
                      ? 'border-pink-500 bg-pink-50 text-pink-600'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
                
                <button className="p-3 border border-gray-300 rounded-lg hover:border-gray-400">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6 border-t border-gray-200">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Truck className="h-4 w-4 text-pink-600" />
                <span>Darmowa dostawa od 150 zł</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Shield className="h-4 w-4 text-pink-600" />
                <span>Gwarancja jakości</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <RotateCcw className="h-4 w-4 text-pink-600" />
                <span>30 dni na zwrot</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product tabs */}
        <div className="mt-16">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                { id: 'description', label: 'Opis' },
                { id: 'details', label: 'Szczegóły' },
                { id: 'shipping', label: 'Dostawa' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-pink-500 text-pink-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="py-8">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <p className="text-gray-600 mb-4 text-lg leading-relaxed">
                  {product.description}
                </p>
                
                {product.longDescription && (
                  <div className="whitespace-pre-line text-gray-600 mb-6 leading-relaxed">
                    {product.longDescription}
                  </div>
                )}
                
                {product.features.length > 0 && (
                  <>
                    <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Cechy produktu:</h3>
                    <ul className="list-disc list-inside space-y-2">
                      {product.features.map((feature, index) => (
                        <li key={index} className="text-gray-600">{feature}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}

            {activeTab === 'details' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Specyfikacja</h3>
                  <dl className="space-y-3">
                    {product.dimensions && (product.dimensions.length > 0 || product.dimensions.width > 0 || product.dimensions.height > 0) && (
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Wymiary:</dt>
                        <dd className="text-gray-900">
                          {product.dimensions.length} x {product.dimensions.width} x {product.dimensions.height} cm
                        </dd>
                      </div>
                    )}
                    {product.weight && (
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Waga:</dt>
                        <dd className="text-gray-900">{product.weight}g</dd>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Kategoria:</dt>
                      <dd className="text-gray-900 capitalize">{product.category}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Stan magazynowy:</dt>
                      <dd className="text-gray-900">{product.stockQuantity} szt.</dd>
                    </div>
                  </dl>
                </div>
                
                {product.materials.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Materiały</h3>
                    <ul className="space-y-2">
                      {product.materials.map((material, index) => (
                        <li key={index} className="text-gray-600 flex items-center">
                          <span className="w-2 h-2 bg-pink-500 rounded-full mr-3"></span>
                          {material}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {product.colors.length > 0 && (
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Dostępne kolory</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map((color, index) => (
                        <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                          {color}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Opcje dostawy</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">Poczta Polska</h4>
                        <p className="text-sm text-gray-600">3-5 dni roboczych</p>
                      </div>
                      <span className="font-semibold text-gray-900">12,99 zł</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">Kurier DPD</h4>
                        <p className="text-sm text-gray-600">1-2 dni robocze</p>
                      </div>
                      <span className="font-semibold text-gray-900">18,99 zł</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">InPost Paczkomat</h4>
                        <p className="text-sm text-gray-600">1-2 dni robocze</p>
                      </div>
                      <span className="font-semibold text-gray-900">15,99 zł</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-4 border border-pink-200 rounded-lg bg-pink-50">
                      <div>
                        <h4 className="font-medium text-gray-900">Darmowa dostawa</h4>
                        <p className="text-sm text-gray-600">Przy zamówieniach powyżej 150 zł</p>
                      </div>
                      <span className="font-semibold text-pink-600">0 zł</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Zwroty i reklamacje</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• 30 dni na zwrot bez podania przyczyny</li>
                    <li>• Koszt zwrotu pokrywa kupujący</li>
                    <li>• Produkt musi być w stanie nienaruszonym</li>
                    <li>• Zwrot pieniędzy w ciągu 14 dni</li>
                    <li>• Zwroty dla produktów handmade wymagają zachowania oryginalnego stanu</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Czas realizacji</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800">
                      <strong>Ważne:</strong> Produkty są wykonywane ręcznie na zamówienie. 
                      Czas realizacji wynosi 3-7 dni roboczych od momentu otrzymania płatności.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related products section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Możesz też polubić
          </h2>
          <div className="text-center">
            <Link
              href={`/produkty/${product.category}`}
              className="btn-outline inline-flex items-center space-x-2"
            >
              <Package className="h-4 w-4" />
              <span>Zobacz więcej z kategorii: {product.category}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}