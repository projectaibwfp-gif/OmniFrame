import { beforeEach, describe, expect, it, vi } from 'vitest';

const dbMocks = vi.hoisted(() => ({
  getSql: vi.fn(),
  sql: vi.fn(),
}));

vi.mock('./db', () => ({
  getSql: dbMocks.getSql,
}));

import { listHighscoresSnapshots } from './highscores-snapshots';

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
    expect(dataQuery).toContain('DISTINCT ON (normalized_name, world)');
    expect(dataQuery).toContain('paged_characters');
    expect(countQuery).toContain('SELECT DISTINCT normalized_name, world');
  });
});
