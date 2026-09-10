import { describe, expect, it, vi } from 'vitest';
import type { HighscoresSnapshotRecordDto } from '@shared/api-contract';
import { groupSnapshotRecords } from './highscores-grouping';

vi.mock('../core/date-time', () => ({
  formatDateTime: (value: string): string => value,
  toLocalDayKey: (value: string): string => value.slice(0, 10),
}));

function createRecord(
  id: number,
  characterName: string,
  world: string,
  checkedAt: string,
): HighscoresSnapshotRecordDto {
  return {
    id,
    characterName,
    world,
    vocation: 'Elite Knight',
    level: 100,
    rank: id,
    exactExperience: id * 1000,
    checkedAt,
  };
}

describe('groupSnapshotRecords', () => {
  it('groups snapshots by character and world without changing unique groups', () => {
    const records = [
      createRecord(1, 'Knight', 'Dia', '2026-09-10T12:00:00.000Z'),
      createRecord(2, 'Knight', 'Dia', '2026-09-09T12:00:00.000Z'),
      createRecord(3, 'Mage', 'Dia', '2026-09-10T11:00:00.000Z'),
    ];

    const groups = groupSnapshotRecords(records);

    expect(groups).toHaveLength(2);
    expect(groups[0].latest.id).toBe(1);
    expect(groups[0].older.map((record) => record.id)).toEqual([2]);
  });

  it('keeps same-named characters from different worlds separate', () => {
    const records = [
      createRecord(1, 'Knight', 'Dia', '2026-09-10T12:00:00.000Z'),
      createRecord(2, 'Knight', 'Amera', '2026-09-10T11:00:00.000Z'),
    ];

    expect(groupSnapshotRecords(records)).toHaveLength(2);
  });
});
