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

// User types - ROZSZERZONE
export interface User {
  uid: string
  email: string
  displayName?: string | null
  photoURL?: string | null
  role: 'customer' | 'admin'
  isActive?: boolean // możliwość deaktywacji konta
  createdAt: Timestamp
  updatedAt: Timestamp
}

// Rozszerzone informacje o profilu użytkownika
export interface UserProfile {
  uid: string
  firstName?: string
  lastName?: string
  phone?: string
  dateOfBirth?: string // format YYYY-MM-DD
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say'
  preferences: {
    newsletter: boolean
    smsNotifications: boolean
    emailNotifications: boolean
    orderNotifications?: boolean
    marketingEmails?: boolean
  }
  // Dodatkowe pola
  notes?: string // notatki administracyjne
  tags?: string[] // tagi dla segmentacji
  totalOrders?: number // liczba zamówień
  totalSpent?: number // łączna kwota wydana
  lastOrderDate?: Timestamp
  createdAt: Timestamp
  updatedAt: Timestamp
}

// Address types - ROZSZERZONE
export interface Address {
  id: string
  userId: string
  type: 'shipping' | 'billing' | 'both' // dodano 'both'
  isDefault: boolean
  // Dane osobowe
  firstName: string
  lastName: string
  company?: string
  // Adres
  street: string
  houseNumber: string
  apartmentNumber?: string
  postalCode: string
  city: string
  state?: string // województwo
  country: string
  // Kontakt
  phone?: string
  email?: string // opcjonalny dodatkowy email
  // Dodatkowe informacje
  deliveryInstructions?: string // instrukcje dostawy
  label?: string // etykieta adresu np. "Dom", "Praca"
  isActive?: boolean // możliwość dezaktywacji bez usuwania
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
  selectedSize?: string // dodane rozmiary
  maxQuantity: number
  notes?: string // notatki do produktu
}

export interface Cart {
  id: string
  userId?: string // undefined for guest users
  sessionId?: string // for guest users
  items: CartItem[]
  totalAmount: number
  totalItems: number
  // Kody rabatowe
  discountCode?: string
  discountAmount?: number
  // Metadane
  createdAt: Timestamp
  updatedAt: Timestamp
  expiresAt: Timestamp // carts expire after 30 days
}

// Order types - ROZSZERZONE
export type OrderStatus = 
  | 'draft' // szkic zamówienia
  | 'pending' // oczekuje na płatność
  | 'confirmed' // potwierdzony
  | 'processing' // w realizacji
  | 'ready_to_ship' // gotowy do wysyłki
  | 'shipped' // wysłany
  | 'out_for_delivery' // w dostawie
  | 'delivered' // dostarczony
  | 'cancelled' // anulowany
  | 'refunded' // zwrócony
  | 'partially_refunded' // częściowo zwrócony

export type PaymentStatus = 
  | 'pending' // oczekuje
  | 'authorized' // autoryzowana
  | 'completed' // zakończona
  | 'failed' // nieudana
  | 'cancelled' // anulowana
  | 'refunded' // zwrócona
  | 'partially_refunded' // częściowo zwrócona

export type PaymentMethod = 
  | 'card' // karta
  | 'blik' // BLIK
  | 'p24' // Przelewy24
  | 'bank_transfer' // przelew bankowy
  | 'cash_on_delivery' // pobranie
  | 'paypal' // PayPal

export type ShippingMethod = 
  | 'poczta_polska' 
  | 'dpd' 
  | 'inpost_paczkomat' 
  | 'inpost_kurier'
  | 'pickup' // odbiór osobisty

export interface OrderItem {
  productId: string
  productName: string
  productImage: string
  price: number
  quantity: number
  selectedColor?: string
  selectedSize?: string
  totalPrice: number
  // Informacje o produkcie w momencie zamówienia
  productSnapshot?: {
    description: string
    category: string
    materials: string[]
  }
}

export interface ShippingInfo {
  trackingNumber?: string
  trackingUrl?: string
  estimatedDelivery?: Timestamp
  actualDelivery?: Timestamp
  parcelLockerCode?: string // dla InPost
  parcelLockerAddress?: string
  courierName?: string
  courierPhone?: string
}

export interface Order {
  id: string
  orderNumber: string // human-readable order number like "2024/01/001"
  userId?: string // undefined dla gości
  // Informacje o kliencie
  customerInfo: {
    email: string
    firstName: string
    lastName: string
    phone: string
    isGuest?: boolean
  }
  // Produkty
  items: OrderItem[]
  // Ceny
  subtotal: number
  shippingCost: number
  discountAmount?: number
  taxAmount?: number // VAT
  totalAmount: number
  // Status
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod?: PaymentMethod
  paymentIntentId?: string // Stripe/inne
  // Dostawa
  shippingMethod: ShippingMethod
  shippingAddress: Omit<Address, 'id' | 'userId'> // snapshot adresu
  billingAddress: Omit<Address, 'id' | 'userId'> // snapshot adresu
  shippingInfo?: ShippingInfo
  // Dodatkowe informacje
  notes?: string // notatki klienta
  adminNotes?: string // notatki administratora
  discountCode?: string
  source?: string // skąd przyszło zamówienie
  // Daty
  createdAt: Timestamp
  updatedAt: Timestamp
  confirmedAt?: Timestamp
  shippedAt?: Timestamp
  deliveredAt?: Timestamp
  cancelledAt?: Timestamp
  // Historia zmian statusu
  statusHistory?: Array<{
    status: OrderStatus
    changedAt: Timestamp
    changedBy?: string // user ID
    notes?: string
  }>
}

