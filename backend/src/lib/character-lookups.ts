import type { TibiaCharacterDto, TibiaCharacterHistoryEntryDto } from '@shared/api-contract';
import { getSql } from './db';

interface CharacterLookupRow {
  id: number;
  checkedAt: string;
  name: string;
  world: string | null;
  vocation: string | null;
  level: number | null;
  exactExperience: number | null;
  experienceStatus: TibiaCharacterHistoryEntryDto['experienceStatus'];
  experienceRank: number | null;
}

function normalizeCharacterName(name: string): string {
  return name.trim().toLowerCase();
}

function mapCharacterLookupRow(row: CharacterLookupRow): TibiaCharacterHistoryEntryDto {
  return {
    id: row.id,
    checkedAt: row.checkedAt,
    name: row.name,
    world: row.world,
    vocation: row.vocation,
    level: row.level,
    exactExperience: row.exactExperience,
    experienceStatus: row.experienceStatus,
    experienceRank: row.experienceRank,
  };
}

export async function saveCharacterLookup(
  character: TibiaCharacterDto,
  requestedName: string,
  requestedBySub: string | null,
): Promise<void> {
  const sql = getSql();
  await sql`
    INSERT INTO character_lookups (
      requested_name,
      normalized_name,
      world,
      vocation,
      level,
      experience_status,
      exact_experience,
      experience_rank,
      requested_by_sub
    ) VALUES (
      ${character.name},
      ${normalizeCharacterName(requestedName)},
      ${character.world},
      ${character.vocation},
      ${character.level},
      ${character.experience?.status ?? null},
      ${character.experience?.exactExperience ?? null},
      ${character.experience?.rank ?? null},
      ${requestedBySub}
    )
  `;
}

export async function listCharacterLookupHistory(
  characterName: string,
  limit = 20,
): Promise<TibiaCharacterHistoryEntryDto[]> {
  const sql = getSql();
  const rows = (await sql`
    SELECT id,
           to_char(checked_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS "checkedAt",
           requested_name AS "name",
           world,
           vocation,
           level,
           exact_experience AS "exactExperience",
           experience_status AS "experienceStatus",
           experience_rank AS "experienceRank"
    FROM character_lookups
    WHERE normalized_name = ${normalizeCharacterName(characterName)}
    ORDER BY checked_at DESC
    LIMIT ${limit}
  `) as CharacterLookupRow[];

  return rows.map(mapCharacterLookupRow);
}
