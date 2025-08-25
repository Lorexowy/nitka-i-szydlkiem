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
      
      // Spróbuj z orderBy
      try {
        const q = query(productsCollection, orderBy('createdAt', 'desc'))
        const snapshot = await getDocs(q)
        
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Product))
      } catch (orderError) {
        console.log('OrderBy failed, getting all products without order')
        
        // Fallback: pobierz bez sortowania
        const snapshot = await getDocs(productsCollection)
        
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Product))
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      return []
    }
  }

  // Pobierz produkty z paginacją
  static async getProductsPaginated(
    pageSize: number = 12, 
    lastDoc?: QueryDocumentSnapshot
  ): Promise<{ products: Product[], lastDoc?: QueryDocumentSnapshot }> {
    try {
      const productsCollection = collection(db, this.COLLECTION)
      let q = query(
        productsCollection, 
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      )

      if (lastDoc) {
        q = query(q, startAfter(lastDoc))
      }

      const snapshot = await getDocs(q)
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product))

      return {
        products,
        lastDoc: snapshot.docs[snapshot.docs.length - 1]
      }
    } catch (error) {
      console.error('Error fetching paginated products:', error)
      throw new Error('Nie udało się pobrać produktów')
    }
  }

  // Pobierz produkty z kategorii
  static async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const productsCollection = collection(db, this.COLLECTION)
      const q = query(
        productsCollection, 
        where('category', '==', category),
        orderBy('createdAt', 'desc')
      )
      const snapshot = await getDocs(q)
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product))
    } catch (error) {
      console.error('Error fetching products by category:', error)
      throw new Error('Nie udało się pobrać produktów z kategorii')
    }
  }

  // Pobierz polecane produkty
  static async getFeaturedProducts(limitCount: number = 6): Promise<Product[]> {
    try {
      const productsCollection = collection(db, this.COLLECTION)
      
      // Najpierw spróbuj z compound query
      try {
        const q = query(
          productsCollection, 
          where('featured', '==', true),
          where('inStock', '==', true),
          orderBy('createdAt', 'desc'),
          limit(limitCount)
        )
        const snapshot = await getDocs(q)
        
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Product))
      } catch (indexError) {
        console.log('Compound query failed, using simpler approach')
        
        // Fallback: pobierz wszystkie produkty i filtruj lokalnie
        const allProducts = await this.getAllProducts()
        return allProducts
          .filter(product => product.featured && product.inStock)
          .slice(0, limitCount)
      }
    } catch (error) {
      console.error('Error fetching featured products:', error)
      
      // Final fallback: pobierz ostatnie produkty
      try {
        const productsCollection = collection(db, this.COLLECTION)
        const q = query(
          productsCollection, 
          orderBy('createdAt', 'desc'),
          limit(limitCount)
        )
        const snapshot = await getDocs(q)
        
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Product))
      } catch (finalError) {
        console.error('Final fallback failed:', finalError)
        return []
      }
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
      const productsCollection = collection(db, this.COLLECTION)
      const snapshot = await getDocs(productsCollection)
      
      // Client-side filtering (Firestore nie ma full-text search)
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product))

      const searchTerm = searchQuery.toLowerCase()
      return products.filter(product =>
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
      await updateDoc(productDoc, {
        ...updates,
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
}