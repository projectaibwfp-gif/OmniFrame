import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./highscores-snapshots', () => ({
  getLatestHighscoresSnapshot: vi.fn(),
  saveHighscoresSnapshots: vi.fn(),
}));

import { fetchKillStatistics, TibiaDataNotFoundError } from './tibiadata';

const fetchMock = vi.fn();

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe('fetchKillStatistics', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('maps kill statistics entries for a world', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        {
          killstatistics: {
            world: 'Dia',
            updated_at: '2026-10-15T08:00:00Z',
            entries: [
              {
                race: 'dragon',
                last_day_players_killed: 1,
                last_day_killed: 20,
                last_week_players_killed: 3,
                last_week_killed: 140,
              },
              { race: 'broken entry' },
            ],
          },
        },
        200,
      ),
    );

    await expect(fetchKillStatistics('Dia')).resolves.toEqual({
      world: 'Dia',
      updatedAt: '2026-10-15T08:00:00Z',
      entries: [
        {
          race: 'dragon',
          lastDayPlayersKilled: 1,
          lastDayKilled: 20,
          lastWeekPlayersKilled: 3,
          lastWeekKilled: 140,
        },
      ],
    });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/killstatistics/Dia'),
      expect.objectContaining({ cache: 'no-store', signal: expect.any(AbortSignal) }),
    );
  });

  it('throws TibiaDataNotFoundError when TibiaData responds with 404', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ information: { status: { http_code: 404 } } }, 404));

    await expect(fetchKillStatistics('Nowhere')).rejects.toBeInstanceOf(TibiaDataNotFoundError);
  });

  it('throws a generic error for other non-OK responses', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ killstatistics: { entries: [] } }, 500));

    const error: unknown = await fetchKillStatistics('Dia').catch((reason: unknown) => reason);

    expect(error).toBeInstanceOf(Error);
    expect(error).not.toBeInstanceOf(TibiaDataNotFoundError);
    expect((error as Error).message).toBe('TibiaData request failed with status 500');
  });
});
