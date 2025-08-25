import { Timestamp } from 'firebase/firestore'

// Product types
export interface Product {
  id: string
  name: string
  description: string
  longDescription?: string
  price: number
  originalPrice?: number
  category: string
  subcategory?: string
  images: string[] // URLs to images in Firebase Storage
  inStock: boolean
  stockQuantity: number
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
  materials: string[]
  colors: string[]
  features: string[]
  featured: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
  createdBy: string // admin user ID
}

// User types - UPROSZCZONE
export interface User {
  uid: string
  email: string
  displayName?: string | null
  photoURL?: string | null
  role: 'customer' | 'admin' // TYLKO DWA TYPY
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface UserProfile {
  uid: string
  firstName?: string
  lastName?: string
  phone?: string
  dateOfBirth?: string
  preferences: {
    newsletter: boolean
    smsNotifications: boolean
    emailNotifications: boolean
  }
  createdAt: Timestamp
  updatedAt: Timestamp
}

// Address types
export interface Address {
  id: string
  userId: string
  type: 'shipping' | 'billing'
  isDefault: boolean
  firstName: string
  lastName: string
  company?: string
  street: string
  houseNumber: string
  apartmentNumber?: string
  postalCode: string
  city: string
  country: string
  phone?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

// Cart types
export interface CartItem {
  productId: string
  productName: string
  productImage: string
  price: number
  quantity: number
  selectedColor?: string
  maxQuantity: number
}

export interface Cart {
  id: string
  userId?: string // undefined for guest users
  sessionId?: string // for guest users
  items: CartItem[]
  totalAmount: number
  totalItems: number
  createdAt: Timestamp
  updatedAt: Timestamp
  expiresAt: Timestamp // carts expire after 30 days
}

// Order types
export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'processing' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled' 
  | 'refunded'

export type PaymentStatus = 
  | 'pending' 
  | 'completed' 
  | 'failed' 
  | 'refunded' 
  | 'partially_refunded'

export type ShippingMethod = 'poczta_polska' | 'dpd' | 'inpost_paczkomat' | 'pickup'

export interface OrderItem {
  productId: string
  productName: string
  productImage: string
  price: number
  quantity: number
  selectedColor?: string
  totalPrice: number
}

export interface Order {
  id: string
  orderNumber: string // human-readable order number
  userId?: string
  customerInfo: {
    email: string
    firstName: string
    lastName: string
    phone: string
  }
  items: OrderItem[]
  subtotal: number
  shippingCost: number
  totalAmount: number
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentIntentId?: string // Stripe payment intent ID
  shippingMethod: ShippingMethod
  shippingAddress: Address
  billingAddress: Address
  shippingInfo?: {
    trackingNumber?: string
    estimatedDelivery?: Timestamp
    parcelLockerCode?: string // for InPost
  }
  notes?: string
  createdAt: Timestamp
  updatedAt: Timestamp
  shippedAt?: Timestamp
  deliveredAt?: Timestamp
}

// Review types
export interface Review {
  id: string
  productId: string
  userId: string
  userName: string
  rating: number // 1-5
  comment: string
  images?: string[]
  verified: boolean // true if user actually bought the product
  helpful: number // number of helpful votes
  createdAt: Timestamp
  updatedAt: Timestamp
}

// Category types
export interface Category {
  id: string
  name: string
  slug: string
  description: string
  image?: string
  parentId?: string // for subcategories
  displayOrder: number
  isActive: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

// Contact form types
export interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: 'new' | 'read' | 'replied' | 'closed'
  createdAt: Timestamp
  updatedAt: Timestamp
  repliedAt?: Timestamp
  repliedBy?: string
}

// Analytics types
export interface AnalyticsEvent {
  id: string
  eventType: 'page_view' | 'product_view' | 'add_to_cart' | 'purchase' | 'search'
  userId?: string
  sessionId: string
  productId?: string
  searchQuery?: string
  value?: number
  metadata?: Record<string, any>
  createdAt: Timestamp
}

// Wishlist types
export interface WishlistItem {
  productId: string
  addedAt: Timestamp
}

export interface Wishlist {
  id: string
  userId: string
  items: WishlistItem[]
  updatedAt: Timestamp
}