import type { Coordinates, TibiaRoute } from '../tibia/tibia-map';
import type { Vocation } from '../tibia/vocation';
import huntingPlacesData from './hunting-places.json';

export interface HuntingMonsterResistances {
  energy: number;
  earth: number;
  fire: number;
  ice: number;
  holy: number;
  death: number;
  physical: number;
}

export interface HuntingMonster {
  name: string;
  slug: string;
  health: number;
  experience: number;
  boss: boolean;
  charmPoints: number;
  resistances: HuntingMonsterResistances;
}

export interface HuntingQuest {
  name: string;
  url: string;
}

export interface HuntingImbuement {
  name: string;
  count: number;
}

export interface HuntingPlace {
  id: string;
  name: string;
  minLevel: number;
  rawExp: string;
  profit: string;
  premium: boolean;
  recommendedVocations: Vocation[];
  monsters: HuntingMonster[];
  quests: HuntingQuest[];
  imbuements: HuntingImbuement[];
  trinkets: string[];
  valuableDrop: string[];
  coordinates: Coordinates;
  mapZoom?: number;
  route: TibiaRoute;
}

/**
 * Scraped from tibiaroute.com/pl/hunting-places - dane trzymane w JSON, bo to
 * statyczny zbiór faktów, nie kod. Ten plik dostarcza tylko typy i eksport.
 */
export const HUNTING_PLACES: HuntingPlace[] = huntingPlacesData as HuntingPlace[];
