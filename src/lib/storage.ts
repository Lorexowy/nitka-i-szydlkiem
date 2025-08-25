import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  listAll 
} from 'firebase/storage'
import { storage } from './firebase'

export class StorageService {
  
  // Upload zdjęcia produktu
  static async uploadProductImage(
    productId: string, 
    file: File, 
    imageName?: string
  ): Promise<string> {
    try {
      // Sprawdź czy plik to obraz
      if (!file.type.startsWith('image/')) {
        throw new Error('Plik musi być obrazem')
      }

      // Sprawdź rozmiar (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Plik jest zbyt duży (max 10MB)')
      }

      // Wygeneruj nazwę pliku
      const fileName = imageName || `${Date.now()}-${file.name}`
      const imageRef = ref(storage, `products/${productId}/${fileName}`)

      // Upload pliku
      const snapshot = await uploadBytes(imageRef, file)
      
      // Pobierz URL do pobrania
      const downloadURL = await getDownloadURL(snapshot.ref)
      
      return downloadURL
    } catch (error) {
      console.error('Error uploading image:', error)
      throw new Error('Nie udało się przesłać zdjęcia')
    }
  }

  // Upload wielu zdjęć produktu
  static async uploadProductImages(
    productId: string, 
    files: File[]
  ): Promise<string[]> {
    try {
      const uploadPromises = files.map((file, index) => 
        this.uploadProductImage(productId, file, `image-${index + 1}-${Date.now()}.${file.name.split('.').pop()}`)
      )

      return await Promise.all(uploadPromises)
    } catch (error) {
      console.error('Error uploading multiple images:', error)
      throw new Error('Nie udało się przesłać zdjęć')
    }
  }

  // Usuń zdjęcie produktu
  static async deleteProductImage(imageUrl: string): Promise<void> {
    try {
      // Wyciągnij ścieżkę z URL
      const url = new URL(imageUrl)
      const pathname = decodeURIComponent(url.pathname)
      const imagePath = pathname.split('/o/')[1]?.split('?')[0]
      
      if (!imagePath) {
        throw new Error('Nieprawidłowy URL zdjęcia')
      }

      const imageRef = ref(storage, imagePath)
      await deleteObject(imageRef)
    } catch (error) {
      console.error('Error deleting image:', error)
      throw new Error('Nie udało się usunąć zdjęcia')
    }
  }

  // Usuń wszystkie zdjęcia produktu
  static async deleteAllProductImages(productId: string): Promise<void> {
    try {
      const folderRef = ref(storage, `products/${productId}`)
      const listResult = await listAll(folderRef)
      
      const deletePromises = listResult.items.map(itemRef => deleteObject(itemRef))
      await Promise.all(deletePromises)
    } catch (error) {
      console.error('Error deleting product images:', error)
      throw new Error('Nie udało się usunąć zdjęć produktu')
    }
  }

  // Upload zdjęcia profilowego użytkownika
  static async uploadUserProfileImage(userId: string, file: File): Promise<string> {
    try {
      if (!file.type.startsWith('image/')) {
        throw new Error('Plik musi być obrazem')
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit dla zdjęć profilowych
        throw new Error('Plik jest zbyt duży (max 5MB)')
      }

      const imageRef = ref(storage, `users/${userId}/profile.jpg`)
      const snapshot = await uploadBytes(imageRef, file)
      const downloadURL = await getDownloadURL(snapshot.ref)
      
      return downloadURL
    } catch (error) {
      console.error('Error uploading profile image:', error)
      throw new Error('Nie udało się przesłać zdjęcia profilowego')
    }
  }

  // Usuń zdjęcie profilowe
  static async deleteUserProfileImage(userId: string): Promise<void> {
    try {
      const imageRef = ref(storage, `users/${userId}/profile.jpg`)
      await deleteObject(imageRef)
    } catch (error) {
      console.error('Error deleting profile image:', error)
      throw new Error('Nie udało się usunąć zdjęcia profilowego')
    }
  }

  // Pomocnicza funkcja do walidacji obrazów
  static validateImageFile(file: File): { isValid: boolean; error?: string } {
    if (!file.type.startsWith('image/')) {
      return { isValid: false, error: 'Plik musi być obrazem' }
    }

    if (file.size > 10 * 1024 * 1024) {
      return { isValid: false, error: 'Plik jest zbyt duży (max 10MB)' }
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'Dozwolone formaty: JPEG, PNG, WebP' }
    }

    return { isValid: true }
  }
}