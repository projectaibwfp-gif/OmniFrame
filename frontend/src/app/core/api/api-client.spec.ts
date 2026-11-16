import '@angular/compiler';
import { HttpContext, HttpParams, HttpStatusCode, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { firstValueFrom, type Observable } from 'rxjs';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { SKIP_AUTH_INTERCEPTOR } from '../../auth/auth-http-context';
import { buildApiUrl } from '../../config/api.config';
import {
  DEFAULT_HTTP_ERROR_MESSAGE,
  extractApiErrorMessage,
  isHttpErrorStatus,
  NETWORK_ERROR_MESSAGE,
} from '../http-error';
import { ApiClient } from './api-client';
import {
  ApiError,
  isApiErrorResponseDto,
  NETWORK_API_ERROR_CODE,
  UNKNOWN_API_ERROR_CODE,
} from './api-error';

const WORLDS_PATH = '/worlds';
const WORLDS = ['Antica', 'Secura'];
const NOT_FOUND_BODY = { error: { code: 'NOT_FOUND', message: 'World not found' } };
const COMPONENT_FALLBACK = 'Component fallback';

describe('isApiErrorResponseDto', () => {
  it.each([
    [NOT_FOUND_BODY, true],
    [{ error: { message: 'missing code' } }, false],
    [{ error: 'flat string' }, false],
    [{ message: 'not wrapped' }, false],
    ['plain text', false],
    [null, false],
  ])('recognises %j as %s', (value, expected) => {
    expect(isApiErrorResponseDto(value)).toBe(expected);
  });
});

let apiClient: ApiClient;
let httpTesting: HttpTestingController;

beforeAll(() => {
  TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
});

beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting()],
  });
  apiClient = TestBed.inject(ApiClient);
  httpTesting = TestBed.inject(HttpTestingController);
});

afterEach(() => {
  httpTesting.verify();
  TestBed.resetTestingModule();
});

async function captureError(request: Observable<unknown>): Promise<unknown> {
  try {
    await firstValueFrom(request);
  } catch (error) {
    return error;
  }
  throw new Error('Expected the request to fail');
}

describe('ApiClient requests', () => {
  it.each([
    ['GET', (): Observable<unknown> => apiClient.get(WORLDS_PATH), null],
    ['POST', (): Observable<unknown> => apiClient.post(WORLDS_PATH, { a: 1 }), { a: 1 }],
    ['PUT', (): Observable<unknown> => apiClient.put(WORLDS_PATH, { b: 2 }), { b: 2 }],
    ['PATCH', (): Observable<unknown> => apiClient.patch(WORLDS_PATH, { c: 3 }), { c: 3 }],
    ['DELETE', (): Observable<unknown> => apiClient.delete(WORLDS_PATH), null],
  ])('sends %s to the API base URL with the body', async (method, send, body) => {
    const result = firstValueFrom(send());

    const request = httpTesting.expectOne(buildApiUrl(WORLDS_PATH));
    expect(request.request.method).toBe(method);
    expect(request.request.body).toEqual(body);
    request.flush({ data: WORLDS });

    expect(await result).toEqual(WORLDS);
  });

  it('builds the URL from a path without a leading slash', async () => {
    const result = firstValueFrom(apiClient.get<string[]>('worlds'));

    httpTesting.expectOne(buildApiUrl(WORLDS_PATH)).flush({ data: WORLDS });

    expect(await result).toEqual(WORLDS);
  });

  it('forwards params and context', async () => {
    const params = new HttpParams().set('page', '2');
    const context = new HttpContext().set(SKIP_AUTH_INTERCEPTOR, true);
    const result = firstValueFrom(apiClient.get(WORLDS_PATH, { params, context }));

    const request = httpTesting.expectOne((req) => req.url === buildApiUrl(WORLDS_PATH));
    expect(request.request.params.get('page')).toBe('2');
    expect(request.request.context.get(SKIP_AUTH_INTERCEPTOR)).toBe(true);
    request.flush({ data: WORLDS });

    await result;
  });

  it('returns the whole body when the endpoint has no data envelope', async () => {
    const body = { data: WORLDS, total: 2 };
    const result = firstValueFrom(apiClient.get(WORLDS_PATH, { unwrapData: false }));

    httpTesting.expectOne(buildApiUrl(WORLDS_PATH)).flush(body);

    expect(await result).toEqual(body);
  });
});

describe('ApiClient errors', () => {
  it('maps an ApiErrorResponseDto body into ApiError', async () => {
    const error = captureError(apiClient.get(WORLDS_PATH));

    httpTesting
      .expectOne(buildApiUrl(WORLDS_PATH))
      .flush(NOT_FOUND_BODY, { status: HttpStatusCode.NotFound, statusText: 'Not Found' });

    const apiError = await error;
    expect(apiError).toBeInstanceOf(ApiError);
    expect(apiError).toMatchObject({
      code: 'NOT_FOUND',
      message: 'World not found',
      status: HttpStatusCode.NotFound,
    });
    expect(isHttpErrorStatus(apiError, HttpStatusCode.NotFound)).toBe(true);
    expect(extractApiErrorMessage(apiError, COMPONENT_FALLBACK)).toBe('World not found');
  });

  it.each([
    ['an HTML page', '<html>Bad gateway</html>', '<html>Bad gateway</html>'],
    ['a flat message', { message: 'Upstream down' }, 'Upstream down'],
    ['an unknown object', { unexpected: true }, DEFAULT_HTTP_ERROR_MESSAGE],
    ['an empty body', null, DEFAULT_HTTP_ERROR_MESSAGE],
  ])('falls back safely when the body is %s', async (_label, body, expectedMessage) => {
    const error = captureError(apiClient.get(WORLDS_PATH));

    httpTesting.expectOne(buildApiUrl(WORLDS_PATH)).flush(body, {
      status: HttpStatusCode.BadGateway,
      statusText: 'Bad Gateway',
    });

    expect(await error).toMatchObject({
      code: UNKNOWN_API_ERROR_CODE,
      message: expectedMessage,
      status: HttpStatusCode.BadGateway,
    });
  });

  it('keeps the caller fallback for UI messages when the body is malformed', async () => {
    const error = captureError(apiClient.get(WORLDS_PATH));

    httpTesting.expectOne(buildApiUrl(WORLDS_PATH)).flush(null, {
      status: HttpStatusCode.InternalServerError,
      statusText: 'Server Error',
    });

    expect(extractApiErrorMessage(await error, COMPONENT_FALLBACK)).toBe(COMPONENT_FALLBACK);
  });

  it('maps a network failure into a network ApiError', async () => {
    const error = captureError(apiClient.get(WORLDS_PATH));

    httpTesting.expectOne(buildApiUrl(WORLDS_PATH)).error(new ProgressEvent('error'));

    expect(await error).toMatchObject({
      code: NETWORK_API_ERROR_CODE,
      message: NETWORK_ERROR_MESSAGE,
      status: 0,
    });
  });
});
