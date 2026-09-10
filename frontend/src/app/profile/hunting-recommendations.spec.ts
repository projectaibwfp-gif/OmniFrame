import { describe, expect, it } from 'vitest';
import { getHuntingRecommendations } from './hunting-recommendations';

describe('getHuntingRecommendations', () => {
  it('returns two places at or below character level', () => {
    const recommendations = getHuntingRecommendations(300, 'Elite Knight');

    expect(recommendations).toHaveLength(2);
    expect(recommendations.every(({ place }) => place.minLevel <= 300)).toBe(true);
    expect(recommendations[0].place.minLevel).toBeGreaterThanOrEqual(
      recommendations[1].place.minLevel,
    );
  });

  it('prefers places matching character vocation', () => {
    const recommendations = getHuntingRecommendations(1200, 'Elite Knight');

    expect(recommendations[0].vocationMatch).toBe(true);
  });

  it('returns no recommendations without a valid level', () => {
    expect(getHuntingRecommendations(null, null)).toEqual([]);
    expect(getHuntingRecommendations(0, 'Knight')).toEqual([]);
  });
});
