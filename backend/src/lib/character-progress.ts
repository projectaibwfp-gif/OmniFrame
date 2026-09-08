import type {
  CharacterProgressEntryDto,
  CharacterProgressStatus,
  CharacterProgressTargetKind,
} from '@shared/api-contract';
import { getSql } from './db';
import { toIsoUtc, type SqlTimestamp } from './date-time';

interface CharacterProgressRow {
  character_name: string;
  target_kind: CharacterProgressTargetKind;
  target_name: string;
  status: CharacterProgressStatus;
  updated_at: SqlTimestamp;
}

interface UpsertCharacterProgressInput {
  googleId: string;
  characterName: string;
  targetKind: CharacterProgressTargetKind;
  targetName: string;
  status: CharacterProgressStatus;
}

function normalizeValue(value: string): string {
  return value.trim().toLowerCase();
}

function mapRow(row: CharacterProgressRow): CharacterProgressEntryDto {
  return {
    characterName: row.character_name,
    targetKind: row.target_kind,
    targetName: row.target_name,
    status: row.status,
    updatedAt: toIsoUtc(row.updated_at),
  };
}

export async function listCharacterProgress(
  googleId: string,
): Promise<CharacterProgressEntryDto[]> {
  const sql = getSql();
  const rows = (await sql`
    SELECT character_name, target_kind, target_name, status, updated_at
    FROM character_progress_entries
    WHERE google_id = ${googleId}
    ORDER BY normalized_character_name ASC, target_kind ASC, normalized_target_name ASC
  `) as CharacterProgressRow[];

  return rows.map((row) => mapRow(row));
}

export async function upsertCharacterProgress(
  input: UpsertCharacterProgressInput,
): Promise<CharacterProgressEntryDto> {
  const sql = getSql();
  const rows = (await sql`
    INSERT INTO character_progress_entries (
      google_id,
      character_name,
      normalized_character_name,
      target_kind,
      target_name,
      normalized_target_name,
      status
    )
    VALUES (
      ${input.googleId},
      ${input.characterName.trim()},
      ${normalizeValue(input.characterName)},
      ${input.targetKind},
      ${input.targetName.trim()},
      ${normalizeValue(input.targetName)},
      ${input.status}
    )
    ON CONFLICT (google_id, normalized_character_name, target_kind, normalized_target_name)
    DO UPDATE SET
      character_name = EXCLUDED.character_name,
      target_name = EXCLUDED.target_name,
      status = EXCLUDED.status,
      updated_at = now()
    RETURNING character_name, target_kind, target_name, status, updated_at
  `) as CharacterProgressRow[];

  return mapRow(rows[0]);
}