// Review types - ROZSZERZONE
export interface Review {
  id: string
  productId: string
  orderId?: string // powiązanie z zamówieniem
  userId: string
  userName: string
  userEmail?: string
  rating: number // 1-5
  title?: string // tytuł recenzji
  comment: string
  images?: string[] // zdjęcia od klienta
  verified: boolean // true jeśli kupił produkt
  helpful: number // liczba głosów "pomocne"
  helpfulVotes?: string[] // IDs użytkowników którzy zagłosowali
  reported?: boolean // czy zgłoszono jako niestosowną
  isVisible?: boolean // czy widoczna publicznie
  adminResponse?: {
    message: string
    respondedAt: Timestamp
    respondedBy: string
  }
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
  seoTitle?: string
  seoDescription?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

// Contact form types - ROZSZERZONE
export interface ContactMessage {
  id: string
  // Dane kontaktowe
  name: string
  email: string
  phone?: string
  // Wiadomość
  subject: string
  message: string
  category?: 'general' | 'order' | 'product' | 'complaint' | 'suggestion'
  orderId?: string // powiązanie z zamówieniem
  productId?: string // powiązanie z produktem
  // Status
  status: 'new' | 'read' | 'in_progress' | 'replied' | 'closed'
  priority?: 'low' | 'medium' | 'high'
  // Odpowiedź
  response?: string
  // Metadane
  userAgent?: string
  ipAddress?: string
  source?: string // skąd przyszła wiadomość
  // Daty
  createdAt: Timestamp
  updatedAt: Timestamp
  repliedAt?: Timestamp
  repliedBy?: string // admin user ID
  closedAt?: Timestamp
}

// Analytics types
export interface AnalyticsEvent {
  id: string
  eventType: 'page_view' | 'product_view' | 'add_to_cart' | 'remove_from_cart' | 'purchase' | 'search' | 'newsletter_signup'
  userId?: string
  sessionId: string
  productId?: string
  categoryId?: string
  searchQuery?: string
  value?: number // wartość w złotych
  quantity?: number
  metadata?: Record<string, any>
  // Techniczne
  userAgent?: string
  referrer?: string
  page?: string
  createdAt: Timestamp
}

// Wishlist types - ROZSZERZONE
export interface WishlistItem {
  productId: string
  productName: string // snapshot nazwy
  productImage: string // snapshot zdjęcia
  productPrice: number // snapshot ceny
  addedAt: Timestamp
  notifyWhenAvailable?: boolean // powiadomienie gdy dostępny
  notes?: string // prywatne notatki
}

export interface Wishlist {
  id: string
  userId: string
  items: WishlistItem[]
  isPublic?: boolean // czy lista może być publiczna
  name?: string // nazwa listy życzeń
  description?: string
  shareCode?: string // kod do udostępniania
  updatedAt: Timestamp
  createdAt: Timestamp
}

// Newsletter types
export interface NewsletterSubscriber {
  id: string
  email: string
  firstName?: string
  lastName?: string
  status: 'active' | 'unsubscribed' | 'bounced'
  tags?: string[] // segmentacja
  source?: string // skąd się zapisał
  subscribedAt: Timestamp
  unsubscribedAt?: Timestamp
  lastEmailSentAt?: Timestamp
}

// Coupon/Discount types
export interface Coupon {
  id: string
  code: string
  name: string
  description?: string
  type: 'percentage' | 'fixed_amount' | 'free_shipping'
  value: number // procent lub kwota
  minOrderValue?: number // minimalna wartość zamówienia
  maxDiscount?: number // maksymalny rabat (dla procentowych)
  // Ograniczenia
  usageLimit?: number // limit użyć
  usageCount?: number // ile razy użyty
  userLimit?: number // limit na użytkownika
  // Daty
  validFrom: Timestamp
  validUntil: Timestamp
  // Ograniczenia produktowe
  applicableCategories?: string[]
  applicableProducts?: string[]
  excludeProducts?: string[]
  // Status
  isActive: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
  createdBy: string
}

// Shipping zones i rates
export interface ShippingZone {
  id: string
  name: string
  countries: string[]
  regions?: string[] // województwa
  isActive: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface ShippingRate {
  id: string
  zoneId: string
  method: ShippingMethod
  name: string
  description?: string
  price: number
  freeShippingThreshold?: number // darmowa dostawa od
  minWeight?: number
  maxWeight?: number
  estimatedDays?: {
    min: number
    max: number
  }
  isActive: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

// Inventory/Stock tracking
export interface StockMovement {
  id: string
  productId: string
  type: 'in' | 'out' | 'adjustment'
  quantity: number
  reason: 'purchase' | 'sale' | 'return' | 'damage' | 'adjustment' | 'restock'
  orderId?: string
  notes?: string
  createdAt: Timestamp
  createdBy: string
}