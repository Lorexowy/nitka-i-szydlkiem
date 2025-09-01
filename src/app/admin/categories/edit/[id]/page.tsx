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
import { useToast } from '@/contexts/ToastContext'
import { useConfirmation } from '@/hooks/useConfirmation'
import ConfirmationModal from '@/components/ConfirmationModal'
import { ArrowLeft, Edit, Trash2, AlertTriangle } from 'lucide-react'

export default function EditCategoryPage() {
  const params = useParams()
  const id = params?.id as string
  
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [category, setCategory] = useState<CategoryInfo | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const { showSuccess, showError, showWarning, showInfo } = useToast()
  const { confirmation, confirm, closeConfirmation } = useConfirmation()

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
          showError('Kategoria nie znaleziona', 'Nie można znaleźć kategorii o podanym ID. Możliwe, że została usunięta.')
          router.push('/admin/categories?error=not-found')
          return
        }
        
        setCategory(categoryData)
      } catch (error) {
        console.error('Error loading category:', error)
        showError('Błąd ładowania', 'Nie udało się załadować danych kategorii. Sprawdź połączenie i spróbuj ponownie.')
        router.push('/admin/categories?error=load-failed')
      }
    }

    loadCategory()
  }, [id, router, showError])

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
        const errorMessage = validation.errors.length === 1 
          ? validation.errors[0]
          : `Znaleziono ${validation.errors.length} błędów walidacji`
        
        const detailMessage = validation.errors.length === 1 
          ? undefined
          : validation.errors.join(' • ')

        showError('Błędy walidacji', detailMessage || errorMessage)
        return
      }

      // Aktualizuj kategorię w Firebase
      await CategoryService.updateCategory(id, categoryData)
      console.log('Category updated:', id)
      
      showSuccess(
        'Kategoria zaktualizowana!',
        `Kategoria "${categoryData.name}" została pomyślnie zaktualizowana i zmiany są widoczne w całym systemie.`
      )
      
      // Po zapisaniu przekieruj do listy kategorii z opóźnieniem
      setTimeout(() => {
        router.push('/admin/categories?success=updated&id=' + id)
      }, 1500)
    } catch (error: any) {
      console.error('Error updating category:', error)
      showError(
        'Błąd podczas aktualizacji',
        error.message || 'Nie udało się zaktualizować kategorii. Sprawdź dane i spróbuj ponownie.'
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!id || !category) return
    
    const confirmed = await confirm({
      title: 'Usuń kategorię',
      message: `Czy na pewno chcesz usunąć kategorię "${category.name}"? Ta akcja jest nieodwracalna i może wpłynąć na produkty używające tej kategorii.`,
      confirmText: 'Usuń kategorię',
      cancelText: 'Anuluj',
      type: 'danger'
    })

    if (!confirmed) return

    setIsDeleting(true)
    
    try {
      // Usuń kategorię z Firebase
      await CategoryService.deleteCategory(id)
      console.log('Category deleted:', id)
      
      showSuccess(
        'Kategoria usunięta!',
        `Kategoria "${category.name}" została pomyślnie usunięta z systemu.`
      )
      
      // Przekieruj po krótkim opóźnieniu
      setTimeout(() => {
        router.push('/admin/categories?success=deleted&id=' + id)
      }, 1500)
    } catch (error: any) {
      console.error('Error deleting category:', error)
      showError(
        'Błąd podczas usuwania',
        error.message || 'Nie udało się usunąć kategorii. Upewnij się, że żadne produkty nie używają tej kategorii.'
      )
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancel = async () => {
    const confirmed = await confirm({
      title: 'Odrzucić zmiany?',
      message: 'Czy na pewno chcesz opuścić tę stronę? Wszystkie niezapisane zmiany zostaną utracone.',
      confirmText: 'Tak, odrzuć',
      cancelText: 'Zostań tutaj', 
      type: 'warning'
    })

    if (confirmed) {
      router.push('/admin/categories')
    }
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
              onClick={handleDelete}
              disabled={isDeleting}
              className="btn-outline text-red-600 border-red-300 hover:bg-red-50 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Usuwanie...</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  <span>Usuń kategorię</span>
                </>
              )}
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