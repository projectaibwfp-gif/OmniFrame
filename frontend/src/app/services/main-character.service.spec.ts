import '@angular/compiler';
import { HttpStatusCode, provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
  type TestRequest,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import type { AuthCurrentUserDto } from '@shared/api-contract';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { AuthService } from '../auth/auth.service';
import { ApiError } from '../core/api/api-error';
import { MainCharacterService } from './main-character.service';

const MAIN_CHARACTER_PATH = '/auth/me/main-character';
const REFRESH_PATH = `${MAIN_CHARACTER_PATH}/refresh`;
const CHARACTER_NAME = 'Bubble';

function buildUser(characterName: string | null, level = 100): AuthCurrentUserDto {
  return {
    id: 1,
    googleId: 'google-id',
    emailVerified: true,
    locale: null,
    givenName: 'Test',
    familyName: 'User',
    name: 'Test User',
    email: 'test@example.com',
    picture: null,
    role: 'user',
    referralCode: 'REF',
    referredByCode: null,
    mainCharacter: characterName
      ? {
          name: characterName,
          world: 'Antica',
          vocation: 'Elite Knight',
          level,
          linkedAt: '2026-01-01T00:00:00.000Z',
        }
      : null,
  };
}

function flushPromises(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve));
}

describe('MainCharacterService', () => {
  let authService: AuthService;
  let httpTesting: HttpTestingController;
  let mainCharacterService: MainCharacterService;

  beforeAll(() => {
    TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    authService = TestBed.inject(AuthService);
    httpTesting = TestBed.inject(HttpTestingController);
    mainCharacterService = TestBed.inject(MainCharacterService);
  });

  afterEach(() => {
    httpTesting.verify();
    TestBed.resetTestingModule();
  });

  const expectRefresh = (): TestRequest =>
    httpTesting.expectOne((request) => request.url.endsWith(REFRESH_PATH));
  const expectNoRefresh = (): void =>
    httpTesting.expectNone((request) => request.url.endsWith(REFRESH_PATH));

  it('refreshes the linked character only once although the refresh rewrites the user', async () => {
    authService.setUserFromApi(buildUser(CHARACTER_NAME));
    TestBed.tick();

    expectRefresh().flush({ data: { user: buildUser(CHARACTER_NAME, 101) } });
    await flushPromises();
    TestBed.tick();

    expectNoRefresh();
    expect(authService.user()?.mainCharacter?.level).toBe(101);
  });

  it('does not refresh when no character is linked', () => {
    authService.setUserFromApi(buildUser(null));
    TestBed.tick();

    expectNoRefresh();
  });

  it('refreshes again when a different character becomes the main one', async () => {
    authService.setUserFromApi(buildUser(CHARACTER_NAME));
    TestBed.tick();
    expectRefresh().flush({ data: { user: buildUser(CHARACTER_NAME) } });
    await flushPromises();

    authService.setUserFromApi(buildUser('Other Knight'));
    TestBed.tick();

    expectRefresh().flush({ data: { user: buildUser('Other Knight') } });
    await flushPromises();
  });

  it('links the character and stores the unwrapped user', async () => {
    const linking = mainCharacterService.link(` ${CHARACTER_NAME} `);

    const request = httpTesting.expectOne((req) => req.url.endsWith(MAIN_CHARACTER_PATH));
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({ name: CHARACTER_NAME });
    request.flush({ data: { user: buildUser(CHARACTER_NAME) } });
    await linking;
    TestBed.tick();

    expectNoRefresh();
    expect(authService.user()?.mainCharacter?.name).toBe(CHARACTER_NAME);
  });

  it('rejects a failed link with the backend ApiError', async () => {
    const linking = mainCharacterService.link(CHARACTER_NAME);

    httpTesting
      .expectOne((req) => req.url.endsWith(MAIN_CHARACTER_PATH))
      .flush(
        { error: { code: 'CHARACTER_NOT_FOUND', message: 'Character not found' } },
        { status: HttpStatusCode.NotFound, statusText: 'Not Found' },
      );

    await expect(linking).rejects.toBeInstanceOf(ApiError);
    await expect(linking).rejects.toMatchObject({
      code: 'CHARACTER_NOT_FOUND',
      status: HttpStatusCode.NotFound,
    });
  });
});
