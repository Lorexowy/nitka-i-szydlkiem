'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { AuthService } from '@/lib/auth'
import { 
  getAllCategoryGroups, 
  getCategoriesByGroup, 
  CATEGORIES,
  CategoryInfo,
  CategoryGroup 
} from '@/lib/categories'
import { 
  ArrowLeft,
  Grid3X3,
  Package,
  Eye,
  EyeOff,
  Edit,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Settings,
  Trash2
} from 'lucide-react'

export default function CategoriesManagementPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<string>('all')
  const [showInactive, setShowInactive] = useState(false)
  const router = useRouter()

  const categoryGroups = getAllCategoryGroups()
  const allCategories = Object.values(CATEGORIES)

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

  // Filter categories based on search and selected group
  const filteredCategories = allCategories.filter(category => {
    // Search filter
    const matchesSearch = category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         category.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Group filter
    const matchesGroup = selectedGroup === 'all' || category.group === selectedGroup
    
    // Active filter
    const matchesActiveFilter = showInactive || category.isActive
    
    return matchesSearch && matchesGroup && matchesActiveFilter
  })

  // Group filtered categories
  const groupedCategories = categoryGroups.reduce((acc, group) => {
    const groupCategories = filteredCategories.filter(cat => cat.group === group.id)
    if (groupCategories.length > 0) {
      acc[group.id] = {
        group,
        categories: groupCategories.sort((a, b) => a.sortOrder - b.sortOrder)
      }
    }
    return acc
  }, {} as Record<string, { group: CategoryGroup, categories: CategoryInfo[] }>)

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
              <h1 className="text-2xl font-bold text-gray-900">Zarządzanie kategoriami</h1>
              <p className="text-gray-600">Przeglądaj i zarządzaj kategoriami produktów</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href="/admin/categories/add"
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Dodaj kategorię</span>
            </Link>
            <Link
              href="/admin/dashboard"
              className="btn-outline flex items-center space-x-2"
            >
              <Settings className="h-4 w-4" />
              <span>Panel admin</span>
            </Link>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Grid3X3 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Wszystkie kategorie</p>
                <p className="text-2xl font-bold text-gray-900">{allCategories.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aktywne</p>
                <p className="text-2xl font-bold text-gray-900">
                  {allCategories.filter(cat => cat.isActive).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <EyeOff className="h-6 w-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Nieaktywne</p>
                <p className="text-2xl font-bold text-gray-900">
                  {allCategories.filter(cat => !cat.isActive).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Grupy kategorii</p>
                <p className="text-2xl font-bold text-gray-900">{categoryGroups.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Szukaj kategorii..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pl-10 w-full sm:w-64"
                />
              </div>

              {/* Group filter */}
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="input-field"
              >
                <option value="all">Wszystkie grupy</option>
                {categoryGroups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.icon} {group.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showInactive}
                  onChange={(e) => setShowInactive(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Pokaż nieaktywne</span>
              </label>
            </div>
          </div>
        </div>

        {/* Categories by groups */}
        <div className="space-y-8">
          {Object.entries(groupedCategories).length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nie znaleziono kategorii
              </h3>
              <p className="text-gray-600 mb-4">
                Spróbuj zmienić kryteria wyszukiwania lub filtry
              </p>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedGroup('all')
                  setShowInactive(false)
                }}
                className="btn-primary"
              >
                Wyczyść filtry
              </button>
            </div>
          ) : (
            Object.entries(groupedCategories).map(([groupId, { group, categories }]) => (
              <div key={groupId} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Group header */}
                <div className={`${group.color} text-white p-4`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{group.icon}</span>
                      <div>
                        <h2 className="text-xl font-bold">{group.name}</h2>
                        <p className="text-white/80">{group.description}</p>
                      </div>
                    </div>
                    <span className="text-white/80 text-sm">
                      {categories.length} kategorii
                    </span>
                  </div>
                </div>

                {/* Categories grid */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                          category.isActive ? 'border-gray-200' : 'border-red-200 bg-red-50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className={`font-semibold ${
                                category.isActive ? 'text-gray-900' : 'text-red-700'
                              }`}>
                                {category.name}
                              </h3>
                              {!category.isActive && (
                                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                                  Nieaktywna
                                </span>
                              )}
                            </div>
                            <p className={`text-sm mb-2 ${
                              category.isActive ? 'text-gray-600' : 'text-red-600'
                            }`}>
                              {category.description}
                            </p>
                            <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${category.color}`}>
                              ID: {category.id}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <Link
                              href={`/admin/categories/edit/${category.id}`}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Edytuj kategorię"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                            <button
                              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                              title="Więcej opcji"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="text-xs text-gray-500">
                          <p><strong>Przykłady:</strong></p>
                          <p>{category.examples.slice(0, 2).join(', ')}</p>
                          {category.examples.length > 2 && (
                            <p className="text-gray-400">
                              +{category.examples.length - 2} więcej
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quick actions */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Szybkie akcje</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/admin/categories/add"
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Plus className="h-6 w-6 text-blue-600" />
              <div>
                <h4 className="font-medium text-gray-900">Dodaj nową kategorię</h4>
                <p className="text-sm text-gray-600">Utwórz nową kategorię produktów</p>
              </div>
            </Link>

            <Link
              href="/admin/products"
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Package className="h-6 w-6 text-green-600" />
              <div>
                <h4 className="font-medium text-gray-900">Zarządzaj produktami</h4>
                <p className="text-sm text-gray-600">Przejdź do zarządzania produktami</p>
              </div>
            </Link>

            <Link
              href="/admin/categories/import"
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Grid3X3 className="h-6 w-6 text-purple-600" />
              <div>
                <h4 className="font-medium text-gray-900">Import/Export</h4>
                <p className="text-sm text-gray-600">Importuj lub eksportuj kategorie</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}