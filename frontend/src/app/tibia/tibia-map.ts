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
