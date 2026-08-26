import type { Coordinates } from '../tibia/tibia-map';
import type { Vocation } from '../tibia/vocation';

export interface CharmPlace {
  id: string;
  creatureName: string;
  placeName: string;
  city: string;
  minLevel: number;
  recommendedVocations: Vocation[];
  description: string;
  coordinates: Coordinates;
  mapZoom?: number;
}

export const CHARM_PLACES: CharmPlace[] = [
  {
    id: 'ancient-scarab-ankrahmun',
    creatureName: 'Ancient Scarab',
    placeName: 'Ankrahmun Tombs',
    city: 'Ankrahmun',
    minLevel: 40,
    recommendedVocations: ['Paladin', 'Druid', 'Sorcerer'],
    description: 'Klasyczne miejsce na charm z Ancient Scarab pod Ankrahmun.',
    coordinates: { x: 33138, y: 32842, z: 7 },
    mapZoom: 3,
  },
  {
    id: 'hydra-drefia',
    creatureName: 'Hydra',
    placeName: 'Drefia Hydras',
    city: 'Darashia',
    minLevel: 70,
    recommendedVocations: ['Knight', 'Paladin', 'Druid', 'Sorcerer'],
    description: 'Hydry w Drefii — dobry charm dla wszystkich profesji.',
    coordinates: { x: 33046, y: 32429, z: 7 },
    mapZoom: 3,
  },
  {
    id: 'sea-serpent-svargrond',
    creatureName: 'Sea Serpent',
    placeName: 'Sea Serpent Area',
    city: 'Svargrond',
    minLevel: 80,
    recommendedVocations: ['Paladin', 'Druid', 'Sorcerer'],
    description: 'Morskie węże na północy. Popularny charm dla strzelców i magów.',
    coordinates: { x: 32212, y: 31088, z: 7 },
    mapZoom: 3,
  },
  {
    id: 'nightmare-yalahar',
    creatureName: 'Nightmare',
    placeName: 'Yalahar Nightmares',
    city: 'Yalahar',
    minLevel: 80,
    recommendedVocations: ['Knight', 'Paladin', 'Druid', 'Sorcerer'],
    description: 'Koszmarne wyspy w Yalahar. Dużo Nightmare i Hellspawn.',
    coordinates: { x: 32745, y: 31215, z: 7 },
    mapZoom: 3,
  },
  {
    id: 'wyrm-liberty-bay',
    creatureName: 'Wyrm',
    placeName: 'Wyrm Cave',
    city: 'Liberty Bay',
    minLevel: 90,
    recommendedVocations: ['Paladin', 'Druid', 'Sorcerer'],
    description: 'Wyrmy koło Liberty Bay. Szybki charm dla strzelców i magów.',
    coordinates: { x: 32629, y: 32743, z: 7 },
    mapZoom: 3,
  },
  {
    id: 'grim-reaper-yalahar',
    creatureName: 'Grim Reaper',
    placeName: 'Yalahar Grim Reapers',
    city: 'Yalahar',
    minLevel: 120,
    recommendedVocations: ['Paladin', 'Druid', 'Sorcerer'],
    description: 'Grim Reapery w Yalahar. Wysoki poziom, ale szybki charm.',
    coordinates: { x: 32745, y: 31215, z: 7 },
    mapZoom: 3,
  },
  {
    id: 'gazer-spectre-buried-cathedral',
    creatureName: 'Gazer Spectre',
    placeName: 'Buried Cathedral',
    city: 'Feyrist',
    minLevel: 160,
    recommendedVocations: ['Druid', 'Sorcerer'],
    description: 'Spectre w Buried Cathedral. Najlepsze dla magów z area damage.',
    coordinates: { x: 33542, y: 32308, z: 7 },
    mapZoom: 3,
  },
  {
    id: 'cobra-assassin-bastion',
    creatureName: 'Cobra Assassin',
    placeName: 'Cobra Bastion',
    city: 'Issavi',
    minLevel: 150,
    recommendedVocations: ['Knight', 'Paladin'],
    description: 'Cobry w Issavi. Charm dla knightów i paladinów.',
    coordinates: { x: 33936, y: 31503, z: 7 },
    mapZoom: 3,
  },
  {
    id: 'mean-lost-soul-netherworld',
    creatureName: 'Mean Lost Soul',
    placeName: 'Netherworld',
    city: 'Roshamuul',
    minLevel: 200,
    recommendedVocations: ['Druid', 'Sorcerer'],
    description: 'Lost Soule w Netherworld. Endgame charm dla magów.',
    coordinates: { x: 33520, y: 32365, z: 7 },
    mapZoom: 3,
  },
  {
    id: 'naga-archer-marapur',
    creatureName: 'Naga Archer',
    placeName: 'Marapur Nagas',
    city: 'Marapur',
    minLevel: 200,
    recommendedVocations: ['Knight', 'Paladin', 'Druid', 'Sorcerer'],
    description: 'Nagi w Marapur. Charm dla wszystkich profesji na wysokim poziomie.',
    coordinates: { x: 33862, y: 32790, z: 7 },
    mapZoom: 3,
  },
];

export const CITIES = [...new Set(CHARM_PLACES.map((place) => place.city))].sort();
