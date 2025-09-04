import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ToastProvider } from '@/contexts/ToastContext'
import { CartProvider } from '@/contexts/CartContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Nitką i Szydełkiem - Handmade Crochet Products',
    template: '%s | Nitką i Szydełkiem'
  },
  description: 'Discover beautiful handmade crochet products crafted with love. Unique designs, premium quality, and attention to detail.',
  keywords: ['crochet', 'handmade', 'crafts', 'szydełko', 'rękodzieło', 'polska'],
  authors: [{ name: 'Nitką i Szydełkiem' }],
  creator: 'Nitką i Szydełkiem',
  openGraph: {
    type: 'website',
    locale: 'pl_PL',
    url: 'https://nitka-i-szydlkiem.vercel.app',
    siteName: 'Nitką i Szydełkiem',
    title: 'Nitką i Szydełkiem - Handmade Crochet Products',
    description: 'Discover beautiful handmade crochet products crafted with love.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nitką i Szydełkiem - Handmade Crochet Products',
    description: 'Discover beautiful handmade crochet products crafted with love.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pl" className="h-full">
      <body className={`${inter.className} min-h-full flex flex-col bg-gray-50`}>
        <ToastProvider>
          <CartProvider>
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  )
}