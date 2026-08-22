import type { BoostableBossDto, BoostableBossesDto } from '@shared/api-contract';

const DEFAULT_TIBIA_DATA_API_BASE_URL = 'https://api.tibiadata.com/v4';

export const TIBIA_DATA_API_BASE_URL =
  process.env.TIBIA_DATA_API_BASE_URL?.trim() || DEFAULT_TIBIA_DATA_API_BASE_URL;

interface TibiaDataBoostableBoss {
  name?: unknown;
  image_url?: unknown;
  featured?: unknown;
}

interface TibiaDataBoostableBossesResponse {
  boostable_bosses?: {
    boosted?: TibiaDataBoostableBoss;
    boostable_boss_list?: TibiaDataBoostableBoss[];
  };
}

function mapBoss(boss: TibiaDataBoostableBoss | undefined): BoostableBossDto | null {
  if (!boss) {
    return null;
  }

  if (typeof boss.name !== 'string' || typeof boss.image_url !== 'string') {
    return null;
  }

  return {
    name: boss.name,
    imageUrl: boss.image_url,
    featured: boss.featured === true,
  };
}

export async function fetchBoostableBosses(): Promise<BoostableBossesDto> {
  const response = await fetch(`${TIBIA_DATA_API_BASE_URL}/boostablebosses`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`TibiaData request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as TibiaDataBoostableBossesResponse;
  return {
    boosted: mapBoss(payload.boostable_bosses?.boosted),
    boostableBossList: (payload.boostable_bosses?.boostable_boss_list ?? [])
      .map((boss) => mapBoss(boss))
      .filter((boss): boss is BoostableBossDto => boss !== null),
  };
}
