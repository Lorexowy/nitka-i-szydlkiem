import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  Timestamp
} from 'firebase/firestore'
import { db } from './firebase'
import { CategoryInfo } from './categories'

// Dynamic Category Management Service
// Pozwala na zarządzanie kategoriami w Firebase, niezależnie od statycznych kategorii
export class CategoryService {
  private static readonly COLLECTION = 'categories'

  // Pobierz wszystkie kategorie z Firebase
  static async getAllCategoriesFromFirebase(): Promise<CategoryInfo[]> {
    try {
      const categoriesCollection = collection(db, this.COLLECTION)
      const snapshot = await getDocs(categoriesCollection)
      
      const categories = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as CategoryInfo))

      return categories.sort((a, b) => a.sortOrder - b.sortOrder)
    } catch (error) {
      console.error('Error fetching categories from Firebase:', error)
      return []
    }
  }

  // Pobierz kategorię po ID z Firebase
  static async getCategoryFromFirebase(id: string): Promise<CategoryInfo | null> {
    try {
      const categoryDoc = doc(db, this.COLLECTION, id)
      const snapshot = await getDoc(categoryDoc)
      
      if (!snapshot.exists()) {
        return null
      }

      return {
        id: snapshot.id,
        ...snapshot.data()
      } as CategoryInfo
    } catch (error) {
      console.error('Error fetching category from Firebase:', error)
      return null
    }
  }

  // Utwórz nową kategorię
  static async createCategory(categoryData: CategoryInfo): Promise<string> {
    try {
      // Sprawdź czy kategoria o takim ID już istnieje
      const existingCategory = await this.getCategoryFromFirebase(categoryData.id)
      if (existingCategory) {
        throw new Error(`Kategoria o ID "${categoryData.id}" już istnieje`)
      }

      const categoryDoc = doc(db, this.COLLECTION, categoryData.id)
      
      const dataToSave = {
        ...categoryData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }

      await setDoc(categoryDoc, dataToSave)
      
      console.log(`Category "${categoryData.name}" created successfully`)
      return categoryData.id
    } catch (error) {
      console.error('Error creating category:', error)
      throw new Error('Nie udało się utworzyć kategorii')
    }
  }

  // Aktualizuj istniejącą kategorię
  static async updateCategory(id: string, updates: Partial<CategoryInfo>): Promise<void> {
    try {
      const categoryDoc = doc(db, this.COLLECTION, id)
      
      // Sprawdź czy kategoria istnieje
      const existingCategory = await getDoc(categoryDoc)
      if (!existingCategory.exists()) {
        throw new Error(`Kategoria o ID "${id}" nie istnieje`)
      }

      // Usuń ID z updates (nie można go zmieniać)
      const { id: _, ...updatesWithoutId } = updates

      const dataToUpdate = {
        ...updatesWithoutId,
        updatedAt: Timestamp.now()
      }

      await updateDoc(categoryDoc, dataToUpdate)
      
      console.log(`Category "${id}" updated successfully`)
    } catch (error) {
      console.error('Error updating category:', error)
      throw new Error('Nie udało się zaktualizować kategorii')
    }
  }

  // Usuń kategorię
  static async deleteCategory(id: string): Promise<void> {
    try {
      // Sprawdź czy kategoria ma produkty
      const hasProducts = await this.checkIfCategoryHasProducts(id)
      if (hasProducts) {
        throw new Error('Nie można usunąć kategorii, która zawiera produkty')
      }

      const categoryDoc = doc(db, this.COLLECTION, id)
      await deleteDoc(categoryDoc)
      
      console.log(`Category "${id}" deleted successfully`)
    } catch (error) {
      console.error('Error deleting category:', error)
      throw new Error('Nie udało się usunąć kategorii')
    }
  }

  // Sprawdź czy kategoria ma produkty
  static async checkIfCategoryHasProducts(categoryId: string): Promise<boolean> {
    try {
      const productsCollection = collection(db, 'products')
      const q = query(productsCollection, where('category', '==', categoryId))
      const snapshot = await getDocs(q)
      
      return !snapshot.empty
    } catch (error) {
      console.error('Error checking products for category:', error)
      return false // W razie błędu pozwól na usunięcie
    }
  }

  // Pobierz produkty z kategorii
  static async getProductsInCategory(categoryId: string): Promise<number> {
    try {
      const productsCollection = collection(db, 'products')
      const q = query(productsCollection, where('category', '==', categoryId))
      const snapshot = await getDocs(q)
      
      return snapshot.size
    } catch (error) {
      console.error('Error counting products in category:', error)
      return 0
    }
  }

  // Zmień status aktywności kategorii
  static async toggleCategoryStatus(id: string, isActive: boolean): Promise<void> {
    try {
      await this.updateCategory(id, { isActive })
      console.log(`Category "${id}" ${isActive ? 'activated' : 'deactivated'}`)
    } catch (error) {
      console.error('Error toggling category status:', error)
      throw new Error('Nie udało się zmienić statusu kategorii')
    }
  }

  // Pobierz statystyki kategorii
  static async getCategoryStats() {
    try {
      const categories = await this.getAllCategoriesFromFirebase()
      
      const stats = {
        totalCategories: categories.length,
        activeCategories: categories.filter(cat => cat.isActive).length,
        inactiveCategories: categories.filter(cat => !cat.isActive).length,
        categoriesByGroup: categories.reduce((acc, cat) => {
          acc[cat.group] = (acc[cat.group] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      }

      return stats
    } catch (error) {
      console.error('Error getting category stats:', error)
      return {
        totalCategories: 0,
        activeCategories: 0,
        inactiveCategories: 0,
        categoriesByGroup: {}
      }
    }
  }

  // Importuj kategorie z pliku JSON
  static async importCategories(categories: CategoryInfo[]): Promise<{ success: number, errors: string[] }> {
    const results = { success: 0, errors: [] as string[] }

    for (const category of categories) {
      try {
        await this.createCategory(category)
        results.success++
      } catch (error: any) {
        results.errors.push(`${category.id}: ${error.message}`)
      }
    }

    return results
  }

  // Eksportuj kategorie do JSON
  static async exportCategories(): Promise<CategoryInfo[]> {
    try {
      return await this.getAllCategoriesFromFirebase()
    } catch (error) {
      console.error('Error exporting categories:', error)
      throw new Error('Nie udało się wyeksportować kategorii')
    }
  }

  // Waliduj dane kategorii
  static validateCategoryData(categoryData: Partial<CategoryInfo>): { isValid: boolean, errors: string[] } {
    const errors: string[] = []

    if (!categoryData.id || !/^[a-z_]+$/.test(categoryData.id)) {
      errors.push('ID kategorii może zawierać tylko małe litery i podkreślniki')
    }

    if (!categoryData.name || categoryData.name.trim().length === 0) {
      errors.push('Nazwa kategorii jest wymagana')
    }

    if (!categoryData.description || categoryData.description.trim().length === 0) {
      errors.push('Opis kategorii jest wymagany')
    }

    if (!categoryData.group) {
      errors.push('Grupa kategorii jest wymagana')
    }

    if (!categoryData.examples || categoryData.examples.filter(ex => ex.trim()).length === 0) {
      errors.push('Przynajmniej jeden przykład jest wymagany')
    }

    if (typeof categoryData.sortOrder !== 'number' || categoryData.sortOrder < 0) {
      errors.push('Kolejność sortowania musi być liczbą nieujemną')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Pobierz następny numer sortowania dla grupy
  static async getNextSortOrderForGroup(groupId: string): Promise<number> {
    try {
      const categories = await this.getAllCategoriesFromFirebase()
      const groupCategories = categories.filter(cat => cat.group === groupId)
      
      if (groupCategories.length === 0) return 1
      
      const maxSortOrder = Math.max(...groupCategories.map(cat => cat.sortOrder))
      return maxSortOrder + 1
    } catch (error) {
      console.error('Error getting next sort order:', error)
      return 1
    }
  }
}