import { HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import type { HighscoresSnapshotsListDto } from '@shared/api-contract';
import { ApiClient } from '../core/api/api-client';

const HIGHSCORES_SNAPSHOTS_PATH = '/highscores-snapshots';

interface HighscoresSnapshotsQuery {
  page: number;
  pageSize: number;
  world: string | null;
  sortDir: 'asc' | 'desc';
}

@Injectable({ providedIn: 'root' })
export class HighscoresSnapshotsService {
  private readonly apiClient = inject(ApiClient);

  getSnapshots(query: HighscoresSnapshotsQuery): Observable<HighscoresSnapshotsListDto> {
    let params = new HttpParams()
      .set('page', String(query.page))
      .set('pageSize', String(query.pageSize))
      .set('sortDir', query.sortDir);

    if (query.world) {
      params = params.set('world', query.world);
    }

    return this.apiClient.get(HIGHSCORES_SNAPSHOTS_PATH, { params, unwrapData: false });
  }
}
