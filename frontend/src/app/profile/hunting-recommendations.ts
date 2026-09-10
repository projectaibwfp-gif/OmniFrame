import { HUNTING_PLACES, type HuntingPlace } from '../hunting-places/hunting-places.data';

const RECOMMENDATION_COUNT = 2;

export interface HuntingRecommendation {
  place: HuntingPlace;
  vocationMatch: boolean;
}

function normalize(value: string | null | undefined): string {
  return value?.trim().toLowerCase() ?? '';
}

function matchesVocation(place: HuntingPlace, vocation: string | null | undefined): boolean {
  const normalizedVocation = normalize(vocation);
  if (!normalizedVocation) {
    return false;
  }

  return place.recommendedVocations.some((recommendedVocation) =>
    normalizedVocation.endsWith(recommendedVocation.toLowerCase()),
  );
}

function byLevelDescending(left: HuntingRecommendation, right: HuntingRecommendation): number {
  if (left.vocationMatch !== right.vocationMatch) {
    return left.vocationMatch ? -1 : 1;
  }

  return (
    right.place.minLevel - left.place.minLevel || left.place.name.localeCompare(right.place.name)
  );
}

export function getHuntingRecommendations(
  level: number | null | undefined,
  vocation: string | null | undefined,
): HuntingRecommendation[] {
  if (typeof level !== 'number' || level < 1) {
    return [];
  }

  const suitablePlaces = HUNTING_PLACES.filter((place) => place.minLevel <= level);
  const vocationPlaces = suitablePlaces
    .filter((place) => matchesVocation(place, vocation))
    .map((place) => ({ place, vocationMatch: true }));
  const otherPlaces = suitablePlaces
    .filter((place) => !matchesVocation(place, vocation))
    .map((place) => ({ place, vocationMatch: false }));
  const pool = [...vocationPlaces, ...otherPlaces].sort(byLevelDescending);

  return pool.slice(0, RECOMMENDATION_COUNT);
}
