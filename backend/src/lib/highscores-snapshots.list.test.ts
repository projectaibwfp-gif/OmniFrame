import { beforeEach, describe, expect, it, vi } from 'vitest';

const dbMocks = vi.hoisted(() => ({
  getSql: vi.fn(),
  sql: vi.fn(),
}));

vi.mock('./db', () => ({
  getSql: dbMocks.getSql,
}));

import {
  CHARACTER_HIGHSCORES_HISTORY_LIMIT,
  listCharacterHighscoresHistory,
  listHighscoresSnapshots,
  saveHighscoresSnapshots,
} from './highscores-snapshots';

describe('listHighscoresSnapshots', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbMocks.getSql.mockReturnValue(dbMocks.sql);
  });

  it('pages and counts unique characters while retaining older snapshots in the page', async () => {
    dbMocks.sql
      .mockResolvedValueOnce([
        {
          id: 1,
          characterName: 'Knight',
          world: 'Dia',
          vocation: 'Elite Knight',
          level: 100,
          rank: 1,
          exactExperience: 1000,
          checkedAt: '2026-09-10T12:00:00.000Z',
        },
        {
          id: 2,
          characterName: 'Knight',
          world: 'Dia',
          vocation: 'Elite Knight',
          level: 99,
          rank: 2,
          exactExperience: 900,
          checkedAt: '2026-09-09T12:00:00.000Z',
        },
      ])
      .mockResolvedValueOnce([{ total: '50' }])
      .mockResolvedValueOnce([{ world: 'Dia' }]);

    const result = await listHighscoresSnapshots(1, 50, null, 'desc');

    expect(result.data).toHaveLength(2);
    expect(result.total).toBe(50);

    const dataQuery = (dbMocks.sql.mock.calls[0]?.[0] as TemplateStringsArray).join(' ');
    const countQuery = (dbMocks.sql.mock.calls[1]?.[0] as TemplateStringsArray).join(' ');
    expect(dataQuery).toContain('FROM character_highscores_latest');
    expect(dataQuery).not.toContain('DISTINCT ON');
    expect(dataQuery).toContain('paged_characters');
    expect(countQuery).toContain('FROM character_highscores_latest');
  });

  it('uses one query for both sort directions and binds the direction as a value', async () => {
    dbMocks.sql
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ total: 0 }])
      .mockResolvedValueOnce([]);

    const result = await listHighscoresSnapshots(2, 10, 'Dia', 'asc');

    const [strings, ...values] = dbMocks.sql.mock.calls[0] as [TemplateStringsArray, ...unknown[]];
    expect(strings.join(' ')).toContain('THEN level END ASC');
    expect(values).toEqual(['Dia', 'Dia', 'asc', 'asc', 10, 10, 'asc', 'asc']);
    expect(result).toEqual({ data: [], total: 0, worlds: [] });
  });
});

describe('listCharacterHighscoresHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbMocks.getSql.mockReturnValue(dbMocks.sql);
  });

  it('returns limited history with canonical ISO timestamps', async () => {
    dbMocks.sql.mockResolvedValueOnce([
      {
        id: 3,
        characterName: 'Trollefar',
        world: 'Antica',
        vocation: 'Elite Knight',
        level: 400,
        rank: 12,
        exactExperience: 1000,
        checkedAt: '2026-08-17 12:00:00+00',
      },
    ]);

    const history = await listCharacterHighscoresHistory('Trollefar');

    expect(history).toEqual([
      {
        id: 3,
        characterName: 'Trollefar',
        world: 'Antica',
        vocation: 'Elite Knight',
        level: 400,
        rank: 12,
        exactExperience: 1000,
        checkedAt: '2026-08-17T12:00:00.000Z',
      },
    ]);
    const values = dbMocks.sql.mock.calls[0]?.slice(1);
    expect(values).toEqual(['trollefar', CHARACTER_HIGHSCORES_HISTORY_LIMIT]);
  });
});

describe('saveHighscoresSnapshots', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbMocks.getSql.mockReturnValue(dbMocks.sql);
    dbMocks.sql.mockResolvedValue([]);
  });

  it('saves the whole batch in one statement with one entry per character', async () => {
    await saveHighscoresSnapshots([
      {
        characterName: 'Knight',
        world: 'Dia',
        vocation: 'Elite Knight',
        level: 100,
        rank: 1,
        exactExperience: 1000,
      },
      {
        characterName: 'knight',
        world: 'Dia',
        vocation: 'Elite Knight',
        level: 100,
        rank: 1,
        exactExperience: 1000,
      },
      {
        characterName: 'Druid',
        world: 'Dia',
        vocation: 'Elder Druid',
        level: 90,
        rank: 2,
        exactExperience: 900,
      },
    ]);

    expect(dbMocks.sql).toHaveBeenCalledTimes(1);
    const [strings, ...values] = dbMocks.sql.mock.calls[0] as [TemplateStringsArray, ...unknown[]];
    expect(strings.join(' ')).toContain('unnest(');
    expect(strings.join(' ')).toContain('ON CONFLICT (normalized_name, world) DO UPDATE');
    expect(values[1]).toEqual(['knight', 'druid']);
  });

  it('skips the database for an empty batch', async () => {
    await saveHighscoresSnapshots([]);

    expect(dbMocks.sql).not.toHaveBeenCalled();
  });
});
