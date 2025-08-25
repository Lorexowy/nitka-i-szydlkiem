import Link from 'next/link'
import { 
  Facebook, 
  Instagram, 
  Mail, 
  Phone, 
  MapPin,
  Heart,
  CreditCard,
  Truck,
  Shield,
  Clock
} from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const quickLinks = [
    { href: '/', label: 'Strona główna' },
    { href: '/produkty', label: 'Produkty' },
    { href: '/o-nas', label: 'O nas' },
    { href: '/kontakt', label: 'Kontakt' },
  ]

  const customerService = [
    { href: '/pomoc', label: 'Pomoc' },
    { href: '/dostawa', label: 'Dostawa i płatność' },
    { href: '/zwroty', label: 'Zwroty i reklamacje' },
    { href: '/regulamin', label: 'Regulamin' },
    { href: '/polityka-prywatnosci', label: 'Polityka prywatności' },
  ]

  const features = [
    {
      icon: <Truck className="h-5 w-5" />,
      title: 'Darmowa dostawa',
      description: 'Od 150 zł'
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: 'Bezpieczne płatności',
      description: '100% zabezpieczone'
    },
    {
      icon: <Clock className="h-5 w-5" />,
      title: 'Szybka realizacja',
      description: '1-3 dni robocze'
    },
    {
      icon: <Heart className="h-5 w-5" />,
      title: 'Ręcznie robione',
      description: 'Z miłością i pasją'
    }
  ]

  return (
    <footer className="bg-gray-900 text-white">
      {/* Features section */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container-custom py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-pink-600 rounded-lg flex items-center justify-center">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{feature.title}</h3>
                  <p className="text-sm text-gray-300">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company info */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">N</span>
              </div>
              <span className="text-xl font-bold">Nitką i Szydełkiem</span>
            </Link>
            <p className="text-gray-300 mb-6 text-sm leading-relaxed">
              Tworzymy unikalne, ręcznie robione produkty szydełkowe z miłością i pasją. 
              Każdy produkt jest niepowtarzalny i wykonany z najwyższą starannością.
            </p>
            
            {/* Social media */}
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center hover:bg-pink-600 transition-colors duration-200"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center hover:bg-pink-600 transition-colors duration-200"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Szybkie linki</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-pink-400 transition-colors duration-200 text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer service */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Obsługa klienta</h3>
            <ul className="space-y-2">
              {customerService.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-pink-400 transition-colors duration-200 text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Kontakt</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-pink-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-300">
                  <p>ul. Przykładowa 123</p>
                  <p>00-000 Warszawa, Polska</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-pink-400 flex-shrink-0" />
                <a
                  href="tel:+48123456789"
                  className="text-sm text-gray-300 hover:text-pink-400 transition-colors duration-200"
                >
                  +48 123 456 789
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-pink-400 flex-shrink-0" />
                <a
                  href="mailto:kontakt@nitkaiszydlkiem.pl"
                  className="text-sm text-gray-300 hover:text-pink-400 transition-colors duration-200"
                >
                  kontakt@nitkaiszydlkiem.pl
                </a>
              </div>
            </div>

            {/* Payment methods */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-2 text-gray-200">Akceptujemy płatności:</h4>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-6 bg-white rounded flex items-center justify-center">
                  <CreditCard className="h-3 w-3 text-gray-600" />
                </div>
                <span className="text-xs text-gray-400">VISA, Mastercard, BLIK, Przelewy24</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-700">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-400">
              © {currentYear} Nitką i Szydełkiem. Wszystkie prawa zastrzeżone.
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <Link
                href="/regulamin"
                className="hover:text-pink-400 transition-colors duration-200"
              >
                Regulamin
              </Link>
              <Link
                href="/polityka-prywatnosci"
                className="hover:text-pink-400 transition-colors duration-200"
              >
                Polityka prywatności
              </Link>
              <span>Made with ❤️ in Poland</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}