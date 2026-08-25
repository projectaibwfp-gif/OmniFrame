import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import type { HighscoresSnapshotsListDto } from '@shared/api-contract';
import { buildApiUrl } from '../config/api.config';

interface HighscoresSnapshotsQuery {
  page: number;
  pageSize: number;
  world: string | null;
  sortDir: 'asc' | 'desc';
}

@Injectable({ providedIn: 'root' })
export class HighscoresSnapshotsService {
  private readonly http = inject(HttpClient);

  getSnapshots(query: HighscoresSnapshotsQuery): Observable<HighscoresSnapshotsListDto> {
    let params = new HttpParams()
      .set('page', String(query.page))
      .set('pageSize', String(query.pageSize))
      .set('sortDir', query.sortDir);

    if (query.world) {
      params = params.set('world', query.world);
    }

    return this.http.get<HighscoresSnapshotsListDto>(buildApiUrl('/highscores-snapshots'), {
      params,
    });
  }
}
