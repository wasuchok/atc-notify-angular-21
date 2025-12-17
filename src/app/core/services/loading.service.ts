import { Injectable, computed, signal } from '@angular/core';

/**
 * Global loading indicator controller with reference counting.
 */
@Injectable({ providedIn: 'root' })
export class LoadingService {
  private counter = signal(0);
  readonly loading = computed(() => this.counter() > 0);

  show() {
    this.counter.update(c => c + 1);
  }

  hide() {
    this.counter.update(c => (c > 0 ? c - 1 : 0));
  }

  reset() {
    this.counter.set(0);
  }
}
