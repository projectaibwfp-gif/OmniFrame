import { Injectable, signal, type Signal, type WritableSignal } from '@angular/core';

export interface HttpErrorEvent {
  message: string;
  status: number;
  url: string | null;
  at: number;
}

@Injectable({ providedIn: 'root' })
export class HttpErrorService {
  readonly lastError: Signal<HttpErrorEvent | null>;

  private readonly lastErrorSignal: WritableSignal<HttpErrorEvent | null>;

  constructor() {
    this.lastErrorSignal = signal<HttpErrorEvent | null>(null);
    this.lastError = this.lastErrorSignal.asReadonly();
  }

  publish(event: HttpErrorEvent): void {
    this.lastErrorSignal.set(event);
  }

  clear(): void {
    this.lastErrorSignal.set(null);
  }
}
