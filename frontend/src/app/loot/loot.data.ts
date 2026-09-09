import type { CreatureRef } from '@shared/api-contract';

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
  droppedBy: readonly CreatureRef[];
  otherSources: readonly string[];
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

function creature(name: string): CreatureRef {
  return { name, slug: name.replace(/\s+/g, '-') };
}

export const LOOT_ITEMS: readonly LootItem[] = [
  {
    id: 'magic-sword',
    name: 'Magic Sword',
    category: 'weapons',
    description: 'Klasyczny miecz endgame dla collectorow i knightow.',
    droppedBy: [creature('Demon'), creature('Warlock'), creature('Ferumbras')],
    otherSources: [],
    marketValue: 800000,
    stackable: false,
    membersOnly: true,
  },
  {
    id: 'avalanche-rune',
    name: 'Avalanche Rune',
    category: 'runes',
    description: 'Popularna runa AoE do expa i teamhuntow.',
    droppedBy: [],
    otherSources: ['Player crafting', 'Market'],
    marketValue: 320,
    stackable: true,
    membersOnly: false,
  },
  {
    id: 'golden-armor',
    name: 'Golden Armor',
    category: 'armor',
    description: 'Cenny klasyk z bossow i mocniejszych potworow.',
    droppedBy: [creature('Dragon Lord'), creature('Demon')],
    otherSources: [],
    marketValue: 150000,
    stackable: false,
    membersOnly: true,
  },
  {
    id: 'crown-helmet',
    name: 'Crown Helmet',
    category: 'helmets',
    description: 'Jeden z czestszych profitowych helmow na market.',
    droppedBy: [creature('Behemoth'), creature('Hero')],
    otherSources: [],
    marketValue: 12000,
    stackable: false,
    membersOnly: true,
  },
  {
    id: 'knight-legs',
    name: 'Knight Legs',
    category: 'legs',
    description: 'Stabilny loot dla knighta i uniwersalny item na handel.',
    droppedBy: [creature('Dragon Lord'), creature('Frost Dragon')],
    otherSources: [],
    marketValue: 18000,
    stackable: false,
    membersOnly: true,
  },
  {
    id: 'boots-of-haste',
    name: 'Boots of Haste',
    category: 'boots',
    description: 'Buty premium zwiekszajace mobilnosc postaci.',
    droppedBy: [creature('Hero'), creature('Orshabaal')],
    otherSources: [],
    marketValue: 40000,
    stackable: false,
    membersOnly: true,
  },
  {
    id: 'stone-skin-amulet',
    name: 'Stone Skin Amulet',
    category: 'accessories',
    description: 'Przydatny amulet defensywny do bossow i PvE.',
    droppedBy: [],
    otherSources: ['Player crafting', 'Market'],
    marketValue: 3500,
    stackable: true,
    membersOnly: false,
  },
  {
    id: 'green-dragon-leather',
    name: 'Green Dragon Leather',
    category: 'creature-products',
    description: 'Produkt potwora potrzebny do outfitow i questa.',
    droppedBy: [creature('Dragon Lord'), creature('Dragon')],
    otherSources: [],
    marketValue: 1800,
    stackable: true,
    membersOnly: false,
  },
  {
    id: 'gold-ingot',
    name: 'Gold Ingot',
    category: 'valuables',
    description: 'Cenny surowiec i prosty loot do szybkiego sellowania.',
    droppedBy: [creature('Lloyd'), creature('Pirates'), creature('War Golem')],
    otherSources: [],
    marketValue: 5000,
    stackable: true,
    membersOnly: false,
  },
  {
    id: 'fire-sword',
    name: 'Fire Sword',
    category: 'weapons',
    description: 'Tania bron pod progression i market flip.',
    droppedBy: [creature('Dragon'), creature('Dragon Lord'), creature('Hero')],
    otherSources: [],
    marketValue: 4000,
    stackable: false,
    membersOnly: false,
  },
  {
    id: 'demon-shield',
    name: 'Demon Shield',
    category: 'armor',
    description: 'Popularna tarcza z mocnych potworow i bossow.',
    droppedBy: [creature('Demon'), creature('Hellhound')],
    otherSources: [],
    marketValue: 30000,
    stackable: false,
    membersOnly: true,
  },
  {
    id: 'zaoan-helmet',
    name: 'Zaoan Helmet',
    category: 'helmets',
    description: 'Bardzo popularny helm pod hunt i szybki profit.',
    droppedBy: [creature('Lizard Chosen'), creature('Draken Warmaster')],
    otherSources: [],
    marketValue: 9000,
    stackable: false,
    membersOnly: true,
  },
  {
    id: 'blue-legs',
    name: 'Blue Legs',
    category: 'legs',
    description: 'Czesci ekwipunku dla paladyna i knighta.',
    droppedBy: [creature('Hero'), creature('Hydra')],
    otherSources: [],
    marketValue: 15000,
    stackable: false,
    membersOnly: true,
  },
  {
    id: 'soft-boots',
    name: 'Soft Boots',
    category: 'boots',
    description: 'Bardzo chodliwy item utility na market.',
    droppedBy: [creature('Nightmare')],
    otherSources: ['Player trade'],
    marketValue: 120000,
    stackable: false,
    membersOnly: true,
  },
  {
    id: 'ring-of-healing',
    name: 'Ring of Healing',
    category: 'accessories',
    description: 'Akcesorium sustainowe o stalej wartosci rynkowej.',
    droppedBy: [creature('Lloyd'), creature('Monk'), creature('Necromancer')],
    otherSources: [],
    marketValue: 8000,
    stackable: false,
    membersOnly: false,
  },
  {
    id: 'sudden-death-rune',
    name: 'Sudden Death Rune',
    category: 'runes',
    description: 'Mocna runa single target z duzym obrotem na rynku.',
    droppedBy: [],
    otherSources: ['Player crafting', 'Market'],
    marketValue: 220,
    stackable: true,
    membersOnly: false,
  },
  {
    id: 'protective-charm',
    name: 'Protective Charm',
    category: 'creature-products',
    description: 'Produkt craftowy wypadajacy z mistycznych stworzen.',
    droppedBy: [creature('Blue Djinn'), creature('Necromancer')],
    otherSources: [],
    marketValue: 2500,
    stackable: true,
    membersOnly: true,
  },
  {
    id: 'platinum-coin',
    name: 'Platinum Coin',
    category: 'valuables',
    description: 'Podstawowa waluta wypadajaca z wielu potworow.',
    droppedBy: [creature('Lloyd'), creature('Hydra'), creature('Frost Dragon')],
    otherSources: [],
    marketValue: 100,
    stackable: true,
    membersOnly: false,
  },
];
