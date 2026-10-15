import type { HttpClient } from '@angular/common/http';
import { firstValueFrom, of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { buildApiUrl } from './api.config';
import { getApiData, unwrapApiData } from './api-data';

describe('unwrapApiData', () => {
  it('returns the data envelope payload', () => {
    expect(unwrapApiData({ data: { name: 'Antica' } })).toEqual({ name: 'Antica' });
  });
});

describe('getApiData', () => {
  it('requests the API path and emits the unwrapped data', async () => {
    const get = vi.fn(() => of({ data: ['Antica', 'Secura'] }));
    const http = { get } as unknown as HttpClient;

    const result = await firstValueFrom(getApiData<string[]>(http, '/worlds'));

    expect(get).toHaveBeenCalledWith(buildApiUrl('/worlds'), {});
    expect(result).toEqual(['Antica', 'Secura']);
  });
});
