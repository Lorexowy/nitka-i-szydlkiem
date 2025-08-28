// System kategorii dla Nitką i Szydełkiem
export interface CategoryInfo {
  id: string
  name: string
  description: string
  group: 'zabawki' | 'ubrania' | 'dekoracje_domowe' | 'dekoracje_sezonowe' | 'akcesoria'
  color: string
  examples: string[]
  isActive: boolean
  sortOrder: number
}

export interface CategoryGroup {
  id: string
  name: string
  description: string
  icon: string
  color: string
  categories: string[]
}

export const CATEGORY_GROUPS: Record<string, CategoryGroup> = {
  zabawki: {
    id: 'zabawki',
    name: 'Zabawki',
    description: 'Bezpieczne zabawki dla dzieci',
    icon: '🧸',
    color: 'bg-pink-500',
    categories: ['grzechotki', 'maskotki', 'lalki']
  },
  ubrania: {
    id: 'ubrania',
    name: 'Ubrania',
    description: 'Odzież i akcesoria do noszenia',
    icon: '👗',
    color: 'bg-blue-500',
    categories: ['czapki', 'chusty', 'rekawiczki', 'sukienki', 'swetry']
  },
  dekoracje_domowe: {
    id: 'dekoracje_domowe',
    name: 'Dekoracje domowe',
    description: 'Ozdoby i praktyczne przedmioty do domu',
    icon: '🏠',
    color: 'bg-green-500',
    categories: ['lapacze_snow', 'mandale', 'podkladki', 'obrusy', 'ramki', 'doniczki']
  },
  dekoracje_sezonowe: {
    id: 'dekoracje_sezonowe',
    name: 'Dekoracje sezonowe',
    description: 'Ozdoby świąteczne i sezonowe',
    icon: '🎄',
    color: 'bg-red-500',
    categories: ['wielkanoc', 'boze_narodzenie', 'halloween', 'walentynki']
  },
  akcesoria: {
    id: 'akcesoria',
    name: 'Akcesoria',
    description: 'Użytkowe przedmioty i biżuteria',
    icon: '👜',
    color: 'bg-purple-500',
    categories: ['torby', 'breloczki', 'koszyki', 'bizuteria', 'portfele']
  }
}

