import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  startAfter,
  Timestamp,
  QueryDocumentSnapshot
} from 'firebase/firestore'
import { db } from './firebase'
import { Product } from './firestore-types'

// Product CRUD operations
export class ProductService {
  private static readonly COLLECTION = 'products'

  // Pobierz wszystkie produkty
  static async getAllProducts(): Promise<Product[]> {
    try {
      const productsCollection = collection(db, this.COLLECTION)
      
      // Prosty query bez sortowania aby uniknąć problemów z indeksami
      const snapshot = await getDocs(productsCollection)
      
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product))

      // Sortuj lokalnie po dacie utworzenia (od najnowszych)
      return products.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return b.createdAt.seconds - a.createdAt.seconds
        }
        return 0
      })
    } catch (error) {
      console.error('Error fetching products:', error)
      return []
    }
  }

  // Pobierz produkty z kategorii
  static async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const productsCollection = collection(db, this.COLLECTION)
      
      // Prosty query tylko z filtrem kategorii
      const q = query(
        productsCollection, 
        where('category', '==', category)
      )
      const snapshot = await getDocs(q)
      
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product))

      // Sortuj lokalnie
      return products.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return b.createdAt.seconds - a.createdAt.seconds
        }
        return 0
      })
    } catch (error) {
      console.error('Error fetching products by category:', error)
      
      // Fallback: pobierz wszystkie i filtruj lokalnie
      try {
        const allProducts = await this.getAllProducts()
        return allProducts.filter(product => product.category === category)
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError)
        throw new Error('Nie udało się pobrać produktów z kategorii')
      }
    }
  }

  // Pobierz polecane produkty
  static async getFeaturedProducts(limitCount: number = 6): Promise<Product[]> {
    try {
      // Najpierw pobierz wszystkie produkty
      const allProducts = await this.getAllProducts()
      
      // Filtruj lokalnie
      const featuredProducts = allProducts.filter(product => 
        product.featured && product.inStock
      )

      // Zwróć ograniczoną liczbę
      return featuredProducts.slice(0, limitCount)
    } catch (error) {
      console.error('Error fetching featured products:', error)
      
      // Final fallback: zwróć puste
      return []
    }
  }

  // Pobierz produkty z paginacją - uproszczona wersja
  static async getProductsPaginated(
    pageSize: number = 12, 
    lastDoc?: QueryDocumentSnapshot
  ): Promise<{ products: Product[], lastDoc?: QueryDocumentSnapshot }> {
    try {
      // Na razie używaj getAllProducts i paginuj lokalnie
      const allProducts = await this.getAllProducts()
      const products = allProducts.slice(0, pageSize)

      return {
        products,
        lastDoc: undefined // Tymczasowo wyłącz paginację
      }
    } catch (error) {
      console.error('Error fetching paginated products:', error)
      throw new Error('Nie udało się pobrać produktów')
    }
  }

  // Pobierz pojedynczy produkt
  static async getProductById(id: string): Promise<Product | null> {
    try {
      const productDoc = doc(db, this.COLLECTION, id)
      const snapshot = await getDoc(productDoc)
      
      if (!snapshot.exists()) {
        return null
      }

      return {
        id: snapshot.id,
        ...snapshot.data()
      } as Product
    } catch (error) {
      console.error('Error fetching product:', error)
      throw new Error('Nie udało się pobrać produktu')
    }
  }

  // Wyszukaj produkty
  static async searchProducts(searchQuery: string): Promise<Product[]> {
    try {
      // Pobierz wszystkie produkty i filtruj lokalnie
      const allProducts = await this.getAllProducts()
      
      const searchTerm = searchQuery.toLowerCase()
      return allProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm) ||
        product.materials.some(material => material.toLowerCase().includes(searchTerm))
      )
    } catch (error) {
      console.error('Error searching products:', error)
      throw new Error('Nie udało się wyszukać produktów')
    }
  }

  // ADMIN FUNCTIONS - tylko dla adminów

  // Dodaj nowy produkt
  static async createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const productsCollection = collection(db, this.COLLECTION)
      const now = Timestamp.now()
      
      // Filtruj undefined wartości
      const cleanData = Object.fromEntries(
        Object.entries(productData).filter(([_, value]) => value !== undefined)
      )
      
      const docRef = await addDoc(productsCollection, {
        ...cleanData,
        createdAt: now,
        updatedAt: now
      })

      return docRef.id
    } catch (error) {
      console.error('Error creating product:', error)
      throw new Error('Nie udało się utworzyć produktu')
    }
  }

  // Aktualizuj produkt
  static async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    try {
      const productDoc = doc(db, this.COLLECTION, id)
      
      // Filtruj undefined wartości
      const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, value]) => value !== undefined)
      )
      
      await updateDoc(productDoc, {
        ...cleanUpdates,
        updatedAt: Timestamp.now()
      })
    } catch (error) {
      console.error('Error updating product:', error)
      throw new Error('Nie udało się zaktualizować produktu')
    }
  }

  // Usuń produkt
  static async deleteProduct(id: string): Promise<void> {
    try {
      const productDoc = doc(db, this.COLLECTION, id)
      await deleteDoc(productDoc)
    } catch (error) {
      console.error('Error deleting product:', error)
      throw new Error('Nie udało się usunąć produktu')
    }
  }

  // Aktualizuj stan magazynowy
  static async updateStock(id: string, quantity: number): Promise<void> {
    try {
      const productDoc = doc(db, this.COLLECTION, id)
      await updateDoc(productDoc, {
        stockQuantity: quantity,
        inStock: quantity > 0,
        updatedAt: Timestamp.now()
      })
    } catch (error) {
      console.error('Error updating stock:', error)
      throw new Error('Nie udało się zaktualizować stanu magazynowego')
    }
  }

  // Pobierz statystyki dla dashboardu
  static async getProductStats(): Promise<{
    totalProducts: number
    inStockProducts: number
    outOfStockProducts: number
    featuredProducts: number
  }> {
    try {
      const allProducts = await this.getAllProducts()
      
      return {
        totalProducts: allProducts.length,
        inStockProducts: allProducts.filter(p => p.inStock).length,
        outOfStockProducts: allProducts.filter(p => !p.inStock).length,
        featuredProducts: allProducts.filter(p => p.featured).length
      }
    } catch (error) {
      console.error('Error getting product stats:', error)
      return {
        totalProducts: 0,
        inStockProducts: 0,
        outOfStockProducts: 0,
        featuredProducts: 0
      }
    }
  }
}