'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ProductService } from '@/lib/products'
import { Product } from '@/lib/firestore-types'
import { 
  Filter, 
  Grid3X3, 
  List, 
  Search,
  ChevronDown,
  Star,
  Heart,
  ShoppingCart
} from 'lucide-react'

const sortOptions = [
  { value: 'newest', label: 'Najnowsze' },
  { value: 'price-asc', label: 'Cena: od najniższej' },
  { value: 'price-desc', label: 'Cena: od najwyższej' },
  { value: 'rating', label: 'Najlepiej oceniane' },
  { value: 'name', label: 'Nazwa A-Z' },
]

function ProductsContent() {
  const searchParams = useSearchParams()
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState('wszystkie')
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 })
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [categories, setCategories] = useState([
    { id: 'wszystkie', name: 'Wszystkie kategorie', count: 0 }
  ])

  // Load all products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const products = await ProductService.getAllProducts()
        setAllProducts(products)
        setFilteredProducts(products)
        
        // Generate categories from products
        const categoryCount = products.reduce((acc: Record<string, number>, product) => {
          acc[product.category] = (acc[product.category] || 0) + 1
          return acc
        }, {})

        const dynamicCategories = [
          { id: 'wszystkie', name: 'Wszystkie kategorie', count: products.length },
          ...Object.entries(categoryCount).map(([key, count]) => ({
            id: key,
            name: key.charAt(0).toUpperCase() + key.slice(1),
            count: count as number
          }))
        ]
        
        setCategories(dynamicCategories)
      } catch (error) {
        console.error('Error loading products:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [])

  // Get search query from URL params
  useEffect(() => {
    const search = searchParams.get('search')
    if (search) {
      setSearchQuery(search)
    }
  }, [searchParams])

  // Filter and sort products
  useEffect(() => {
    let filtered = [...allProducts]

    // Filter by category
    if (selectedCategory !== 'wszystkie') {
      filtered = filtered.filter(product => product.category === selectedCategory)
    }

    // Filter by search query
    if (searchQuery) {
      const searchTerm = searchQuery.toLowerCase()
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm) ||
        product.materials.some(material => material.toLowerCase().includes(searchTerm))
      )
    }

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
        filtered.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds)
        break
    }

    setFilteredProducts(filtered)
  }, [allProducts, selectedCategory, sortBy, priceRange, searchQuery])

  const ProductCard = ({ product }: { product: Product }) => (
    <div className="card card-hover group">
      <Link href={`/produkty/szczegoly/${product.id}`}>
        <div className="relative overflow-hidden rounded-t-lg">
          {/* Product image */}
          {product.images.length > 0 ? (
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
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Nasze produkty
          </h1>
          <p className="text-lg text-gray-600">
            Odkryj naszą kolekcję ręcznie robionych produktów szydełkowych
          </p>
        </div>

        {/* Search bar */}
        {searchQuery && (
          <div className="mb-6 p-4 bg-pink-50 rounded-lg border border-pink-200">
            <p className="text-pink-800">
              Wyniki wyszukiwania dla: <strong>"{searchQuery}"</strong>
            </p>
            <p className="text-sm text-pink-600">
              Znaleziono {filteredProducts.length} produktów
            </p>
          </div>
        )}

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
                {/* Categories */}
                <div className="card p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Kategorie</h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full text-left px-3 py-2 rounded transition-colors duration-200 flex items-center justify-between ${
                          selectedCategory === category.id
                            ? 'bg-pink-100 text-pink-800'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <span>{category.name}</span>
                        <span className="text-sm text-gray-500">
                          ({category.count})
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

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
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nie znaleziono produktów
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery 
                    ? `Nie znaleziono produktów dla: "${searchQuery}"`
                    : 'Spróbuj zmienić kryteria wyszukiwania lub filtry'
                  }
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('wszystkie')
                    setPriceRange({ min: 0, max: 1000 })
                    setSearchQuery('')
                  }}
                  className="btn-primary"
                >
                  Wyczyść filtry
                </button>
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

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  )
}