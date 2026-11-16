import { Injectable, inject } from '@angular/core';
import {
  exhaustMap,
  first,
  interval,
  map,
  switchMap,
  throwError,
  timeout,
  type Observable,
} from 'rxjs';
import type {
  CharacterHighscoresHistoryDto,
  CharacterLookupJobAcceptedDto,
  CharacterLookupJobDto,
  CharacterLookupJobStatus,
  CharacterLookupRequestDto,
  TibiaCharacterLookupDto,
} from '@shared/api-contract';
import { ApiClient } from '../core/api/api-client';
import { ApiError } from '../core/api/api-error';

export const CHARACTER_LOOKUP_POLL_INTERVAL_MS = 1_000;
// The backend worker gives up after 45 s, so this leaves room for queueing and one poll more.
export const CHARACTER_LOOKUP_MAX_WAIT_MS = 60_000;

export const CharacterLookupErrorCode = {
  NotFound: 'CHARACTER_NOT_FOUND',
  Failed: 'CHARACTER_LOOKUP_FAILED',
  TimedOut: 'CHARACTER_LOOKUP_TIMEOUT',
} as const;

const CHARACTER_LOOKUPS_PATH = '/character-lookups';
const DEFAULT_JOB_ERROR_MESSAGE = 'Character lookup failed';
const TIMEOUT_ERROR_MESSAGE = 'Character lookup did not finish in time';
const FINISHED_STATUSES = new Set<CharacterLookupJobStatus>(['completed', 'failed']);

@Injectable({ providedIn: 'root' })
export class TibiaCharacterService {
  private readonly apiClient = inject(ApiClient);

  /**
   * Queues a background lookup and polls it until it finishes. Unsubscribing
   * (for example when `rxResource` switches params or is destroyed) stops polling.
   */
  getCharacter(name: string): Observable<TibiaCharacterLookupDto> {
    const request: CharacterLookupRequestDto = { name: name.trim() };

    return this.apiClient
      .post<CharacterLookupJobAcceptedDto>(CHARACTER_LOOKUPS_PATH, request)
      .pipe(switchMap(({ jobId }) => this.waitForResult(jobId)));
  }

  getHighscoresHistory(name: string): Observable<CharacterHighscoresHistoryDto> {
    const normalizedName = name.trim();
    return this.apiClient.get(
      `/character/${encodeURIComponent(normalizedName)}/highscores-history`,
    );
  }

  private waitForResult(jobId: string): Observable<TibiaCharacterLookupDto> {
    return interval(CHARACTER_LOOKUP_POLL_INTERVAL_MS).pipe(
      exhaustMap(() => this.getJob(jobId)),
      first((job) => FINISHED_STATUSES.has(job.status)),
      map(readJobResult),
      timeout({
        first: CHARACTER_LOOKUP_MAX_WAIT_MS,
        with: () =>
          throwError(() => new ApiError(CharacterLookupErrorCode.TimedOut, TIMEOUT_ERROR_MESSAGE)),
      }),
    );
  }

  private getJob(jobId: string): Observable<CharacterLookupJobDto> {
    return this.apiClient.get(`${CHARACTER_LOOKUPS_PATH}/${encodeURIComponent(jobId)}`);
  }
}

export function isCharacterNotFoundError(error: unknown): boolean {
  return error instanceof ApiError && error.code === CharacterLookupErrorCode.NotFound;
}

function readJobResult(job: CharacterLookupJobDto): TibiaCharacterLookupDto {
  if (job.status === 'completed' && job.result) {
    return job.result;
  }

  throw toJobError(job);
}

function toJobError(job: CharacterLookupJobDto): ApiError {
  const code =
    job.errorCode === CharacterLookupErrorCode.NotFound
      ? CharacterLookupErrorCode.NotFound
      : CharacterLookupErrorCode.Failed;
  return new ApiError(code, job.error ?? DEFAULT_JOB_ERROR_MESSAGE);
}
