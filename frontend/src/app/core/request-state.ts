import { computed, signal, type Signal } from '@angular/core';
import { finalize, type Observable } from 'rxjs';
import { DEFAULT_HTTP_ERROR_MESSAGE, extractApiErrorMessage } from './http-error';

export type RequestStatus = 'idle' | 'loading' | 'success' | 'error';

export interface RequestState<T> {
  status: Signal<RequestStatus>;
  data: Signal<T | null>;
  errorMessage: Signal<string | null>;
  isLoading: Signal<boolean>;
  isError: Signal<boolean>;
  isSuccess: Signal<boolean>;
  isEmpty: Signal<boolean>;
  run: (source$: Observable<T>) => void;
  set: (data: T) => void;
  reset: () => void;
}

export interface CreateRequestStateOptions<T> {
  initialStatus?: RequestStatus;
  isEmpty?: (data: T) => boolean;
}

export function createRequestState<T>(options: CreateRequestStateOptions<T> = {}): RequestState<T> {
  const status = signal<RequestStatus>(options.initialStatus ?? 'loading');
  const data = signal<T | null>(null);
  const errorMessage = signal<string | null>(null);

  const isEmptyPredicate = options.isEmpty ?? defaultIsEmpty;

  return {
    status: status.asReadonly(),
    data: data.asReadonly(),
    errorMessage: errorMessage.asReadonly(),
    isLoading: computed(() => status() === 'loading'),
    isError: computed(() => status() === 'error'),
    isSuccess: computed(() => status() === 'success'),
    isEmpty: computed(() => {
      const current = data();
      return status() === 'success' && current !== null && isEmptyPredicate(current);
    }),
    run: (source$: Observable<T>): void => {
      status.set('loading');
      errorMessage.set(null);
      source$
        .pipe(
          finalize(() => {
            if (status() === 'loading') {
              status.set('error');
              errorMessage.set(DEFAULT_HTTP_ERROR_MESSAGE);
            }
          }),
        )
        .subscribe({
          next: (value) => {
            data.set(value);
            status.set('success');
          },
          error: (error: unknown) => {
            errorMessage.set(extractApiErrorMessage(error));
            status.set('error');
          },
        });
    },
    set: (value: T): void => {
      data.set(value);
      errorMessage.set(null);
      status.set('success');
    },
    reset: (): void => {
      data.set(null);
      errorMessage.set(null);
      status.set('idle');
    },
  };
}

function defaultIsEmpty<T>(value: T): boolean {
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  return false;
}
