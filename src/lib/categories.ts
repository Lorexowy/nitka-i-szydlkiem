// src/lib/categories.ts
export interface CategoryInfo {
  id: string
  name: string
  description: string
  icon?: string
  color: string
  examples: string[]
}

export const CATEGORIES: Record<string, CategoryInfo> = {
  grzechotki: {
    id: 'grzechotki',
    name: 'Grzechotki',
    description: 'Kolorowe i bezpieczne grzechotki dla niemowląt',
    color: 'bg-pink-100 text-pink-800',
    examples: ['Grzechotka słonik', 'Grzechotka kwiatek', 'Grzechotka różdżka']
  },
  maskotki: {
    id: 'maskotki',
    name: 'Maskotki',
    description: 'Urocze przytulanki i pluszaki dla dzieci',
    color: 'bg-purple-100 text-purple-800',
    examples: ['Miś Tadek', 'Królik Maja', 'Słonik Gucio', 'Żaba Kuma']
  },
  lalki: {
    id: 'lalki',
    name: 'Lalki',
    description: 'Ręcznie robione lalki i kukiełki',
    color: 'bg-pink-100 text-pink-800',
    examples: ['Lalka Aniela', 'Wróżka Zuna', 'Księżniczka Rosa']
  },
  czapki: {
    id: 'czapki',
    name: 'Czapki',
    description: 'Ciepłe czapki na każdą porę roku',
    color: 'bg-blue-100 text-blue-800',
    examples: ['Czapka zimowa', 'Beret wiosenny', 'Kapelusz letni']
  },
  chusty: {
    id: 'chusty',
    name: 'Chusty i szaliki',
    description: 'Eleganckie chusty, szaliki i kominy',
    color: 'bg-indigo-100 text-indigo-800',
    examples: ['Szalik komin', 'Chusta trójkątna', 'Etola wieczorowa']
  },
  rekawiczki: {
    id: 'rekawiczki',
    name: 'Rękawiczki',
    description: 'Ciepłe rękawiczki i mitenki',
    color: 'bg-cyan-100 text-cyan-800',
    examples: ['Rękawiczki zimowe', 'Mitenki bez palców', 'Rękawiczki dziecięce']
  },
  sukienki: {
    id: 'sukienki',
    name: 'Sukienki',
    description: 'Letnie sukienki i spódniczki',
    color: 'bg-rose-100 text-rose-800',
    examples: ['Sukienka koktajlowa', 'Spódnica boho', 'Sukienka dziecięca']
  },
  swetry: {
    id: 'swetry',
    name: 'Swetry i kardigany',
    description: 'Swetry, kardigany i kamizelki',
    color: 'bg-amber-100 text-amber-800',
    examples: ['Sweter oversize', 'Kardigan zapinany', 'Kamizelka dziecięca']
  },
  lapacze_snow: {
    id: 'lapacze_snow',
    name: 'Łapacze snów',
    description: 'Tradycyjne i nowoczesne łapacze snów',
    color: 'bg-emerald-100 text-emerald-800',
    examples: ['Łapacz snów klasyczny', 'Mini łapacz snów', 'Łapacz snów boho']
  },
  mandale: {
    id: 'mandale',
    name: 'Mandale',
    description: 'Dekoracyjne mandale na ścianę',
    color: 'bg-green-100 text-green-800',
    examples: ['Mandala wielokolorowa', 'Mandala naturalna', 'Mandala XXL']
  },
  podkladki: {
    id: 'podkladki',
    name: 'Podkładki',
    description: 'Praktyczne podkładki pod talerze i kubki',
    color: 'bg-teal-100 text-teal-800',
    examples: ['Podkładki kwiatowe', 'Serwetki okrągłe', 'Podkładki świąteczne']
  },
  obrusy: {
    id: 'obrusy',
    name: 'Obrusy i bieżniki',
    description: 'Eleganckie nakrycia stołu',
    color: 'bg-lime-100 text-lime-800',
    examples: ['Obrus świąteczny', 'Bieżnik na stół', 'Serweta pod tort']
  },
  ramki: {
    id: 'ramki',
    name: 'Ramki i obrazki',
    description: 'Ozdobne ramki z szydełkowanymi motywami',
    color: 'bg-yellow-100 text-yellow-800',
    examples: ['Ramka z kwiatami', 'Obrazek rodziny', 'Ramka na zdjęcie dziecka']
  },
  doniczki: {
    id: 'doniczki',
    name: 'Osłonki na doniczki',
    description: 'Praktyczne i piękne osłonki na rośliny',
    color: 'bg-green-100 text-green-800',
    examples: ['Osłonka makrama', 'Kosz na doniczkę', 'Wisząca osłonka']
  },
  wielkanoc: {
    id: 'wielkanoc',
    name: 'Wielkanocne',
    description: 'Dekoracje wielkanocne i wiosenne',
    color: 'bg-yellow-100 text-yellow-800',
    examples: ['Jajka wielkanocne', 'Osłonki na jajka', 'Zajączek wielkanocny', 'Koszyczek świąteczny']
  },
  boze_narodzenie: {
    id: 'boze_narodzenie',
    name: 'Bożonarodzeniowe',
    description: 'Ozdoby świąteczne i zimowe',
    color: 'bg-red-100 text-red-800',
    examples: ['Gwiazdki choinkowe', 'Aniołki', 'Mikołaje', 'Choinka szydełkowa']
  },
  halloween: {
    id: 'halloween',
    name: 'Halloween',
    description: 'Straszne i zabawne ozdoby na Halloween',
    color: 'bg-orange-100 text-orange-800',
    examples: ['Dynie ozdobne', 'Duchy', 'Pająki', 'Wiedźmy']
  },
  walentynki: {
    id: 'walentynki',
    name: 'Walentynkowe',
    description: 'Romantyczne ozdoby na Dzień Zakochanych',
    color: 'bg-pink-100 text-pink-800',
    examples: ['Serca ozdobne', 'Anioły miłości', 'Ramki na zdjęcia par']
  },
  torby: {
    id: 'torby',
    name: 'Torby i torebki',
    description: 'Stylowe torby na zakupy i na co dzień',
    color: 'bg-purple-100 text-purple-800',
    examples: ['Torba na zakupy', 'Torebka wieczorowa', 'Plecak szydełkowy', 'Kosmetyczka']
  },
  breloczki: {
    id: 'breloczki',
    name: 'Breloczki',
    description: 'Małe ozdoby do kluczy i torebek',
    color: 'bg-violet-100 text-violet-800',
    examples: ['Breloczek kwiatek', 'Breloczek serce', 'Breloczek zwierzątko']
  },
  koszyki: {
    id: 'koszyki',
    name: 'Koszyki',
    description: 'Praktyczne pojemniki do przechowywania',
    color: 'bg-stone-100 text-stone-800',
    examples: ['Koszyk na drobiazgi', 'Pojemnik na przybory', 'Kosz na zabawki']
  },
  bizuteria: {
    id: 'bizuteria',
    name: 'Biżuteria',
    description: 'Ręcznie robiona biżuteria szydełkowa',
    color: 'bg-fuchsia-100 text-fuchsia-800',
    examples: ['Bransoletka koralikowa', 'Naszyjnik boho', 'Kolczyki kwiatki', 'Opaski na głowę']
  },
  portfele: {
    id: 'portfele',
    name: 'Portfele i etui',
    description: 'Praktyczne portfele i etui na dokumenty',
    color: 'bg-slate-100 text-slate-800',
    examples: ['Portfel damski', 'Etui na okulary', 'Portmonetka']
  }
}

// Funkcje pomocnicze
export const getAllCategories = (): CategoryInfo[] => {
  return Object.values(CATEGORIES)
}

export const getCategoryById = (id: string): CategoryInfo | undefined => {
  return CATEGORIES[id]
}

// Lista kategorii dla selecta w formularzu
export const getCategoryOptions = () => {
  return Object.values(CATEGORIES).map(category => ({
    value: category.id,
    label: category.name
  }))
}