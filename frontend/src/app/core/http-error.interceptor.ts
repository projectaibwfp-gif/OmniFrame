import { HttpErrorResponse, type HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { extractApiErrorMessage } from './http-error';
import { HttpErrorService } from './http-error.service';

const SKIP_STATUSES = new Set<number>([401]);

export const httpErrorInterceptor: HttpInterceptorFn = (request, next) => {
  const errorService = inject(HttpErrorService);

  return next(request).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && !SKIP_STATUSES.has(error.status)) {
        errorService.publish({
          message: extractApiErrorMessage(error),
          status: error.status,
          url: error.url,
          at: Date.now(),
        });
      }
      return throwError(() => error);
    }),
  );
};
