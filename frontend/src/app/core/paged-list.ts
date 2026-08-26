import { computed, signal, type Signal } from '@angular/core';

export const PAGE_SIZE_OPTIONS: readonly number[] = [6, 12, 24];
export const DEFAULT_PAGE_SIZE = 12;

export interface PagedList<T> {
  readonly page: Signal<number>;
  readonly pageSize: Signal<number>;
  readonly pageSizeOptions: readonly number[];
  readonly total: Signal<number>;
  readonly totalPages: Signal<number>;
  readonly items: Signal<T[]>;
  readonly startIndex: Signal<number>;
  readonly endIndex: Signal<number>;
  setPage(page: number): void;
  setPageSize(size: number): void;
  resetPage(): void;
}

/**
 * Wraps a source signal with page/pageSize state and the derived slice. Callers keep
 * ownership of filtering and sorting, and pass the already ordered collection in.
 */
export function createPagedList<T>(
  source: Signal<readonly T[]>,
  initialPageSize: number = DEFAULT_PAGE_SIZE,
): PagedList<T> {
  const page = signal(1);
  const pageSize = signal(initialPageSize);
  const total = computed(() => source().length);

  return {
    page: page.asReadonly(),
    pageSize: pageSize.asReadonly(),
    pageSizeOptions: PAGE_SIZE_OPTIONS,
    total,
    totalPages: computed(() => Math.max(1, Math.ceil(total() / pageSize()))),
    items: computed(() => {
      const start = (page() - 1) * pageSize();
      return source().slice(start, start + pageSize());
    }),
    startIndex: computed(() => (total() === 0 ? 0 : (page() - 1) * pageSize() + 1)),
    endIndex: computed(() => Math.min(page() * pageSize(), total())),
    setPage: (value: number): void => page.set(value),
    setPageSize: (size: number): void => {
      pageSize.set(size);
      page.set(1);
    },
    resetPage: (): void => page.set(1),
  };
}
