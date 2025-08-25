import { useState } from 'react'
import { StorageService } from '@/lib/storage'

interface UseImageUploadReturn {
  uploadImages: (productId: string, files: File[]) => Promise<string[]>
  uploadSingleImage: (productId: string, file: File) => Promise<string>
  deleteImage: (imageUrl: string) => Promise<void>
  isUploading: boolean
  uploadProgress: number
  error: string | null
}

export function useImageUpload(): UseImageUploadReturn {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const uploadImages = async (productId: string, files: File[]): Promise<string[]> => {
    setIsUploading(true)
    setError(null)
    setUploadProgress(0)

    try {
      // Waliduj wszystkie pliki
      for (const file of files) {
        const validation = StorageService.validateImageFile(file)
        if (!validation.isValid) {
          throw new Error(validation.error)
        }
      }

      // Upload wszystkich zdjęć
      const uploadedUrls: string[] = []
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const url = await StorageService.uploadProductImage(productId, file)
        uploadedUrls.push(url)
        
        // Aktualizuj progress
        setUploadProgress(((i + 1) / files.length) * 100)
      }

      return uploadedUrls
    } catch (error: any) {
      setError(error.message)
      throw error
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const uploadSingleImage = async (productId: string, file: File): Promise<string> => {
    setIsUploading(true)
    setError(null)

    try {
      const validation = StorageService.validateImageFile(file)
      if (!validation.isValid) {
        throw new Error(validation.error)
      }

      const url = await StorageService.uploadProductImage(productId, file)
      return url
    } catch (error: any) {
      setError(error.message)
      throw error
    } finally {
      setIsUploading(false)
    }
  }

  const deleteImage = async (imageUrl: string): Promise<void> => {
    setIsUploading(true)
    setError(null)

    try {
      await StorageService.deleteProductImage(imageUrl)
    } catch (error: any) {
      setError(error.message)
      throw error
    } finally {
      setIsUploading(false)
    }
  }

  return {
    uploadImages,
    uploadSingleImage,
    deleteImage,
    isUploading,
    uploadProgress,
    error
  }
}