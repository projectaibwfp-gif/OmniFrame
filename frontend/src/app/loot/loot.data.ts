export type LootCategory =
  | 'weapons'
  | 'armor'
  | 'helmets'
  | 'legs'
  | 'boots'
  | 'accessories'
  | 'runes'
  | 'creature-products'
  | 'valuables';

export interface LootItem {
  id: string;
  name: string;
  category: LootCategory;
  description: string;
  sources: readonly string[];
  marketValue: number;
  stackable: boolean;
  membersOnly: boolean;
}

export const LOOT_CATEGORIES: readonly LootCategory[] = [
  'weapons',
  'armor',
  'helmets',
  'legs',
  'boots',
  'accessories',
  'runes',
  'creature-products',
  'valuables',
];

export const LOOT_ITEMS: readonly LootItem[] = [
  {
    id: 'magic-sword',
    name: 'Magic Sword',
    category: 'weapons',
    description: 'Klasyczny miecz endgame dla collectorow i knightow.',
    sources: ['Demon', 'Warlock', 'Ferumbras'],
    marketValue: 800000,
    stackable: false,
    membersOnly: true,
  },
  {
    id: 'avalanche-rune',
    name: 'Avalanche Rune',
    category: 'runes',
    description: 'Popularna runa AoE do expa i teamhuntow.',
    sources: ['Player crafting', 'Market'],
    marketValue: 320,
    stackable: true,
    membersOnly: false,
  },
  {
    id: 'golden-armor',
    name: 'Golden Armor',
    category: 'armor',
    description: 'Cenny klasyk z bossow i mocniejszych potworow.',
    sources: ['Dragon Lord', 'Demon'],
    marketValue: 150000,
    stackable: false,
    membersOnly: true,
  },
  {
    id: 'crown-helmet',
    name: 'Crown Helmet',
    category: 'helmets',
    description: 'Jeden z czestszych profitowych helmow na market.',
    sources: ['Behemoth', 'Hero'],
    marketValue: 12000,
    stackable: false,
    membersOnly: true,
  },
  {
    id: 'knight-legs',
    name: 'Knight Legs',
    category: 'legs',
    description: 'Stabilny loot dla knighta i uniwersalny item na handel.',
    sources: ['Dragon Lord', 'Frost Dragon'],
    marketValue: 18000,
    stackable: false,
    membersOnly: true,
  },
  {
    id: 'boots-of-haste',
    name: 'Boots of Haste',
    category: 'boots',
    description: 'Buty premium zwiekszajace mobilnosc postaci.',
    sources: ['Hero', 'Orshabaal'],
    marketValue: 40000,
    stackable: false,
    membersOnly: true,
  },
  {
    id: 'stone-skin-amulet',
    name: 'Stone Skin Amulet',
    category: 'accessories',
    description: 'Przydatny amulet defensywny do bossow i PvE.',
    sources: ['Player crafting', 'Market'],
    marketValue: 3500,
    stackable: true,
    membersOnly: false,
  },
  {
    id: 'green-dragon-leather',
    name: 'Green Dragon Leather',
    category: 'creature-products',
    description: 'Produkt potwora potrzebny do outfitow i questa.',
    sources: ['Dragon Lord', 'Dragon'],
    marketValue: 1800,
    stackable: true,
    membersOnly: false,
  },
  {
    id: 'gold-ingot',
    name: 'Gold Ingot',
    category: 'valuables',
    description: 'Cenny surowiec i prosty loot do szybkiego sellowania.',
    sources: ['Lloyd', 'Pirates', 'War Golem'],
    marketValue: 5000,
    stackable: true,
    membersOnly: false,
  },
  {
    id: 'fire-sword',
    name: 'Fire Sword',
    category: 'weapons',
    description: 'Tania bron pod progression i market flip.',
    sources: ['Dragon', 'Dragon Lord', 'Hero'],
    marketValue: 4000,
    stackable: false,
    membersOnly: false,
  },
  {
    id: 'demon-shield',
    name: 'Demon Shield',
    category: 'armor',
    description: 'Popularna tarcza z mocnych potworow i bossow.',
    sources: ['Demon', 'Hellhound'],
    marketValue: 30000,
    stackable: false,
    membersOnly: true,
  },
  {
    id: 'zaoan-helmet',
    name: 'Zaoan Helmet',
    category: 'helmets',
    description: 'Bardzo popularny helm pod hunt i szybki profit.',
    sources: ['Lizard Chosen', 'Draken Warmaster'],
    marketValue: 9000,
    stackable: false,
    membersOnly: true,
  },
  {
    id: 'blue-legs',
    name: 'Blue Legs',
    category: 'legs',
    description: 'Czesci ekwipunku dla paladyna i knighta.',
    sources: ['Hero', 'Hydra'],
    marketValue: 15000,
    stackable: false,
    membersOnly: true,
  },
  {
    id: 'soft-boots',
    name: 'Soft Boots',
    category: 'boots',
    description: 'Bardzo chodliwy item utility na market.',
    sources: ['Nightmare', 'Player trade'],
    marketValue: 120000,
    stackable: false,
    membersOnly: true,
  },
  {
    id: 'ring-of-healing',
    name: 'Ring of Healing',
    category: 'accessories',
    description: 'Akcesorium sustainowe o stalej wartosci rynkowej.',
    sources: ['Lloyd', 'Monk', 'Necromancer'],
    marketValue: 8000,
    stackable: false,
    membersOnly: false,
  },
  {
    id: 'sudden-death-rune',
    name: 'Sudden Death Rune',
    category: 'runes',
    description: 'Mocna runa single target z duzym obrotem na rynku.',
    sources: ['Player crafting', 'Market'],
    marketValue: 220,
    stackable: true,
    membersOnly: false,
  },
  {
    id: 'protective-charm',
    name: 'Protective Charm',
    category: 'creature-products',
    description: 'Produkt craftowy wypadajacy z mistycznych stworzen.',
    sources: ['Blue Djinn', 'Necromancer'],
    marketValue: 2500,
    stackable: true,
    membersOnly: true,
  },
  {
    id: 'platinum-coin',
    name: 'Platinum Coin',
    category: 'valuables',
    description: 'Podstawowa waluta wypadajaca z wielu potworow.',
    sources: ['Lloyd', 'Hydra', 'Frost Dragon'],
    marketValue: 100,
    stackable: true,
    membersOnly: false,
  },
];
