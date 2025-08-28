'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { AuthService } from '@/lib/auth'
import { CategoryService } from '@/lib/category-service'
import { CategoryInfo, CATEGORIES } from '@/lib/categories'
import { 
  ArrowLeft, 
  Download, 
  Upload, 
  FileText,
  AlertCircle,
  CheckCircle,
  Copy,
  Database
} from 'lucide-react'

export default function CategoryImportExportPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isImporting, setIsImporting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [importResults, setImportResults] = useState<{ success: number, errors: string[] } | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const router = useRouter()

  // Auth check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/admin/login')
        return
      }

      const adminStatus = await AuthService.isAdmin(user.uid)
      if (!adminStatus) {
        router.push('/admin/login')
        return
      }

      setIsAdmin(true)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === 'application/json') {
      setSelectedFile(file)
      setImportResults(null)
    } else {
      alert('Proszę wybrać plik JSON')
    }
  }

  const handleImport = async () => {
    if (!selectedFile) return

    setIsImporting(true)
    try {
      const fileContent = await selectedFile.text()
      const categories: CategoryInfo[] = JSON.parse(fileContent)

      // Waliduj strukturę
      if (!Array.isArray(categories)) {
        throw new Error('Plik musi zawierać tablicę kategorii')
      }

      const results = await CategoryService.importCategories(categories)
      setImportResults(results)

      if (results.success > 0) {
        // Refresh page after successful import
        setTimeout(() => {
          router.push('/admin/categories?success=imported')
        }, 3000)
      }
    } catch (error: any) {
      console.error('Import error:', error)
      alert(error.message || 'Błąd podczas importu')
    } finally {
      setIsImporting(false)
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const categories = await CategoryService.exportCategories()
      
      const dataStr = JSON.stringify(categories, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `categories-export-${new Date().toISOString().split('T')[0]}.json`
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export error:', error)
      alert('Błąd podczas eksportu')
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportStatic = () => {
    const staticCategories = Object.values(CATEGORIES)
    const dataStr = JSON.stringify(staticCategories, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `static-categories-${new Date().toISOString().split('T')[0]}.json`
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
  }

  const copyStaticCategoriesToFirebase = async () => {
    if (!confirm('Czy na pewno chcesz skopiować wszystkie statyczne kategorie do Firebase? To może nadpisać istniejące kategorie.')) {
      return
    }

    setIsImporting(true)
    try {
      const staticCategories = Object.values(CATEGORIES)
      const results = await CategoryService.importCategories(staticCategories)
      setImportResults(results)

      alert(`Skopiowano ${results.success} kategorii. Błędów: ${results.errors.length}`)
    } catch (error) {
      console.error('Copy error:', error)
      alert('Błąd podczas kopiowania kategorii')
    } finally {
      setIsImporting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link
              href="/admin/categories"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Import/Export kategorii</h1>
              <p className="text-gray-600">Zarządzaj kategoriami poprzez pliki JSON</p>
            </div>
          </div>
          <Link
            href="/admin/categories"
            className="btn-outline"
          >
            Lista kategorii
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Export Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Download className="h-5 w-5" />
              <span>Eksport kategorii</span>
            </h2>

            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Z Firebase</h3>
                <p className="text-blue-700 text-sm mb-3">
                  Eksportuj wszystkie kategorie zapisane w bazie danych Firebase
                </p>
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="btn-primary flex items-center space-x-2"
                >
                  {isExporting ? (
                    <>
                      <div className="loading-spinner"></div>
                      <span>Eksportowanie...</span>
                    </>
                  ) : (
                    <>
                      <Database className="h-4 w-4" />
                      <span>Eksportuj z Firebase</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Statyczne kategorie</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Eksportuj wbudowane kategorie systemowe
                </p>
                <button
                  onClick={handleExportStatic}
                  className="btn-outline flex items-center space-x-2"
                >
                  <FileText className="h-4 w-4" />
                  <span>Eksportuj statyczne</span>
                </button>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-medium text-green-900 mb-2">Kopiuj do Firebase</h3>
                <p className="text-green-700 text-sm mb-3">
                  Skopiuj wszystkie statyczne kategorie do Firebase
                </p>
                <button
                  onClick={copyStaticCategoriesToFirebase}
                  disabled={isImporting}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                >
                  <Copy className="h-4 w-4" />
                  <span>Kopiuj do Firebase</span>
                </button>
              </div>
            </div>
          </div>

          {/* Import Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Import kategorii</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="import-file" className="block text-sm font-medium text-gray-700 mb-2">
                  Wybierz plik JSON
                </label>
                <input
                  type="file"
                  id="import-file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="input-field"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Plik musi być w formacie JSON i zawierać tablicę kategorii
                </p>
              </div>

              {selectedFile && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    <strong>Wybrany plik:</strong> {selectedFile.name}
                  </p>
                  <p className="text-blue-600 text-xs">
                    Rozmiar: {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              )}

              <button
                onClick={handleImport}
                disabled={!selectedFile || isImporting}
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                {isImporting ? (
                  <>
                    <div className="loading-spinner"></div>
                    <span>Importowanie...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    <span>Importuj kategorie</span>
                  </>
                )}
              </button>

              {importResults && (
                <div className="mt-4">
                  <div className={`p-4 rounded-lg ${
                    importResults.errors.length === 0 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
                  }`}>
                    <div className="flex items-start space-x-2">
                      {importResults.errors.length === 0 ? (
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <h4 className={`font-medium ${
                          importResults.errors.length === 0 ? 'text-green-900' : 'text-yellow-900'
                        }`}>
                          Wyniki importu
                        </h4>
                        <p className={`text-sm mt-1 ${
                          importResults.errors.length === 0 ? 'text-green-700' : 'text-yellow-700'
                        }`}>
                          Pomyślnie zaimportowano: <strong>{importResults.success}</strong> kategorii
                        </p>
                        
                        {importResults.errors.length > 0 && (
                          <div className="mt-2">
                            <p className="text-yellow-700 text-sm font-medium">Błędy:</p>
                            <ul className="text-yellow-600 text-xs mt-1 space-y-1">
                              {importResults.errors.map((error, index) => (
                                <li key={index}>• {error}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Format Documentation */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Format pliku JSON</h2>
          
          <div className="bg-gray-100 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm text-gray-800">
{`[
  {
    "id": "nowa_kategoria",
    "name": "Nowa kategoria",
    "description": "Opis nowej kategorii",
    "group": "akcesoria",
    "color": "bg-blue-100 text-blue-800",
    "examples": [
      "Przykład 1",
      "Przykład 2"
    ],
    "isActive": true,
    "sortOrder": 1
  }
]`}
            </pre>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            <p><strong>Wymagane pola:</strong></p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li><code>id</code> - Unikalny identyfikator (tylko małe litery i podkreślniki)</li>
              <li><code>name</code> - Nazwa kategorii</li>
              <li><code>description</code> - Opis kategorii</li>
              <li><code>group</code> - Grupa kategorii (zabawki, ubrania, dekoracje_domowe, dekoracje_sezonowe, akcesoria)</li>
              <li><code>examples</code> - Tablica przykładów produktów</li>
              <li><code>isActive</code> - Status aktywności (true/false)</li>
              <li><code>sortOrder</code> - Kolejność sortowania (liczba)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}