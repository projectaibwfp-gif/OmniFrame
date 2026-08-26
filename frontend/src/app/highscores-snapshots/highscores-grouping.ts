import type { HighscoresSnapshotRecordDto } from '@shared/api-contract';
import { formatDateTime, toLocalDayKey } from '../core/date-time';

export const PAGE_SIZE = 50;

export interface GroupedSnapshotRecord {
  latest: HighscoresSnapshotRecordDto;
  older: HighscoresSnapshotRecordDto[];
  previousDayExperienceIncrease: number | null;
}

function getCheckedAtTimestamp(checkedAt: string): number {
  const parsed = Date.parse(checkedAt);
  if (Number.isNaN(parsed)) {
    return 0;
  }

  return parsed;
}

// Dzień liczymy w strefie przeglądarki, bo tak samo pokazujemy go użytkownikowi -
// klucz z UTC rozjeżdżałby przyrost EXP dla snapshotów tuż po lokalnej północy.
function getCheckedAtDay(checkedAt: string): string {
  return toLocalDayKey(checkedAt) || checkedAt;
}

function getPreviousDayExperienceIncrease(
  sortedRecords: readonly HighscoresSnapshotRecordDto[],
): number | null {
  if (sortedRecords.length < 2) {
    return null;
  }

  const latest = sortedRecords[0];
  const latestDay = getCheckedAtDay(latest.checkedAt);
  for (let index = 1; index < sortedRecords.length; index += 1) {
    const olderRecord = sortedRecords[index];
    const olderDay = getCheckedAtDay(olderRecord.checkedAt);
    if (olderDay === latestDay) {
      continue;
    }

    return latest.exactExperience - olderRecord.exactExperience;
  }

  return null;
}

export function formatCheckedAt(checkedAt: string): string {
  return formatDateTime(checkedAt);
}

export function groupSnapshotRecords(
  records: readonly HighscoresSnapshotRecordDto[],
): GroupedSnapshotRecord[] {
  const groups = new Map<string, HighscoresSnapshotRecordDto[]>();

  for (const record of records) {
    const key = record.characterName.trim().toLowerCase();
    const current = groups.get(key) ?? [];
    current.push(record);
    groups.set(key, current);
  }

  const mappedGroups: GroupedSnapshotRecord[] = [];
  for (const groupRecords of groups.values()) {
    const sorted = [...groupRecords].sort((a, b) => {
      return getCheckedAtTimestamp(b.checkedAt) - getCheckedAtTimestamp(a.checkedAt);
    });
    mappedGroups.push({
      latest: sorted[0],
      older: sorted.slice(1),
      previousDayExperienceIncrease: getPreviousDayExperienceIncrease(sorted),
    });
  }

  return mappedGroups.sort((a, b) => {
    return getCheckedAtTimestamp(b.latest.checkedAt) - getCheckedAtTimestamp(a.latest.checkedAt);
  });
}
