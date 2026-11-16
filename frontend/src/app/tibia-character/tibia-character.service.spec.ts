import '@angular/compiler';
import { HttpStatusCode, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import type {
  CharacterLookupJobDto,
  CharacterLookupJobStatus,
  TibiaCharacterLookupDto,
} from '@shared/api-contract';
import type { Subscription } from 'rxjs';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildApiUrl } from '../config/api.config';
import { ApiError } from '../core/api/api-error';
import {
  CHARACTER_LOOKUP_MAX_WAIT_MS,
  CHARACTER_LOOKUP_POLL_INTERVAL_MS,
  CharacterLookupErrorCode,
  isCharacterNotFoundError,
  TibiaCharacterService,
} from './tibia-character.service';

const JOB_ID = '6f1c2a4e-9b3d-4c8a-a1f2-3e4d5c6b7a80';
const LOOKUPS_URL = buildApiUrl('/character-lookups');
const JOB_URL = `${LOOKUPS_URL}/${JOB_ID}`;
const LOOKUP_RESULT = {
  character: { name: 'Trollefar' },
  history: [],
} as unknown as TibiaCharacterLookupDto;

function buildJob(
  status: CharacterLookupJobStatus,
  extra: Partial<CharacterLookupJobDto> = {},
): CharacterLookupJobDto {
  return {
    jobId: JOB_ID,
    status,
    createdAt: '2026-11-16T12:00:00.000Z',
    startedAt: null,
    finishedAt: null,
    ...extra,
  };
}

let service: TibiaCharacterService;
let httpTesting: HttpTestingController;
let subscription: Subscription | undefined;
let result: TibiaCharacterLookupDto | undefined;
let failure: unknown;

beforeAll(() => {
  TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
});

beforeEach(() => {
  vi.useFakeTimers();
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting()],
  });
  service = TestBed.inject(TibiaCharacterService);
  httpTesting = TestBed.inject(HttpTestingController);
  result = undefined;
  failure = undefined;
});

afterEach(() => {
  subscription?.unsubscribe();
  httpTesting.verify();
  TestBed.resetTestingModule();
  vi.useRealTimers();
});

function startLookup(name = ' Trollefar '): void {
  subscription = service.getCharacter(name).subscribe({
    next: (value) => (result = value),
    error: (error: unknown) => (failure = error),
  });
}

function acceptJob(): void {
  const submit = httpTesting.expectOne(LOOKUPS_URL);
  expect(submit.request.method).toBe('POST');
  expect(submit.request.body).toEqual({ name: 'Trollefar' });
  submit.flush(
    { data: { jobId: JOB_ID, status: 'pending' } },
    { status: HttpStatusCode.Accepted, statusText: 'Accepted' },
  );
}

function pollOnce(job: CharacterLookupJobDto): void {
  vi.advanceTimersByTime(CHARACTER_LOOKUP_POLL_INTERVAL_MS);
  httpTesting.expectOne(JOB_URL).flush({ data: job });
}

describe('TibiaCharacterService.getCharacter polling', () => {
  it('submits the job and polls until it completes with the lookup result', () => {
    startLookup();
    acceptJob();

    pollOnce(buildJob('pending'));
    pollOnce(buildJob('processing'));
    expect(result).toBeUndefined();

    pollOnce(buildJob('completed', { result: LOOKUP_RESULT }));

    expect(result).toEqual(LOOKUP_RESULT);
    vi.advanceTimersByTime(CHARACTER_LOOKUP_POLL_INTERVAL_MS);
    httpTesting.expectNone(JOB_URL);
  });

  it('stops polling when the subscriber goes away', () => {
    startLookup();
    acceptJob();
    pollOnce(buildJob('pending'));

    subscription?.unsubscribe();
    vi.advanceTimersByTime(CHARACTER_LOOKUP_POLL_INTERVAL_MS * 3);

    httpTesting.expectNone(JOB_URL);
  });
});

describe('TibiaCharacterService.getCharacter errors', () => {
  it.each([
    ['CHARACTER_NOT_FOUND', 'Character not found', CharacterLookupErrorCode.NotFound, true],
    [
      'CHARACTER_LOOKUP_TIMEOUT',
      'Character lookup timed out',
      CharacterLookupErrorCode.Failed,
      false,
    ],
  ] as const)('rejects a job failed with %s as %s', (errorCode, reason, code, isNotFound) => {
    startLookup();
    acceptJob();

    pollOnce(buildJob('failed', { errorCode, error: reason }));

    expect(failure).toBeInstanceOf(ApiError);
    expect(failure).toMatchObject({ code, message: reason, status: null });
    expect(isCharacterNotFoundError(failure)).toBe(isNotFound);
    vi.advanceTimersByTime(CHARACTER_LOOKUP_POLL_INTERVAL_MS);
    httpTesting.expectNone(JOB_URL);
  });

  it('gives up with a timeout ApiError after the max wait', () => {
    startLookup();
    acceptJob();
    pollOnce(buildJob('processing'));
    vi.advanceTimersByTime(CHARACTER_LOOKUP_POLL_INTERVAL_MS);
    const hangingPoll = httpTesting.expectOne(JOB_URL);

    vi.advanceTimersByTime(CHARACTER_LOOKUP_MAX_WAIT_MS);

    expect(hangingPoll.cancelled).toBe(true);

    expect(failure).toBeInstanceOf(ApiError);
    expect(failure).toMatchObject({ code: CharacterLookupErrorCode.TimedOut });
    expect(result).toBeUndefined();
  });

  it('maps a full queue into ApiError without polling', () => {
    startLookup();

    httpTesting
      .expectOne(LOOKUPS_URL)
      .flush(
        { error: { code: 'CHARACTER_LOOKUP_QUEUE_FULL', message: 'Too many lookups' } },
        { status: HttpStatusCode.TooManyRequests, statusText: 'Too Many Requests' },
      );

    expect(failure).toMatchObject({
      code: 'CHARACTER_LOOKUP_QUEUE_FULL',
      status: HttpStatusCode.TooManyRequests,
    });
    expect(isCharacterNotFoundError(failure)).toBe(false);
    vi.advanceTimersByTime(CHARACTER_LOOKUP_POLL_INTERVAL_MS);
    httpTesting.expectNone(JOB_URL);
  });
});