export const CATEGORIES: Record<string, CategoryInfo> = {
  // ZABAWKI
  grzechotki: {
    id: 'grzechotki',
    name: 'Grzechotki',
    description: 'Kolorowe i bezpieczne grzechotki dla niemowląt',
    group: 'zabawki',
    color: 'bg-pink-100 text-pink-800',
    examples: ['Grzechotka słonik', 'Grzechotka kwiatek', 'Grzechotka różdżka'],
    isActive: true,
    sortOrder: 1
  },
  maskotki: {
    id: 'maskotki',
    name: 'Maskotki',
    description: 'Urocze przytulanki i pluszaki dla dzieci',
    group: 'zabawki',
    color: 'bg-pink-100 text-pink-800',
    examples: ['Miś Tadek', 'Królik Maja', 'Słonik Gucio', 'Żaba Kuma'],
    isActive: true,
    sortOrder: 2
  },
  lalki: {
    id: 'lalki',
    name: 'Lalki',
    description: 'Ręcznie robione lalki i kukiełki',
    group: 'zabawki',
    color: 'bg-pink-100 text-pink-800',
    examples: ['Lalka Aniela', 'Wróżka Zuna', 'Księżniczka Rosa'],
    isActive: true,
    sortOrder: 3
  },

  // UBRANIA
  czapki: {
    id: 'czapki',
    name: 'Czapki',
    description: 'Ciepłe czapki na każdą porę roku',
    group: 'ubrania',
    color: 'bg-blue-100 text-blue-800',
    examples: ['Czapka zimowa', 'Beret wiosenny', 'Kapelusz letni'],
    isActive: true,
    sortOrder: 4
  },
  chusty: {
    id: 'chusty',
    name: 'Chusty i szaliki',
    description: 'Eleganckie chusty, szaliki i kominy',
    group: 'ubrania',
    color: 'bg-blue-100 text-blue-800',
    examples: ['Szalik komin', 'Chusta trójkątna', 'Etola wieczorowa'],
    isActive: true,
    sortOrder: 5
  },
  rekawiczki: {
    id: 'rekawiczki',
    name: 'Rękawiczki',
    description: 'Ciepłe rękawiczki i mitenki',
    group: 'ubrania',
    color: 'bg-blue-100 text-blue-800',
    examples: ['Rękawiczki zimowe', 'Mitenki bez palców', 'Rękawiczki dziecięce'],
    isActive: true,
    sortOrder: 6
  },
  sukienki: {
    id: 'sukienki',
    name: 'Sukienki',
    description: 'Letnie sukienki i spódniczki',
    group: 'ubrania',
    color: 'bg-blue-100 text-blue-800',
    examples: ['Sukienka koktajlowa', 'Spódnica boho', 'Sukienka dziecięca'],
    isActive: true,
    sortOrder: 7
  },
  swetry: {
    id: 'swetry',
    name: 'Swetry i kardigany',
    description: 'Swetry, kardigany i kamizelki',
    group: 'ubrania',
    color: 'bg-blue-100 text-blue-800',
    examples: ['Sweter oversize', 'Kardigan zapinany', 'Kamizelka dziecięca'],
    isActive: true,
    sortOrder: 8
  },

  // DEKORACJE DOMOWE
  lapacze_snow: {
    id: 'lapacze_snow',
    name: 'Łapacze snów',
    description: 'Tradycyjne i nowoczesne łapacze snów',
    group: 'dekoracje_domowe',
    color: 'bg-green-100 text-green-800',
    examples: ['Łapacz snów klasyczny', 'Mini łapacz snów', 'Łapacz snów boho'],
    isActive: true,
    sortOrder: 9
  },
  mandale: {
    id: 'mandale',
    name: 'Mandale',
    description: 'Dekoracyjne mandale na ścianę',
    group: 'dekoracje_domowe',
    color: 'bg-green-100 text-green-800',
    examples: ['Mandala wielokolorowa', 'Mandala naturalna', 'Mandala XXL'],
    isActive: true,
    sortOrder: 10
  },
  podkladki: {
    id: 'podkladki',
    name: 'Podkładki',
    description: 'Praktyczne podkładki pod talerze i kubki',
    group: 'dekoracje_domowe',
    color: 'bg-green-100 text-green-800',
    examples: ['Podkładki kwiatowe', 'Serwetki okrągłe', 'Podkładki świąteczne'],
    isActive: true,
    sortOrder: 11
  },
  obrusy: {
    id: 'obrusy',
    name: 'Obrusy i bieżniki',
    description: 'Eleganckie nakrycia stołu',
    group: 'dekoracje_domowe',
    color: 'bg-green-100 text-green-800',
    examples: ['Obrus świąteczny', 'Bieżnik na stół', 'Serweta pod tort'],
    isActive: true,
    sortOrder: 12
  },
  ramki: {
    id: 'ramki',
    name: 'Ramki i obrazki',
    description: 'Ozdobne ramki z szydełkowanymi motywami',
    group: 'dekoracje_domowe',
    color: 'bg-green-100 text-green-800',
    examples: ['Ramka z kwiatami', 'Obrazek rodziny', 'Ramka na zdjęcie dziecka'],
    isActive: true,
    sortOrder: 13
  },
  doniczki: {
    id: 'doniczki',
    name: 'Osłonki na doniczki',
    description: 'Praktyczne i piękne osłonki na rośliny',
    group: 'dekoracje_domowe',
    color: 'bg-green-100 text-green-800',
    examples: ['Osłonka makrama', 'Kosz na doniczkę', 'Wisząca osłonka'],
    isActive: true,
    sortOrder: 14
  },

  // DEKORACJE SEZONOWE
  wielkanoc: {
    id: 'wielkanoc',
    name: 'Wielkanocne',
    description: 'Dekoracje wielkanocne i wiosenne',
    group: 'dekoracje_sezonowe',
    color: 'bg-yellow-100 text-yellow-800',
    examples: ['Jajka wielkanocne', 'Osłonki na jajka', 'Zajączek wielkanocny', 'Koszyczek świąteczny'],
    isActive: true,
    sortOrder: 15
  },
  boze_narodzenie: {
    id: 'boze_narodzenie',
    name: 'Bożonarodzeniowe',
    description: 'Ozdoby świąteczne i zimowe',
    group: 'dekoracje_sezonowe',
    color: 'bg-red-100 text-red-800',
    examples: ['Gwiazdki choinkowe', 'Aniołki', 'Mikołaje', 'Choinka szydełkowa'],
    isActive: true,
    sortOrder: 16
  },
  halloween: {
    id: 'halloween',
    name: 'Halloween',
    description: 'Straszne i zabawne ozdoby na Halloween',
    group: 'dekoracje_sezonowe',
    color: 'bg-orange-100 text-orange-800',
    examples: ['Dynie ozdobne', 'Duchy', 'Pająki', 'Wiedźmy'],
    isActive: true,
    sortOrder: 17
  },
  walentynki: {
    id: 'walentynki',
    name: 'Walentynkowe',
    description: 'Romantyczne ozdoby na Dzień Zakochanych',
    group: 'dekoracje_sezonowe',
    color: 'bg-pink-100 text-pink-800',
    examples: ['Serca ozdobne', 'Anioły miłości', 'Ramki na zdjęcia par'],
    isActive: true,
    sortOrder: 18
  },

  // AKCESORIA
  torby: {
    id: 'torby',
    name: 'Torby i torebki',
    description: 'Stylowe torby na zakupy i na co dzień',
    group: 'akcesoria',
    color: 'bg-purple-100 text-purple-800',
    examples: ['Torba na zakupy', 'Torebka wieczorowa', 'Plecak szydełkowy', 'Kosmetyczka'],
    isActive: true,
    sortOrder: 19
  },
  breloczki: {
    id: 'breloczki',
    name: 'Breloczki',
    description: 'Małe ozdoby do kluczy i torebek',
    group: 'akcesoria',
    color: 'bg-purple-100 text-purple-800',
    examples: ['Breloczek kwiatek', 'Breloczek serce', 'Breloczek zwierzątko'],
    isActive: true,
    sortOrder: 20
  },
  koszyki: {
    id: 'koszyki',
    name: 'Koszyki',
    description: 'Praktyczne pojemniki do przechowywania',
    group: 'akcesoria',
    color: 'bg-purple-100 text-purple-800',
    examples: ['Koszyk na drobiazgi', 'Pojemnik na przybory', 'Kosz na zabawki'],
    isActive: true,
    sortOrder: 21
  },
  bizuteria: {
    id: 'bizuteria',
    name: 'Biżuteria',
    description: 'Ręcznie robiona biżuteria szydełkowa',
    group: 'akcesoria',
    color: 'bg-purple-100 text-purple-800',
    examples: ['Bransoletka koralikowa', 'Naszyjnik boho', 'Kolczyki kwiatki', 'Opaski na głowę'],
    isActive: true,
    sortOrder: 22
  },
  portfele: {
    id: 'portfele',
    name: 'Portfele i etui',
    description: 'Praktyczne portfele i etui na dokumenty',
    group: 'akcesoria',
    color: 'bg-purple-100 text-purple-800',
    examples: ['Portfel damski', 'Etui na okulary', 'Portmonetka'],
    isActive: true,
    sortOrder: 23
  }
}

