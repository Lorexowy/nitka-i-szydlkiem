'use client'

import { useState } from 'react'
import { getAllCategoryGroups, CATEGORIES, CategoryInfo } from '@/lib/categories'
import { CategoryService } from '@/lib/category-service'
import { Save, X, Info, Package } from 'lucide-react'

interface CategoryFormProps {
  category?: CategoryInfo
  onSave: (categoryData: Partial<CategoryInfo>) => void
  onCancel: () => void
  isLoading?: boolean
}

const colorOptions = [
  { value: 'bg-pink-100 text-pink-800', label: 'Różowy', preview: 'bg-pink-500' },
  { value: 'bg-blue-100 text-blue-800', label: 'Niebieski', preview: 'bg-blue-500' },
  { value: 'bg-green-100 text-green-800', label: 'Zielony', preview: 'bg-green-500' },
  { value: 'bg-yellow-100 text-yellow-800', label: 'Żółty', preview: 'bg-yellow-500' },
  { value: 'bg-purple-100 text-purple-800', label: 'Fioletowy', preview: 'bg-purple-500' },
  { value: 'bg-red-100 text-red-800', label: 'Czerwony', preview: 'bg-red-500' },
  { value: 'bg-indigo-100 text-indigo-800', label: 'Indygo', preview: 'bg-indigo-500' },
  { value: 'bg-teal-100 text-teal-800', label: 'Morski', preview: 'bg-teal-500' },
  { value: 'bg-orange-100 text-orange-800', label: 'Pomarańczowy', preview: 'bg-orange-500' },
  { value: 'bg-gray-100 text-gray-800', label: 'Szary', preview: 'bg-gray-500' }
]

