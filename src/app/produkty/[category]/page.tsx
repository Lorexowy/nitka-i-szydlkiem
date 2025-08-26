'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { ProductService } from '@/lib/products'
import { Product } from '@/lib/firestore-types'
import { 
  Star,
  Heart,
  ShoppingCart,
  Grid3X3,
  List,
  Filter,
  ChevronDown,
  Package
} from 'lucide-react'

const sortOptions = [
  { value: 'newest', label: 'Najnowsze' },
  { value: 'price-asc', label: 'Cena: od najniższej' },
  { value: 'price-desc', label: 'Cena: od najwyższej' },
  { value: 'rating', label: 'Najlepiej oceniane' },
  { value: 'name', label: 'Nazwa A-Z' },
]

// Mapowanie kategorii na polskie nazwy
const categoryLabels: Record<string, { name: string; description: string }> = {
  'torby': { 
    name: 'Torby', 
    description: 'Stylowe i praktyczne torby szydełkowe na każdą okazję' 
  },
  'czapki': { 
    name: 'Czapki', 
    description: 'Ciepłe i modne czapki ręcznie robione' 
  },
  'szaliki': { 
    name: 'Szaliki', 
    description: 'Miękkie i eleganckie szaliki na chłodne dni' 
  },
  'dekoracje': { 
    name: 'Dekoracje', 
    description: 'Piękne ozdoby do domu wykonane z miłością' 
  },
  'inne': { 
    name: 'Inne', 
    description: 'Wyjątkowe produkty szydełkowe, które warto poznać' 
  }
}

interface CategoryPageProps {
  params: Promise<{ category: string }>
}