// Funkcje pomocnicze
export const getAllCategories = (): CategoryInfo[] => {
  return Object.values(CATEGORIES)
    .filter(cat => cat.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

export const getCategoriesByGroup = (groupId: string): CategoryInfo[] => {
  return Object.values(CATEGORIES)
    .filter(cat => cat.group === groupId && cat.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

export const getAllCategoryGroups = (): CategoryGroup[] => {
  return Object.values(CATEGORY_GROUPS)
}

export const getCategoryById = (id: string): CategoryInfo | undefined => {
  return CATEGORIES[id]
}

export const getCategoryGroupById = (id: string): CategoryGroup | undefined => {
  return CATEGORY_GROUPS[id]
}

// Lista kategorii dla selecta w formularzu - pogrupowane
export const getCategoryOptionsGrouped = () => {
  const groups = Object.values(CATEGORY_GROUPS).map(group => ({
    label: group.name,
    options: getCategoriesByGroup(group.id).map(category => ({
      value: category.id,
      label: category.name
    }))
  }))
  
  return groups.filter(group => group.options.length > 0)
}

// Lista kategorii dla selecta - płaska (bez grup)
export const getCategoryOptions = () => {
  return getAllCategories().map(category => ({
    value: category.id,
    label: category.name,
    group: category.group
  }))
}