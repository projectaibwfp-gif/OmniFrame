export type Vocation = 'Knight' | 'Paladin' | 'Mage' | 'Druid' | 'Sorcerer' | 'Monk';

export interface CharmPlace {
  id: string;
  creatureName: string;
  placeName: string;
  city: string;
  minLevel: number;
  recommendedVocations: Vocation[];
  description: string;
}

export const CHARM_PLACES: CharmPlace[] = [
  {
    id: 'ancient-scarab-ankrahmun',
    creatureName: 'Ancient Scarab',
    placeName: 'Ankrahmun Tombs',
    city: 'Ankrahmun',
    minLevel: 40,
    recommendedVocations: ['Paladin', 'Mage', 'Druid', 'Sorcerer'],
    description: 'Klasyczne miejsce na charm z Ancient Scarab pod Ankrahmun.',
  },
  {
    id: 'hydra-drefia',
    creatureName: 'Hydra',
    placeName: 'Drefia Hydras',
    city: 'Darashia',
    minLevel: 70,
    recommendedVocations: ['Knight', 'Paladin', 'Mage', 'Druid', 'Sorcerer'],
    description: 'Hydry w Drefii — dobry charm dla wszystkich profesji.',
  },
  {
    id: 'sea-serpent-svargrond',
    creatureName: 'Sea Serpent',
    placeName: 'Sea Serpent Area',
    city: 'Svargrond',
    minLevel: 80,
    recommendedVocations: ['Paladin', 'Mage', 'Druid', 'Sorcerer'],
    description: 'Morskie węże na północy. Popularny charm dla strzelców i magów.',
  },
  {
    id: 'nightmare-yalahar',
    creatureName: 'Nightmare',
    placeName: 'Yalahar Nightmares',
    city: 'Yalahar',
    minLevel: 80,
    recommendedVocations: ['Knight', 'Paladin', 'Mage', 'Druid', 'Sorcerer'],
    description: 'Koszmarne wyspy w Yalahar. Dużo Nightmare i Hellspawn.',
  },
  {
    id: 'wyrm-liberty-bay',
    creatureName: 'Wyrm',
    placeName: 'Wyrm Cave',
    city: 'Liberty Bay',
    minLevel: 90,
    recommendedVocations: ['Paladin', 'Mage', 'Druid', 'Sorcerer'],
    description: 'Wyrmy koło Liberty Bay. Szybki charm dla strzelców i magów.',
  },
  {
    id: 'grim-reaper-yalahar',
    creatureName: 'Grim Reaper',
    placeName: 'Yalahar Grim Reapers',
    city: 'Yalahar',
    minLevel: 120,
    recommendedVocations: ['Paladin', 'Mage', 'Druid', 'Sorcerer'],
    description: 'Grim Reapery w Yalahar. Wysoki poziom, ale szybki charm.',
  },
  {
    id: 'gazer-spectre-buried-cathedral',
    creatureName: 'Gazer Spectre',
    placeName: 'Buried Cathedral',
    city: 'Feyrist',
    minLevel: 160,
    recommendedVocations: ['Mage', 'Druid', 'Sorcerer'],
    description: 'Spectre w Buried Cathedral. Najlepsze dla magów z area damage.',
  },
  {
    id: 'cobra-assassin-bastion',
    creatureName: 'Cobra Assassin',
    placeName: 'Cobra Bastion',
    city: 'Issavi',
    minLevel: 150,
    recommendedVocations: ['Knight', 'Paladin'],
    description: 'Cobry w Issavi. Charm dla knightów i paladinów.',
  },
  {
    id: 'mean-lost-soul-netherworld',
    creatureName: 'Mean Lost Soul',
    placeName: 'Netherworld',
    city: 'Roshamuul',
    minLevel: 200,
    recommendedVocations: ['Mage', 'Druid', 'Sorcerer'],
    description: 'Lost Soule w Netherworld. Endgame charm dla magów.',
  },
  {
    id: 'naga-archer-marapur',
    creatureName: 'Naga Archer',
    placeName: 'Marapur Nagas',
    city: 'Marapur',
    minLevel: 200,
    recommendedVocations: ['Knight', 'Paladin', 'Mage', 'Druid', 'Sorcerer'],
    description: 'Nagi w Marapur. Charm dla wszystkich profesji na wysokim poziomie.',
  },
];

export const VOCATIONS: Vocation[] = ['Knight', 'Paladin', 'Mage', 'Druid', 'Sorcerer', 'Monk'];

export const CITIES = [...new Set(CHARM_PLACES.map((place) => place.city))].sort();
