'use client'

import { useState, useEffect } from 'react'
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
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Eye,
  Trash2,
  Package,
  Star,
  ShoppingCart,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Grid3X3,
  List
} from 'lucide-react'

const sortOptions = [
  { value: 'newest', label: 'Najnowsze' },
  { value: 'oldest', label: 'Najstarsze' },
  { value: 'name-asc', label: 'Nazwa A-Z' },
  { value: 'name-desc', label: 'Nazwa Z-A' },
  { value: 'price-asc', label: 'Cena rosnąco' },
  { value: 'price-desc', label: 'Cena malejąco' },
  { value: 'stock-asc', label: 'Stan magazynowy rosnąco' },
  { value: 'stock-desc', label: 'Stan magazynowy malejąco' }
]

export default function AdminProductsPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('wszystkie')
  const [selectedStatus, setSelectedStatus] = useState('wszystkie')
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
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

  // Load products
  useEffect(() => {
    const loadProducts = async () => {
      if (!isAdmin) return
      
      try {
        const productsData = await ProductService.getAllProducts()
        setProducts(productsData)
        setFilteredProducts(productsData)
      } catch (error) {
        console.error('Error loading products:', error)
      }
    }

    loadProducts()
  }, [isAdmin])

  // Filter and sort products
  useEffect(() => {
    let filtered = [...products]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.id.toLowerCase().includes(query)
      )
    }

    // Category filter
    if (selectedCategory !== 'wszystkie') {
      filtered = filtered.filter(product => product.category === selectedCategory)
    }

    // Status filter
    if (selectedStatus !== 'wszystkie') {
      switch (selectedStatus) {
        case 'in-stock':
          filtered = filtered.filter(product => product.inStock)
          break
        case 'out-of-stock':
          filtered = filtered.filter(product => !product.inStock)
          break
        case 'featured':
          filtered = filtered.filter(product => product.featured)
          break
        case 'low-stock':
          filtered = filtered.filter(product => product.inStock && product.stockQuantity < 5)
          break
      }
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return b.createdAt.seconds - a.createdAt.seconds
          }
          return 0
        })
        break
      case 'oldest':
        filtered.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return a.createdAt.seconds - b.createdAt.seconds
          }
          return 0
        })
        break
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'name-desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name))
        break
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'stock-asc':
        filtered.sort((a, b) => a.stockQuantity - b.stockQuantity)
        break
      case 'stock-desc':
        filtered.sort((a, b) => b.stockQuantity - a.stockQuantity)
        break
    }

    setFilteredProducts(filtered)
  }, [products, searchQuery, selectedCategory, selectedStatus, sortBy])

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!confirm(`Czy na pewno chcesz usunąć produkt "${productName}"?`)) return

    try {
      await ProductService.deleteProduct(productId)
      setProducts(prev => prev.filter(p => p.id !== productId))
      alert('Produkt został usunięty')
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Nie udało się usunąć produktu')
    }
  }

  const handleBulkAction = async (action: string) => {
    if (selectedProducts.length === 0) {
      alert('Wybierz produkty do wykonania akcji')
      return
    }

    const confirmed = confirm(`Czy na pewno chcesz wykonać akcję "${action}" na ${selectedProducts.length} produktach?`)
    if (!confirmed) return

    try {
      switch (action) {
        case 'delete':
          for (const productId of selectedProducts) {
            await ProductService.deleteProduct(productId)
          }
          setProducts(prev => prev.filter(p => !selectedProducts.includes(p.id)))
          break
        case 'feature':
          for (const productId of selectedProducts) {
            await ProductService.updateProduct(productId, { featured: true })
          }
          setProducts(prev => prev.map(p => 
            selectedProducts.includes(p.id) ? { ...p, featured: true } : p
          ))
          break
        case 'unfeature':
          for (const productId of selectedProducts) {
            await ProductService.updateProduct(productId, { featured: false })
          }
          setProducts(prev => prev.map(p => 
            selectedProducts.includes(p.id) ? { ...p, featured: false } : p
          ))
          break
      }
      
      setSelectedProducts([])
      alert('Akcja została wykonana pomyślnie')
    } catch (error) {
      console.error('Bulk action error:', error)
      alert('Nie udało się wykonać akcji')
    }
  }

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const selectAllProducts = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id))
    }
  }

  // Get unique categories from products
  const categories = Array.from(new Set(products.map(p => p.category)))

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <h1 className="text-2xl font-bold text-gray-900">Zarządzanie produktami</h1>
              <p className="text-gray-600">
                {filteredProducts.length} z {products.length} produktów
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href="/admin/categories"
              className="btn-outline flex items-center space-x-2"
            >
              <Grid3X3 className="h-4 w-4" />
              <span>Kategorie</span>
            </Link>
            <Link
              href="/admin/products/add"
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Dodaj produkt</span>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Szukaj produktów..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pl-10 w-full sm:w-64"
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-outline flex items-center space-x-2"
              >
                <Filter className="h-4 w-4" />
                <span>Filtry</span>
              </button>
            </div>

            {/* View mode and sort */}
            <div className="flex items-center space-x-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-field text-sm"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <div className="flex items-center space-x-1 bg-gray-200 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded ${viewMode === 'table' ? 'bg-white shadow-sm' : 'hover:bg-gray-300'}`}
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-300'}`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Extended filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategoria
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="input-field"
                  >
                    <option value="wszystkie">Wszystkie kategorie</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {getCategoryById(category)?.name || category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="input-field"
                  >
                    <option value="wszystkie">Wszystkie statusy</option>
                    <option value="in-stock">W magazynie</option>
                    <option value="out-of-stock">Brak w magazynie</option>
                    <option value="low-stock">Niski stan (poniżej 5)</option>
                    <option value="featured">Polecane</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setSelectedCategory('wszystkie')
                      setSelectedStatus('wszystkie')
                    }}
                    className="btn-outline w-full"
                  >
                    Wyczyść filtry
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bulk actions */}
        {selectedProducts.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-blue-800">
                Wybrano {selectedProducts.length} produktów
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleBulkAction('feature')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Oznacz jako polecane
                </button>
                <button
                  onClick={() => handleBulkAction('unfeature')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Usuń z polecanych
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Usuń wybrane
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Products table */}
        {viewMode === 'table' ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                      onChange={selectAllProducts}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produkt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cena
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Akcje
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => toggleProductSelection(product.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-12 w-12 flex-shrink-0">
                          {product.images.length > 0 ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="h-12 w-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                              <Package className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 line-clamp-1">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {product.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        {getCategoryById(product.category)?.name || product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {product.price.toFixed(2)} zł
                      </div>
                      {product.originalPrice && (
                        <div className="text-sm text-gray-500 line-through">
                          {product.originalPrice.toFixed(2)} zł
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {product.inStock ? (
                          <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        <span className="text-sm text-gray-900">
                          {product.stockQuantity} szt.
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {product.featured && (
                          <Star className="h-4 w-4 text-yellow-500" />
                        )}
                        {!product.inStock && (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                        {product.inStock && product.stockQuantity < 5 && (
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/admin/products/view/${product.id}`}
                          className="text-blue-600 hover:text-blue-900"
                          title="Podgląd"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/products/edit/${product.id}`}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Edytuj"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteProduct(product.id, product.name)}
                          className="text-red-600 hover:text-red-900"
                          title="Usuń"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Brak produktów
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery || selectedCategory !== 'wszystkie' || selectedStatus !== 'wszystkie'
                    ? 'Nie znaleziono produktów spełniających kryteria wyszukiwania'
                    : 'Zacznij od dodania pierwszego produktu'
                  }
                </p>
                <Link href="/admin/products/add" className="btn-primary">
                  Dodaj pierwszy produkt
                </Link>
              </div>
            )}
          </div>
        ) : (
          // Grid view
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative">
                  {product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <Package className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  
                  <div className="absolute top-2 left-2">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => toggleProductSelection(product.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>

                  <div className="absolute top-2 right-2 flex flex-col space-y-1">
                    {product.featured && (
                      <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs">
                        Polecane
                      </span>
                    )}
                    {!product.inStock && (
                      <span className="bg-red-500 text-white px-2 py-1 rounded text-xs">
                        Brak
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {getCategoryById(product.category)?.name || product.category}
                  </p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-gray-900">
                      {product.price.toFixed(2)} zł
                    </span>
                    <span className="text-sm text-gray-600">
                      {product.stockQuantity} szt.
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/admin/products/view/${product.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/admin/products/edit/${product.id}`}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteProduct(product.id, product.name)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}