export default function CategoryPage({ params }: CategoryPageProps) {
  // Use React 19's use() hook to read the async params
  const { category } = use(params)
  
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 })
  const [isLoading, setIsLoading] = useState(true)
  const [allCategories, setAllCategories] = useState<string[]>([])

  // Load products for the category
  useEffect(() => {
    const loadCategoryProducts = async () => {
      setIsLoading(true)
      try {
        // Pobierz wszystkie produkty
        const allProducts = await ProductService.getAllProducts()
        
        // Wygeneruj listę dostępnych kategorii
        const categories = [...new Set(allProducts.map(p => p.category))]
        setAllCategories(categories)
        
        // Filtruj produkty dla obecnej kategorii
        const categoryProducts = allProducts.filter(product => 
          product.category.toLowerCase() === category.toLowerCase()
        )
        
        setProducts(categoryProducts)
        setFilteredProducts(categoryProducts)
        
        console.log(`Loaded ${categoryProducts.length} products for category: ${category}`)
      } catch (error) {
        console.error('Error loading category products:', error)
        setProducts([])
        setFilteredProducts([])
      } finally {
        setIsLoading(false)
      }
    }

    loadCategoryProducts()
  }, [category])

  // Filter and sort products
  useEffect(() => {
    let filtered = [...products]

    // Filter by price range
    filtered = filtered.filter(product =>
      product.price >= priceRange.min && product.price <= priceRange.max
    )

    // Sort products
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        // Temporary sort by name since we don't have ratings yet
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      default:
        // newest - sort by creation date
        filtered.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return b.createdAt.seconds - a.createdAt.seconds
          }
          return 0
        })
        break
    }

    setFilteredProducts(filtered)
  }, [products, sortBy, priceRange])

  // Sprawdź czy kategoria jest prawidłowa
  const currentCategoryInfo = categoryLabels[category.toLowerCase()]
  const isValidCategory = currentCategoryInfo || allCategories.includes(category.toLowerCase())

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-600">Ładowanie produktów...</p>
        </div>
      </div>
    )
  }

  if (!isValidCategory) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Kategoria nie została znaleziona
          </h1>
          <p className="text-gray-600 mb-6">
            Nie znaleziono produktów w kategorii: <strong>{category}</strong>
          </p>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Dostępne kategorie: {allCategories.join(', ')}
            </p>
            <div className="flex space-x-4 justify-center">
              <Link href="/produkty" className="btn-primary">
                Wszystkie produkty
              </Link>
              <Link href="/" className="btn-outline">
                Strona główna
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const categoryInfo = currentCategoryInfo || {
    name: category.charAt(0).toUpperCase() + category.slice(1),
    description: `Sprawdź naszą kolekcję produktów: ${category}`
  }

  const ProductCard = ({ product }: { product: Product }) => (
    <div className="card card-hover group">
      <Link href={`/produkty/szczegoly/${product.id}`}>
        <div className="relative overflow-hidden rounded-t-lg">
          {/* Product image */}
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="aspect-square bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
              <Heart className="h-12 w-12 text-pink-300" />
            </div>
          )}
          
          {/* Product badges */}
          <div className="absolute top-2 left-2 flex flex-col space-y-1">
            {product.featured && (
              <span className="bg-pink-600 text-white px-2 py-1 rounded text-xs font-semibold">
                Polecane
              </span>
            )}
            {!product.inStock && (
              <span className="bg-gray-600 text-white px-2 py-1 rounded text-xs font-semibold">
                Brak w magazynie
              </span>
            )}
            {product.originalPrice && (
              <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                -{Math.round((1 - product.price / product.originalPrice) * 100)}%
              </span>
            )}
          </div>

          {/* Wishlist button */}
          <button className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Heart className="h-4 w-4 text-gray-600 hover:text-pink-600" />
          </button>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
            {product.name}
          </h3>
          
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-pink-600">
                {product.price.toFixed(2)} zł
              </span>
              {product.originalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  {product.originalPrice.toFixed(2)} zł
                </span>
              )}
            </div>
            <button
              className="btn-primary px-3 py-1 text-sm flex items-center space-x-1"
              disabled={!product.inStock}
            >
              <ShoppingCart className="h-3 w-3" />
              <span>{product.inStock ? 'Dodaj' : 'Brak'}</span>
            </button>
          </div>
        </div>
      </Link>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-pink-600">Strona główna</Link>
          <span>/</span>
          <Link href="/produkty" className="hover:text-pink-600">Produkty</Link>
          <span>/</span>
          <span className="text-gray-900">{categoryInfo.name}</span>
        </nav>

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {categoryInfo.name}
          </h1>
          <p className="text-lg text-gray-600">
            {categoryInfo.description}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar filters */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              {/* Mobile filter toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden w-full btn-outline mb-4 flex items-center justify-center space-x-2"
              >
                <Filter className="h-4 w-4" />
                <span>Filtry</span>
                <ChevronDown className={`h-4 w-4 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>

              <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                {/* Price range */}
                <div className="card p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Zakres cen</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="Od"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({
                          ...priceRange,
                          min: Number(e.target.value) || 0
                        })}
                        className="input-field text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Do"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({
                          ...priceRange,
                          max: Number(e.target.value) || 1000
                        })}
                        className="input-field text-sm"
                      />
                    </div>
                    <button
                      onClick={() => setPriceRange({ min: 0, max: 1000 })}
                      className="text-sm text-pink-600 hover:text-pink-700"
                    >
                      Resetuj
                    </button>
                  </div>
                </div>

                {/* Quick links to other categories */}
                <div className="card p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Inne kategorie</h3>
                  <div className="space-y-2">
                    {Object.entries(categoryLabels).map(([slug, info]) => (
                      <Link
                        key={slug}
                        href={`/produkty/${slug}`}
                        className={`block px-3 py-2 rounded transition-colors duration-200 ${
                          slug === category.toLowerCase()
                            ? 'bg-pink-100 text-pink-800'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        {info.name}
                      </Link>
                    ))}
                    <Link
                      href="/produkty"
                      className="block px-3 py-2 rounded transition-colors duration-200 hover:bg-gray-100 text-gray-700 font-medium"
                    >
                      Wszystkie kategorie
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products grid */}
          <div className="lg:col-span-3">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {isLoading ? 'Ładowanie...' : `${filteredProducts.length} produktów`}
                </span>
              </div>

              <div className="flex items-center space-x-4">
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input-field text-sm"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                {/* View mode */}
                <div className="flex items-center space-x-1 bg-gray-200 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${
                      viewMode === 'grid'
                        ? 'bg-white shadow-sm'
                        : 'hover:bg-gray-300'
                    }`}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${
                      viewMode === 'list'
                        ? 'bg-white shadow-sm'
                        : 'hover:bg-gray-300'
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Loading state */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
                <p className="text-gray-600">Ładowanie produktów...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nie znaleziono produktów
                </h3>
                <p className="text-gray-600 mb-4">
                  W kategorii "{categoryInfo.name}" nie ma produktów spełniających wybrane kryteria
                </p>
                <div className="flex space-x-4 justify-center">
                  <button
                    onClick={() => setPriceRange({ min: 0, max: 1000 })}
                    className="btn-primary"
                  >
                    Wyczyść filtry
                  </button>
                  <Link href="/produkty" className="btn-outline">
                    Zobacz wszystkie produkty
                  </Link>
                </div>
              </div>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === 'grid'
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                  : 'grid-cols-1'
              }`}>
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}