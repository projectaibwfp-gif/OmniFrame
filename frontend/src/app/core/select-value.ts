const EMPTY_OPTION_VALUE = '';

/** Wartość wybranej opcji `<select>`; pusta opcja ("wszystkie"/"wybierz") daje `null`. */
export function readSelectValue(event: Event): string | null {
  const target = event.target;
  if (!(target instanceof HTMLSelectElement) || target.value === EMPTY_OPTION_VALUE) {
    return null;
  }

  return target.value;
}