export default function CategoryForm({ category, onSave, onCancel, isLoading = false }: CategoryFormProps) {
  const [formData, setFormData] = useState({
    id: category?.id || '',
    name: category?.name || '',
    description: category?.description || '',
    group: category?.group || 'akcesoria',
    color: category?.color || 'bg-blue-100 text-blue-800',
    examples: category?.examples || [''],
    isActive: category?.isActive ?? true,
    sortOrder: category?.sortOrder || 0
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isValidating, setIsValidating] = useState(false)
  const categoryGroups = getAllCategoryGroups()

  const validateForm = async () => {
    setIsValidating(true)
    const newErrors: Record<string, string> = {}

    try {
      if (!formData.id.trim()) {
        newErrors.id = 'ID kategorii jest wymagane'
      } else if (!/^[a-z_]+$/.test(formData.id)) {
        newErrors.id = 'ID może zawierać tylko małe litery i podkreślniki'
      } else if (!category) {
        // Sprawdź w statycznych kategoriach
        if (CATEGORIES[formData.id]) {
          newErrors.id = 'Kategoria o tym ID już istnieje w systemie'
        } else {
          // Sprawdź w Firebase
          try {
            const existingCategory = await CategoryService.getCategoryFromFirebase(formData.id)
            if (existingCategory) {
              newErrors.id = 'Kategoria o tym ID już istnieje w bazie danych'
            }
          } catch (error) {
            console.warn('Could not check existing categories:', error)
          }
        }
      }

      if (!formData.name.trim()) {
        newErrors.name = 'Nazwa kategorii jest wymagana'
      }

      if (!formData.description.trim()) {
        newErrors.description = 'Opis kategorii jest wymagany'
      }

      const validExamples = formData.examples.filter(ex => ex.trim())
      if (validExamples.length === 0) {
        newErrors.examples = 'Dodaj przynajmniej jeden przykład produktu'
      }

      setErrors(newErrors)
      return Object.keys(newErrors).length === 0
    } finally {
      setIsValidating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!(await validateForm())) return

    const categoryData = {
      ...formData,
      examples: formData.examples.filter(ex => ex.trim()),
      sortOrder: Math.max(0, formData.sortOrder)
    }

    onSave(categoryData)
  }

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const addExample = () => {
    setFormData(prev => ({
      ...prev,
      examples: [...prev.examples, '']
    }))
  }

  const updateExample = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      examples: prev.examples.map((ex, i) => i === index ? value : ex)
    }))
  }

  const removeExample = (index: number) => {
    if (formData.examples.length > 1) {
      setFormData(prev => ({
        ...prev,
        examples: prev.examples.filter((_, i) => i !== index)
      }))
    }
  }

  const selectedGroup = categoryGroups.find(g => g.id === formData.group)
  const selectedColor = colorOptions.find(c => c.value === formData.color)

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Podstawowe informacje</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="id" className="block text-sm font-medium text-gray-700 mb-1">
                ID kategorii *
              </label>
              <input
                type="text"
                id="id"
                value={formData.id}
                onChange={(e) => updateField('id', e.target.value.toLowerCase())}
                className={`input-field ${errors.id ? 'border-red-300' : ''}`}
                placeholder="np. nowa_kategoria"
                disabled={!!category} // Nie można zmieniać ID istniejącej kategorii
              />
              {errors.id && <p className="text-red-600 text-sm mt-1">{errors.id}</p>}
              <p className="text-xs text-gray-500 mt-1">
                Tylko małe litery i podkreślniki. Nie można zmienić po utworzeniu.
              </p>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nazwa kategorii *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                className={`input-field ${errors.name ? 'border-red-300' : ''}`}
                placeholder="np. Nowa kategoria"
              />
              {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Opis kategorii *
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                rows={3}
                className={`input-field ${errors.description ? 'border-red-300' : ''}`}
                placeholder="Krótki opis kategorii produktów"
              />
              {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
            </div>
          </div>
        </div>

        {/* Group and Appearance */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Grupa i wygląd</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="group" className="block text-sm font-medium text-gray-700 mb-1">
                Grupa kategorii *
              </label>
              <select
                id="group"
                value={formData.group}
                onChange={(e) => updateField('group', e.target.value)}
                className="input-field"
              >
                {categoryGroups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.icon} {group.name}
                  </option>
                ))}
              </select>
              {selectedGroup && (
                <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">{selectedGroup.description}</p>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
                Kolor kategorii
              </label>
              <select
                id="color"
                value={formData.color}
                onChange={(e) => updateField('color', e.target.value)}
                className="input-field"
              >
                {colorOptions.map((color) => (
                  <option key={color.value} value={color.value}>
                    {color.label}
                  </option>
                ))}
              </select>
              {selectedColor && (
                <div className="mt-2 flex items-center space-x-2">
                  <div className={`w-4 h-4 ${selectedColor.preview} rounded`}></div>
                  <span className={`text-sm px-2 py-1 rounded-full ${formData.color}`}>
                    Podgląd koloru
                  </span>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700 mb-1">
                Kolejność sortowania
              </label>
              <input
                type="number"
                id="sortOrder"
                min="0"
                value={formData.sortOrder}
                onChange={(e) => updateField('sortOrder', parseInt(e.target.value) || 0)}
                className="input-field"
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                Mniejsza liczba = wyższe miejsce na liście
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => updateField('isActive', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Kategoria aktywna</span>
              </label>
            </div>
          </div>
        </div>

        {/* Examples */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Przykłady produktów</h3>
          
          <div className="space-y-3">
            {formData.examples.map((example, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={example}
                  onChange={(e) => updateExample(index, e.target.value)}
                  className="input-field flex-1"
                  placeholder="np. Szydełkowa torba na zakupy"
                />
                {formData.examples.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeExample(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            
            {errors.examples && <p className="text-red-600 text-sm">{errors.examples}</p>}
            
            <button
              type="button"
              onClick={addExample}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              + Dodaj przykład
            </button>
          </div>

          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <Info className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-800 font-medium">Wskazówka</p>
                <p className="text-xs text-yellow-700 mt-1">
                  Przykłady pomagają użytkownikom zrozumieć, jakie produkty znajdą w tej kategorii.
                  Dodaj 2-4 konkretne przykłady.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Podgląd kategorii</h3>
          
          <div className={`border rounded-lg p-4 ${formData.color}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-semibold mb-1">
                  {formData.name || 'Nazwa kategorii'}
                </h4>
                <p className="text-sm mb-2 opacity-80">
                  {formData.description || 'Opis kategorii'}
                </p>
                <div className="text-xs opacity-60">
                  ID: {formData.id || 'id_kategorii'}
                </div>
              </div>
            </div>

            <div className="text-xs opacity-70">
              <p><strong>Przykłady:</strong></p>
              <p>
                {formData.examples.filter(ex => ex.trim()).slice(0, 2).join(', ') || 'Brak przykładów'}
              </p>
            </div>
          </div>
        </div>

        {/* Submit buttons */}
        <div className="flex items-center justify-between bg-white rounded-lg shadow-md p-6">
          <button
            type="button"
            onClick={onCancel}
            className="btn-outline"
            disabled={isLoading}
          >
            Anuluj
          </button>

          <button
            type="submit"
            disabled={isLoading || isValidating}
            className="btn-primary flex items-center space-x-2"
          >
            {isLoading || isValidating ? (
              <>
                <div className="loading-spinner"></div>
                <span>
                  {isValidating ? 'Sprawdzanie...' : 'Zapisywanie...'}
                </span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>{category ? 'Aktualizuj kategorię' : 'Utwórz kategorię'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}