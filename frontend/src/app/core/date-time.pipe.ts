import { Pipe, type PipeTransform } from '@angular/core';
import { formatDateOnly, formatDateTime } from './date-time';

/** Data + godzina w czasie lokalnym, format z `DATE_TIME_FORMAT`. */
@Pipe({ name: 'appDateTime' })
export class AppDateTimePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    return formatDateTime(value);
  }
}

/** Sama data, format z `DATE_FORMAT`. */
@Pipe({ name: 'appDate' })
export class AppDatePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    return formatDateOnly(value);
  }
}
