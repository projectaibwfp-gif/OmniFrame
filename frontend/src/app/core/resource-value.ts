import { computed, type Resource, type Signal } from '@angular/core';
import { extractApiErrorMessage } from './http-error';

/**
 * `Resource.value()` rzuca wyjątek w stanie błędu, więc widoki czytają wartość
 * przez ten sygnał - zwraca `fallback` podczas ładowania, przy błędzie i bez danych.
 */
export function resourceValueOr<T, F>(
  resource: Resource<T>,
  fallback: F,
): Signal<NonNullable<T> | F> {
  return computed(() => (resource.hasValue() ? (resource.value() ?? fallback) : fallback));
}

export function resourceErrorMessage(resource: Resource<unknown>): Signal<string | null> {
  return computed(() => {
    const error = resource.error();
    return error ? extractApiErrorMessage(error) : null;
  });
}
