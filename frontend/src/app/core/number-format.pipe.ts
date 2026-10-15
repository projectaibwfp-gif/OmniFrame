import { Pipe, type PipeTransform } from '@angular/core';
import { formatNumber } from './number-format';

/** Liczba z separatorem tysięcy, format z `NUMBER_FORMAT_LOCALE`. */
@Pipe({ name: 'appNumber' })
export class AppNumberPipe implements PipeTransform {
  transform(value: number): string {
    return formatNumber(value);
  }
}
