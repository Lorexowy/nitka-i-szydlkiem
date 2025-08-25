'use client'

import { useState, use } from 'react'
import Link from 'next/link'
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
  ChevronRight
} from 'lucide-react'

// Mock product data - later from Firebase
const mockProduct = {
  id: '1',
  name: 'Szydełkowa torba na zakupy',
  description: 'Piękna, ręcznie robiona torba szydełkowa, idealna na codzienne zakupy. Wykonana z wysokiej jakości bawełny, trwała i stylowa. Każda torba jest unikalna i niepowtarzalna.',
  longDescription: `
    Ta wyjątkowa torba szydełkowa została stworzona z myślą o osobach ceniących sobie zarówno funkcjonalność, jak i unikalny design. 
    
    **Materiał:** 100% bawełna organiczna
    **Wymiary:** 40cm x 35cm x 15cm
    **Uchwyt:** Wzmocniony, długość 60cm
    **Pielęgnacja:** Pranie ręczne w letniej wodzie
    
    Każda torba jest wykonywana na zamówienie, co oznacza, że Twoja będzie jedyna w swoim rodzaju. Proces tworzenia zajmuje 3-5 dni roboczych.
  `,
  price: 89.99,
  originalPrice: 109.99,
  category: 'torby',
  images: [
    '/placeholder-product.jpg',
    '/placeholder-product-2.jpg',
    '/placeholder-product-3.jpg',
  ],
  inStock: true,
  stockQuantity: 5,
  rating: 4.8,
  reviewCount: 24,
  weight: 200,
  dimensions: {
    length: 40,
    width: 35,
    height: 15
  },
  materials: ['Bawełna organiczna', 'Poliester (podszewka)'],
  colors: ['Naturalny', 'Beżowy', 'Kremowy'],
  features: [
    'Ręcznie robiona',
    'Materiały ekologiczne',
    'Wzmocnione uchwyty',
    'Można prać',
    'Unikalna w swoim rodzaju'
  ]
}

const mockReviews = [
  {
    id: '1',
    author: 'Anna K.',
    rating: 5,
    date: '2024-01-15',
    comment: 'Przepiękna torba! Bardzo solidnie wykonana, materiał przyjemny w dotyku. Polecam!'
  },
  {
    id: '2',
    author: 'Magdalena W.',
    rating: 5,
    date: '2024-01-10',
    comment: 'Dokładnie to, czego szukałam. Świetna jakość i szybka dostawa.'
  },
  {
    id: '3',
    author: 'Katarzyna M.',
    rating: 4,
    date: '2024-01-05',
    comment: 'Bardzo ładna torba, tylko trochę mniejsza niż się spodziewałam.'
  }
]

interface ProductDetailsPageProps {
  params: Promise<{ id: string }>
}

export default function ProductDetailsPage({ params }: ProductDetailsPageProps) {
  // Use React 19's use() hook to read the async params
  const { id } = use(params)
  
  const [currentImage, setCurrentImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState(mockProduct.colors[0])
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [activeTab, setActiveTab] = useState('description')

  const handleAddToCart = () => {
    // TODO: Add to cart functionality
    console.log('Adding to cart:', {
      productId: mockProduct.id,
      quantity,
      selectedColor
    })
  }

  const handleQuantityChange = (increment: boolean) => {
    if (increment && quantity < mockProduct.stockQuantity) {
      setQuantity(quantity + 1)
    } else if (!increment && quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const nextImage = () => {
    setCurrentImage((prev) => 
      prev === mockProduct.images.length - 1 ? 0 : prev + 1
    )
  }

  const prevImage = () => {
    setCurrentImage((prev) => 
      prev === 0 ? mockProduct.images.length - 1 : prev - 1
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
          <span className="text-gray-900">{mockProduct.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product images */}
          <div className="space-y-4">
            {/* Main image */}
            <div className="relative aspect-square bg-white rounded-lg shadow-md overflow-hidden">
              <div className="aspect-square bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                <Heart className="h-24 w-24 text-pink-300" />
              </div>
              
              {/* Navigation arrows */}
              {mockProduct.images.length > 1 && (
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
              {mockProduct.originalPrice && (
                <div className="absolute top-4 left-4">
                  <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
                    -{Math.round((1 - mockProduct.price / mockProduct.originalPrice) * 100)}%
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail images */}
            {mockProduct.images.length > 1 && (
              <div className="flex space-x-2">
                {mockProduct.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImage(index)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${
                      currentImage === index ? 'border-pink-500' : 'border-gray-200'
                    }`}
                  >
                    <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                      <Heart className="h-6 w-6 text-pink-300" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {mockProduct.name}
              </h1>
              
              {/* Rating */}
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(mockProduct.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {mockProduct.rating} ({mockProduct.reviewCount} opinie)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-3xl font-bold text-pink-600">
                  {mockProduct.price.toFixed(2)} zł
                </span>
                {mockProduct.originalPrice && (
                  <span className="text-lg text-gray-500 line-through">
                    {mockProduct.originalPrice.toFixed(2)} zł
                  </span>
                )}
              </div>

              {/* Stock status */}
              <div className="mb-6">
                {mockProduct.inStock ? (
                  <span className="text-green-600 text-sm font-medium">
                    ✓ Dostępny ({mockProduct.stockQuantity} szt.)
                  </span>
                ) : (
                  <span className="text-red-600 text-sm font-medium">
                    ✗ Brak w magazynie
                  </span>
                )}
              </div>
            </div>

            {/* Color selection */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Kolor:</h3>
              <div className="flex space-x-2">
                {mockProduct.colors.map((color) => (
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
                      disabled={quantity >= mockProduct.stockQuantity}
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
                  disabled={!mockProduct.inStock}
                  className="flex-1 btn-primary flex items-center justify-center space-x-2 py-3"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>Dodaj do koszyka</span>
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
                { id: 'reviews', label: 'Opinie' },
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
                <p className="text-gray-600 mb-4">{mockProduct.description}</p>
                <div className="whitespace-pre-line text-gray-600">
                  {mockProduct.longDescription}
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Cechy produktu:</h3>
                <ul className="list-disc list-inside space-y-1">
                  {mockProduct.features.map((feature, index) => (
                    <li key={index} className="text-gray-600">{feature}</li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'details' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Specyfikacja</h3>
                  <dl className="space-y-3">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Wymiary:</dt>
                      <dd className="text-gray-900">
                        {mockProduct.dimensions.length} x {mockProduct.dimensions.width} x {mockProduct.dimensions.height} cm
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Waga:</dt>
                      <dd className="text-gray-900">{mockProduct.weight}g</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Kategoria:</dt>
                      <dd className="text-gray-900 capitalize">{mockProduct.category}</dd>
                    </div>
                  </dl>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Materiały</h3>
                  <ul className="space-y-2">
                    {mockProduct.materials.map((material, index) => (
                      <li key={index} className="text-gray-600 flex items-center">
                        <span className="w-2 h-2 bg-pink-500 rounded-full mr-3"></span>
                        {material}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Opinie ({mockReviews.length})
                  </h3>
                  <button className="btn-outline">Dodaj opinię</button>
                </div>
                
                <div className="space-y-6">
                  {mockReviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-6">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">{review.author}</span>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < review.rating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">{review.date}</span>
                      </div>
                      <p className="text-gray-600">{review.comment}</p>
                    </div>
                  ))}
                </div>
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
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}