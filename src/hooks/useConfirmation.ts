// src/hooks/useConfirmation.ts
'use client'

import { useState, useCallback } from 'react'

interface ConfirmationOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info' | 'success'
}

interface ConfirmationState extends ConfirmationOptions {
  isOpen: boolean
  isLoading: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function useConfirmation() {
  const [confirmation, setConfirmation] = useState<ConfirmationState | null>(null)

  const confirm = useCallback(async (options: ConfirmationOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmation({
        ...options,
        isOpen: true,
        isLoading: false,
        onConfirm: () => {
          setConfirmation(prev => prev ? { ...prev, isLoading: true } : null)
          setTimeout(() => {
            setConfirmation(null)
            resolve(true)
          }, 100)
        },
        onCancel: () => {
          setConfirmation(null)
          resolve(false)
        }
      })
    })
  }, [])

  const closeConfirmation = useCallback(() => {
    setConfirmation(null)
  }, [])

  return {
    confirmation,
    confirm,
    closeConfirmation
  }
}