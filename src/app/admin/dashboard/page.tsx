'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { AuthService } from '@/lib/auth'
import { ProductService } from '@/lib/products'
import { 
  Package, 
  Users, 
  ShoppingCart, 
  TrendingUp,
  Plus,
  Edit,
  Eye,
  Trash2,
  LogOut,
  Settings
} from 'lucide-react'

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [products, setProducts] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0
  })
  const router = useRouter()

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
      
      // Załaduj produkty
      try {
        const productsData = await ProductService.getAllProducts()
        setProducts(productsData)
        setStats(prev => ({
          ...prev,
          totalProducts: productsData.length
        }))
      } catch (error) {
        console.error('Error loading products:', error)
      }
      
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  const handleLogout = async () => {
    try {
      await AuthService.logoutUser()
      router.push('/admin/login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Czy na pewno chcesz usunąć ten produkt?')) return

    try {
      await ProductService.deleteProduct(productId)
      setProducts(prev => prev.filter(p => p.id !== productId))
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Nie udało się usunąć produktu')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-600">Ładowanie panelu administratora...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null // Redirect handled in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Panel Administratora</h1>
              <p className="text-gray-600">Zarządzaj swoim sklepem</p>
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
        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Produkty</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Zamówienia</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Użytkownicy</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Przychód</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRevenue.toFixed(2)} zł</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Szybkie akcje</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/admin/products/add"
              className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Plus className="h-6 w-6 text-blue-600" />
              <span className="font-medium text-blue-900">Dodaj produkt</span>
            </Link>

            <Link
              href="/admin/products"
              className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <Package className="h-6 w-6 text-green-600" />
              <span className="font-medium text-green-900">Zarządzaj produktami</span>
            </Link>

            <Link
              href="/admin/orders"
              className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <ShoppingCart className="h-6 w-6 text-purple-600" />
              <span className="font-medium text-purple-900">Zamówienia</span>
            </Link>

            <Link
              href="/admin/settings"
              className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
            >
              <Settings className="h-6 w-6 text-yellow-600" />
              <span className="font-medium text-yellow-900">Ustawienia</span>
            </Link>
          </div>
        </div>

        {/* Recent products */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Ostatnie produkty</h2>
            <Link
              href="/admin/products/add"
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Dodaj nowy</span>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
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
                    Akcje
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.slice(0, 5).map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg flex items-center justify-center mr-4">
                          <Package className="h-5 w-5 text-pink-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {product.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.price.toFixed(2)} zł
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.inStock 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.inStock ? `W magazynie (${product.stockQuantity})` : 'Brak w magazynie'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
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
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {products.length === 0 && (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Brak produktów
                </h3>
                <p className="text-gray-600 mb-4">
                  Zacznij od dodania pierwszego produktu do swojego sklepu
                </p>
                <Link href="/admin/products/add" className="btn-primary">
                  Dodaj pierwszy produkt
                </Link>
              </div>
            )}

            {products.length > 5 && (
              <div className="px-6 py-4 bg-gray-50 text-center">
                <Link
                  href="/admin/products"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Zobacz wszystkie produkty ({products.length})
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}