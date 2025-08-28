'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { AuthService } from '@/lib/auth'
import { CategoryService } from '@/lib/category-service'
import CategoryForm from '@/components/CategoryForm'
import { ArrowLeft, Plus } from 'lucide-react'

export default function AddCategoryPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
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

  const handleSave = async (categoryData: any) => {
    setIsSaving(true)
    try {
      // Waliduj dane
      const validation = CategoryService.validateCategoryData(categoryData)
      if (!validation.isValid) {
        alert('Błędy walidacji:\n' + validation.errors.join('\n'))
        return
      }

      // Utwórz kategorię w Firebase
      const categoryId = await CategoryService.createCategory(categoryData)
      console.log('New category created:', categoryId)
      
      // Po zapisaniu przekieruj do listy kategorii
      router.push('/admin/categories?success=created&id=' + categoryId)
    } catch (error: any) {
      console.error('Error saving category:', error)
      alert(error.message || 'Nie udało się utworzyć kategorii')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    router.push('/admin/categories')
  }

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
              <h1 className="text-2xl font-bold text-gray-900">Dodaj nową kategorię</h1>
              <p className="text-gray-600">Utwórz nową kategorię produktów w systemie</p>
            </div>
          </div>
          <Link
            href="/admin/categories"
            className="btn-outline flex items-center space-x-2"
          >
            <span>Lista kategorii</span>
          </Link>
        </div>

        {/* Info box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Plus className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-blue-900 font-medium">Dodawanie nowej kategorii</h3>
              <p className="text-blue-700 text-sm mt-1">
                Nowa kategoria będzie zapisana w Firebase Firestore i dostępna natychmiast po utworzeniu. 
                Pamiętaj o wybraniu odpowiedniej grupy i podaniu jasnych przykładów produktów.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <CategoryForm 
          onSave={handleSave}
          onCancel={handleCancel}
          isLoading={isSaving}
        />
      </div>
    </div>
  )
}