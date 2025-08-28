'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { AuthService } from '@/lib/auth'
import CategoryForm from '@/components/CategoryForm'
import { getCategoryById, CategoryInfo } from '@/lib/categories'
import { CategoryService } from '@/lib/category-service'
import { ArrowLeft, Edit, Trash2, AlertTriangle } from 'lucide-react'

export default function EditCategoryPage() {
  const params = useParams()
  const id = params?.id as string
  
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [category, setCategory] = useState<CategoryInfo | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const router = useRouter()

  // Load category data
  useEffect(() => {
    const loadCategory = async () => {
      if (!id) return
      
      try {
        // Sprawdź najpierw w statycznych kategoriach
        let categoryData: CategoryInfo | null = getCategoryById(id) || null
        
        // Jeśli nie ma w statycznych, sprawdź w Firebase
        if (!categoryData) {
          try {
            const firebaseCategory = await CategoryService.getCategoryFromFirebase(id)
            categoryData = firebaseCategory
          } catch (firebaseError) {
            console.error('Error fetching from Firebase:', firebaseError)
            categoryData = null
          }
        }
        
        if (!categoryData) {
          router.push('/admin/categories?error=not-found')
          return
        }
        
        setCategory(categoryData)
      } catch (error) {
        console.error('Error loading category:', error)
        router.push('/admin/categories?error=load-failed')
      }
    }

    loadCategory()
  }, [id, router])

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

  const handleSave = async (categoryData: any) => {
    if (!id) return
    
    setIsSaving(true)
    try {
      // Waliduj dane
      const validation = CategoryService.validateCategoryData(categoryData)
      if (!validation.isValid) {
        alert('Błędy walidacji:\n' + validation.errors.join('\n'))
        return
      }

      // Aktualizuj kategorię w Firebase
      await CategoryService.updateCategory(id, categoryData)
      console.log('Category updated:', id)
      
      // Po zapisaniu przekieruj do listy kategorii
      router.push('/admin/categories?success=updated&id=' + id)
    } catch (error: any) {
      console.error('Error updating category:', error)
      alert(error.message || 'Nie udało się zaktualizować kategorii')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!id) return
    
    try {
      // Usuń kategorię z Firebase
      await CategoryService.deleteCategory(id)
      console.log('Category deleted:', id)
      
      router.push('/admin/categories?success=deleted&id=' + id)
    } catch (error: any) {
      console.error('Error deleting category:', error)
      alert(error.message || 'Nie udało się usunąć kategorii')
    }
  }

  const handleCancel = () => {
    router.push('/admin/categories')
  }

  // Loading states
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    )
  }

  if (!id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Nieprawidłowy parametr</h1>
          <p className="text-gray-600 mb-6">Nie podano ID kategorii do edycji</p>
          <Link href="/admin/categories" className="btn-primary">
            Powrót do listy kategorii
          </Link>
        </div>
      </div>
    )
  }

  if (!isAdmin || !category) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link
              href="/admin/categories"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edytuj kategorię</h1>
              <p className="text-gray-600">Modyfikuj ustawienia kategorii: {category.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="btn-outline text-red-600 border-red-300 hover:bg-red-50 flex items-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Usuń kategorię</span>
            </button>
            <Link
              href="/admin/categories"
              className="btn-outline"
            >
              <span>Lista kategorii</span>
            </Link>
          </div>
        </div>

        {/* Category info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Edit className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="text-yellow-900 font-medium">Edycja kategorii</h3>
              <p className="text-yellow-700 text-sm mt-1">
                Zmiany w kategorii będą zapisane w Firebase i widoczne natychmiast. 
                Pamiętaj, że zmiana ID kategorii nie jest możliwa.
              </p>
              <div className="mt-2 text-xs text-yellow-600">
                <strong>Aktualna kategoria:</strong> {category.name} (ID: {category.id})
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <CategoryForm 
          category={category}
          onSave={handleSave}
          onCancel={handleCancel}
          isLoading={isSaving}
        />

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
                    Usuń kategorię
                  </h3>
                </div>
              </div>
              
              <p className="text-gray-600 mb-6">
                Czy na pewno chcesz usunąć kategorię <strong>"{category.name}"</strong>? 
                Ta akcja jest nieodwracalna.
              </p>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
                <p className="text-red-700 text-sm">
                  <strong>Ostrzeżenie:</strong> Upewnij się, że żadne produkty nie używają tej kategorii.
                  W przeciwnym razie produkty mogą zostać uszkodzone.
                </p>
              </div>

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
                    handleDelete()
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Usuń kategorię
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}