'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { CartItem } from '@/lib/firestore-types'

interface CartState {
  items: CartItem[]
  totalItems: number
  totalAmount: number
  isLoading: boolean
}

interface CartContextType extends CartState {
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  isItemInCart: (productId: string) => boolean
  getItemQuantity: (productId: string) => number
}

type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ITEMS'; payload: CartItem[] }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' }

const CartContext = createContext<CartContextType | undefined>(undefined)

const calculateTotals = (items: CartItem[]) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  return { totalItems, totalAmount }
}

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }

    case 'SET_ITEMS': {
      const { totalItems, totalAmount } = calculateTotals(action.payload)
      return {
        ...state,
        items: action.payload,
        totalItems,
        totalAmount,
        isLoading: false
      }
    }

    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(
        item => item.productId === action.payload.productId
      )

      let newItems: CartItem[]
      
      if (existingItemIndex >= 0) {
        // Update existing item
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: Math.min(item.quantity + action.payload.quantity, item.maxQuantity) }
            : item
        )
      } else {
        // Add new item
        newItems = [...state.items, action.payload]
      }

      const { totalItems, totalAmount } = calculateTotals(newItems)
      
      return {
        ...state,
        items: newItems,
        totalItems,
        totalAmount
      }
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.productId !== action.payload)
      const { totalItems, totalAmount } = calculateTotals(newItems)
      
      return {
        ...state,
        items: newItems,
        totalItems,
        totalAmount
      }
    }

    case 'UPDATE_QUANTITY': {
      const { productId, quantity } = action.payload
      
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        const newItems = state.items.filter(item => item.productId !== productId)
        const { totalItems, totalAmount } = calculateTotals(newItems)
        
        return {
          ...state,
          items: newItems,
          totalItems,
          totalAmount
        }
      }

      const newItems = state.items.map(item =>
        item.productId === productId
          ? { ...item, quantity: Math.min(quantity, item.maxQuantity) }
          : item
      )

      const { totalItems, totalAmount } = calculateTotals(newItems)
      
      return {
        ...state,
        items: newItems,
        totalItems,
        totalAmount
      }
    }

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalAmount: 0
      }

    default:
      return state
  }
}

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalAmount: 0,
  isLoading: true
}

interface CartProviderProps {
  children: React.ReactNode
}

export function CartProvider({ children }: CartProviderProps) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  // Load cart from localStorage on mount
  useEffect(() => {
    const loadCart = () => {
      try {
        const savedCart = localStorage.getItem('cart')
        if (savedCart) {
          const cartData = JSON.parse(savedCart) as CartItem[]
          dispatch({ type: 'SET_ITEMS', payload: cartData })
        } else {
          dispatch({ type: 'SET_LOADING', payload: false })
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    loadCart()
  }, [])

  // Save cart to localStorage whenever items change
  useEffect(() => {
    if (!state.isLoading) {
      try {
        localStorage.setItem('cart', JSON.stringify(state.items))
      } catch (error) {
        console.error('Error saving cart to localStorage:', error)
      }
    }
  }, [state.items, state.isLoading])

  const addItem = (itemData: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    const item: CartItem = {
      ...itemData,
      quantity: itemData.quantity || 1
    }
    dispatch({ type: 'ADD_ITEM', payload: item })
  }

  const removeItem = (productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId })
  }

  const updateQuantity = (productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
  }

  const isItemInCart = (productId: string): boolean => {
    return state.items.some(item => item.productId === productId)
  }

  const getItemQuantity = (productId: string): number => {
    const item = state.items.find(item => item.productId === productId)
    return item?.quantity || 0
  }

  const contextValue: CartContextType = {
    ...state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    isItemInCart,
    getItemQuantity
  }

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

// Utility hooks
export function useCartCount() {
  const { totalItems } = useCart()
  return totalItems
}

export function useCartTotal() {
  const { totalAmount } = useCart()
  return totalAmount
}