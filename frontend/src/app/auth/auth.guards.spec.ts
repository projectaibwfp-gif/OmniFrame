import '@angular/compiler';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import {
  provideRouter,
  Router,
  UrlTree,
  type ActivatedRouteSnapshot,
  type RouterStateSnapshot,
} from '@angular/router';
import type { UserRole } from '@shared/api-contract';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { adminGuard } from './auth.guards';
import type { AuthUser } from './auth-session';
import { AuthService } from './auth.service';

function buildUser(role: UserRole): AuthUser {
  return {
    givenName: 'Test',
    familyName: 'User',
    fullName: 'Test User',
    email: 'test@example.com',
    picture: null,
    role,
    referralCode: 'REF',
    referredByCode: null,
    registeredAt: '2026-01-01T00:00:00.000Z',
    lastLoginAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    mainCharacter: null,
  };
}

function runAdminGuard(): ReturnType<typeof adminGuard> {
  return TestBed.runInInjectionContext(() =>
    adminGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
  );
}

describe('adminGuard', () => {
  let authService: AuthService;

  beforeAll(() => {
    TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    authService = TestBed.inject(AuthService);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('lets an admin through', () => {
    authService.user.set(buildUser('admin'));

    expect(runAdminGuard()).toBe(true);
  });

  it('redirects a regular user to the news page', () => {
    authService.user.set(buildUser('user'));

    const result = runAdminGuard();

    expect(result).toBeInstanceOf(UrlTree);
    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe('/news');
  });
});
