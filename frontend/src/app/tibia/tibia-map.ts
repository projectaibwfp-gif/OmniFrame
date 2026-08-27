export const DEFAULT_MAP_ZOOM = 3;

export interface Coordinates {
  x: number;
  y: number;
  z: number;
}

export function buildTibiaMapUrl(
  coordinates: Coordinates,
  zoom: number = DEFAULT_MAP_ZOOM,
): string {
  return `https://tibiamaps.io/map/embed/#${coordinates.x},${coordinates.y},${coordinates.z}:${zoom}`;
}

export type TibiaRouteMarkerIcon = 'star' | 'crossmark';

export interface TibiaRouteMarker {
  icon: TibiaRouteMarkerIcon;
  x: number;
  y: number;
  floor: number;
}

export interface TibiaRoutePathPoint {
  x: number;
  y: number;
}

export interface TibiaRoutePath {
  floor: number;
  points: TibiaRoutePathPoint[];
}

export interface TibiaRoute {
  markers: TibiaRouteMarker[];
  paths: TibiaRoutePath[];
}

export const TIBIA_MINIMAP_TILE_SIZE = 256;
const TIBIA_MINIMAP_TILE_BASE_URL = 'https://tibiamaps.github.io/tibia-map-data/mapper';

export function buildTibiaMinimapTileUrl(sectorX: number, sectorY: number, floor: number): string {
  return `${TIBIA_MINIMAP_TILE_BASE_URL}/Minimap_Color_${sectorX}_${sectorY}_${floor}.png`;
}

export function tibiaMinimapSectorOrigin(worldCoordinate: number): number {
  return Math.floor(worldCoordinate / TIBIA_MINIMAP_TILE_SIZE) * TIBIA_MINIMAP_TILE_SIZE;
}
