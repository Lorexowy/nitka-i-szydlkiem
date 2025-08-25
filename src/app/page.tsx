'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Heart, Star, ShoppingBag, Users, ShoppingCart } from 'lucide-react'
import { ProductService } from '@/lib/products'
import { Product } from '@/lib/firestore-types'

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        const products = await ProductService.getFeaturedProducts(3) // Pokaż 3 polecane
        setFeaturedProducts(products)
      } catch (error) {
        console.error('Error loading featured products:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadFeaturedProducts()
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-beige-50 via-cream-50 to-blue-50 py-16 md:py-24">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text content */}
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Handmade
                <span className="text-gradient block">z miłością</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                Odkryj unikalne produkty szydełkowe, stworzone ręcznie z najwyższą starannością. 
                Każdy element to mała historia opowiedziana nitką.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/produkty"
                  className="btn-primary inline-flex items-center justify-center space-x-2 px-8 py-4 text-lg"
                >
                  <ShoppingBag className="h-5 w-5" />
                  <span>Zobacz produkty</span>
                </Link>
                <Link
                  href="/o-nas"
                  className="btn-outline inline-flex items-center justify-center space-x-2 px-8 py-4 text-lg"
                >
                  <Heart className="h-5 w-5" />
                  <span>Nasza historia</span>
                </Link>
              </div>
            </div>

            {/* Hero image placeholder */}
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-blue-200 to-beige-200 rounded-2xl shadow-2xl flex items-center justify-center">
                <div className="text-center p-8">
                  <Heart className="h-24 w-24 text-blue-600 mx-auto mb-4" />
                  <p className="text-lg font-semibold text-neutral-700">
                    Tutaj będzie zdjęcie
                  </p>
                  <p className="text-neutral-600">
                    Twojego najlepszego produktu
                  </p>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-300 rounded-full opacity-20"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-beige-300 rounded-full opacity-20"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Dlaczego wybrać nas?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Każdy produkt to efekt pasji, doświadczenia i uwagi do najdrobniejszych szczegółów
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                Ręcznie robione
              </h3>
              <p className="text-neutral-600">
                Każdy produkt jest tworzony indywidualnie, z uwagą do każdego szczegółu i z miłością do rzemiosła.
              </p>
            </div>

            <div className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                Najwyższa jakość
              </h3>
              <p className="text-neutral-600">
                Używamy tylko najlepszych materiałów i sprawdzonych technik, aby zapewnić trwałość naszych produktów.
              </p>
            </div>

            <div className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                Zadowoleni klienci
              </h3>
              <p className="text-neutral-600">
                Nasza społeczność zadowolonych klientów rośnie każdego dnia dzięki wyjątkowej jakości produktów.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      {(featuredProducts.length > 0 || isLoading) && (
        <section className="py-16 bg-gray-50">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Polecane produkty
              </h2>
              <p className="text-lg text-gray-600">
                Nasze najlepsze i najpopularniejsze produkty
              </p>
            </div>

            {isLoading ? (
              <div className="flex justify-center">
                <div className="loading-spinner w-8 h-8"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/produkty/szczegoly/${product.id}`}
                    className="card card-hover group"
                  >
                    <div className="relative overflow-hidden rounded-t-lg">
                      {product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-64 bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                          <Heart className="h-16 w-16 text-pink-300" />
                        </div>
                      )}
                      
                      <div className="absolute top-2 left-2">
                        <span className="bg-pink-600 text-white px-2 py-1 rounded text-xs font-semibold">
                          Polecane
                        </span>
                      </div>

                      {product.originalPrice && (
                        <div className="absolute top-2 right-2">
                          <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                            -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <h3 className="font-semibold text-gray-900 mb-2 text-lg">
                        {product.name}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {product.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl font-bold text-pink-600">
                            {product.price.toFixed(2)} zł
                          </span>
                          {product.originalPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              {product.originalPrice.toFixed(2)} zł
                            </span>
                          )}
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          product.inStock 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {product.inStock ? 'Dostępny' : 'Brak w magazynie'}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <div className="text-center mt-8">
              <Link
                href="/produkty"
                className="btn-outline inline-flex items-center space-x-2"
              >
                <span>Zobacz wszystkie produkty</span>
                <ShoppingBag className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-beige-500">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Gotowy na zakupy?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Odkryj naszą kolekcję unikalnych, ręcznie robionych produktów szydełkowych
          </p>
          <Link
            href="/produkty"
            className="bg-white text-blue-600 hover:bg-neutral-100 font-semibold py-4 px-8 rounded-lg transition-colors duration-200 inline-flex items-center space-x-2 text-lg"
          >
            <ShoppingBag className="h-5 w-5" />
            <span>Zobacz wszystkie produkty</span>
          </Link>
        </div>
      </section>
    </div>
  )
}