// src/components/Toast.tsx
'use client'

import { useState, useEffect } from 'react'
import { X, CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react'

export interface ToastProps {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  onClose: (id: string) => void
}

export default function Toast({ 
  id, 
  type, 
  title, 
  message, 
  duration = 5000, 
  onClose 
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 100)

    // Auto close
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      onClose(id)
    }, 300)
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />
      default:
        return <Info className="h-5 w-5 text-blue-600" />
    }
  }

  const getStyles = () => {
    const baseStyles = "border-l-4 shadow-lg"
    switch (type) {
      case 'success':
        return `${baseStyles} bg-white border-green-500`
      case 'error':
        return `${baseStyles} bg-white border-red-500`
      case 'warning':
        return `${baseStyles} bg-white border-yellow-500`
      case 'info':
        return `${baseStyles} bg-white border-blue-500`
      default:
        return `${baseStyles} bg-white border-blue-500`
    }
  }

  return (
    <div
      className={`
        max-w-sm w-full rounded-lg p-4 mb-4 transition-all duration-300 ease-in-out
        ${getStyles()}
        ${isVisible && !isExiting 
          ? 'transform translate-x-0 opacity-100' 
          : 'transform translate-x-full opacity-0'
        }
      `}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <div className="text-sm font-medium text-gray-900">
            {title}
          </div>
          {message && (
            <div className="mt-1 text-sm text-gray-600">
              {message}
            </div>
          )}
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={handleClose}
            className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition ease-in-out duration-150"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}