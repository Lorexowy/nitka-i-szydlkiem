'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { AuthService } from '@/lib/auth'
import { User } from '@/lib/firestore-types'
import { useCartCount } from '@/contexts/CartContext'
import { 
  Menu, 
  X, 
  ShoppingCart, 
  User as UserIcon, 
  Search,
  Heart,
  Phone,
  Mail,
  LogIn,
  LogOut,
  UserCheck,
  Settings,
  Package,
  ChevronDown
} from 'lucide-react'

export default function ClientHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const cartCount = useCartCount()

  // Check auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userData = await AuthService.getUserData(firebaseUser.uid)
          setUser(userData)
        } catch (error) {
          console.error('Error fetching user data:', error)
          setUser(null)
        }
      } else {
        setUser(null)
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const toggleSearch = () => setIsSearchOpen(!isSearchOpen)
  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/produkty?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setIsSearchOpen(false)
    }
  }

  const handleLogout = async () => {
    try {
      await AuthService.logoutUser()
      setIsUserMenuOpen(false)
      router.push('/')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const navigationItems = [
    { href: '/', label: 'Strona główna' },
    { href: '/produkty', label: 'Produkty' },
    { href: '/o-nas', label: 'O nas' },
    { href: '/kontakt', label: 'Kontakt' },
  ]

  const userMenuItems = [
    { href: '/konto', label: 'Moje konto', icon: <UserIcon className="h-4 w-4" /> },
    { href: '/konto?tab=orders', label: 'Zamówienia', icon: <Package className="h-4 w-4" /> },
    { href: '/konto?tab=wishlist', label: 'Lista życzeń', icon: <Heart className="h-4 w-4" /> },
    { href: '/konto?tab=settings', label: 'Ustawienia', icon: <Settings className="h-4 w-4" /> },
  ]

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-beige-50 border-b border-beige-100">
        <div className="container-custom">
          <div className="flex justify-between items-center py-2 text-sm">
            <div className="hidden md:flex items-center space-x-4 text-neutral-600">
              <div className="flex items-center space-x-1">
                <Phone className="h-4 w-4" />
                <span>+48 123 456 789</span>
              </div>
              <div className="flex items-center space-x-1">
                <Mail className="h-4 w-4" />
                <span>kontakt@nitkaiszydlkiem.pl</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-neutral-600">Darmowa dostawa od 150 zł!</span>
              {user && user.role === 'admin' && (
                <Link 
                  href="/admin/dashboard" 
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Panel Admin
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container-custom">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-beige-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl md:text-2xl font-bold text-neutral-800">
                Nitką i Szydełkiem
              </h1>
              <p className="text-xs text-neutral-500 -mt-1">Handmade with love</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
              </Link>
            ))}
          </nav>

          {/* Right side icons */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Search */}
            <button
              onClick={toggleSearch}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              aria-label="Search"
            >
              <Search className="h-5 w-5 text-gray-600" />
            </button>

            {/* Wishlist */}
            <Link
              href={user ? "/konto?tab=wishlist" : "/logowanie?redirect=/konto?tab=wishlist"}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 relative"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                0
              </span>
            </Link>

            {/* Cart */}
            <Link
              href="/koszyk"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 relative"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="h-5 w-5 text-gray-600" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* User menu */}
            {!isLoading && (
              <div className="relative">
                {user ? (
                  <div>
                    <button
                      onClick={toggleUserMenu}
                      className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    >
                      <div className="w-6 h-6 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                        <UserIcon className="h-3 w-3 text-white" />
                      </div>
                      <span className="hidden md:block text-sm font-medium text-gray-700">
                        {user.displayName?.split(' ')[0] || 'Konto'}
                      </span>
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </button>

                    {/* User dropdown */}
                    {isUserMenuOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setIsUserMenuOpen(false)}
                        ></div>
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                          {/* User info */}
                          <div className="px-4 py-3 border-b border-gray-200">
                            <p className="text-sm font-medium text-gray-900">
                              {user.displayName || 'Użytkownik'}
                            </p>
                            <p className="text-sm text-gray-600 truncate">
                              {user.email}
                            </p>
                          </div>

                          {/* Menu items */}
                          <div className="py-2">
                            {userMenuItems.map((item) => (
                              <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsUserMenuOpen(false)}
                                className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                {item.icon}
                                <span>{item.label}</span>
                              </Link>
                            ))}
                          </div>

                          {/* Logout */}
                          <div className="border-t border-gray-200 py-2">
                            <button
                              onClick={handleLogout}
                              className="flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                            >
                              <LogOut className="h-4 w-4" />
                              <span>Wyloguj się</span>
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link
                      href="/logowanie"
                      className="hidden md:flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      <LogIn className="h-4 w-4" />
                      <span>Logowanie</span>
                    </Link>
                    <Link
                      href="/rejestracja"
                      className="hidden md:flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <UserCheck className="h-4 w-4" />
                      <span>Rejestracja</span>
                    </Link>
                    <Link
                      href="/logowanie"
                      className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                      aria-label="Login"
                    >
                      <UserIcon className="h-5 w-5 text-gray-600" />
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={toggleMenu}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-gray-600" />
              ) : (
                <Menu className="h-6 w-6 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Search bar */}
        {isSearchOpen && (
          <div className="pb-4 animate-slide-down">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Szukaj produktów..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 btn-primary px-4 py-1.5 text-sm"
              >
                Szukaj
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 animate-slide-down">
          <nav className="container-custom py-4">
            <div className="flex flex-col space-y-4">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Mobile auth links */}
              {!user && (
                <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
                  <Link
                    href="/logowanie"
                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 font-medium py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Logowanie</span>
                  </Link>
                  <Link
                    href="/rejestracja"
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <UserCheck className="h-4 w-4" />
                    <span>Załóż konto</span>
                  </Link>
                </div>
              )}

              {/* Contact info */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex flex-col space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>+48 123 456 789</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>kontakt@nitkaiszydlkiem.pl</span>
                  </div>
                </div>
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}