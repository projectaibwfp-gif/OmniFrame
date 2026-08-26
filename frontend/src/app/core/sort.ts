import { computed, signal, type Signal } from '@angular/core';

export type SortDirection = 'asc' | 'desc';

const ASCENDING_INDICATOR = '↑';
const DESCENDING_INDICATOR = '↓';
const NO_INDICATOR = '';

export interface SortState<TField extends string> {
  readonly field: Signal<TField>;
  readonly direction: Signal<SortDirection>;
  /** `1` for ascending, `-1` for descending - multiply a comparator result by it. */
  readonly multiplier: Signal<number>;
  indicator(field: TField): string;
  toggle(field: TField): void;
  reset(): void;
}

export function createSort<TField extends string>(
  initialField: TField,
  initialDirection: SortDirection = 'asc',
): SortState<TField> {
  const field = signal(initialField);
  const direction = signal(initialDirection);

  function indicator(candidate: TField): string {
    if (field() !== candidate) {
      return NO_INDICATOR;
    }

    return direction() === 'asc' ? ASCENDING_INDICATOR : DESCENDING_INDICATOR;
  }

  function toggle(candidate: TField): void {
    if (field() === candidate) {
      direction.update((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }

    field.set(candidate);
    direction.set(initialDirection);
  }

  function reset(): void {
    field.set(initialField);
    direction.set(initialDirection);
  }

  return {
    field: field.asReadonly(),
    direction: direction.asReadonly(),
    multiplier: computed(() => (direction() === 'asc' ? 1 : -1)),
    indicator,
    toggle,
    reset,
  };
}
