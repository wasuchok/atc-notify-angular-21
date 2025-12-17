import { Injectable, signal } from '@angular/core';

export type SwalType = 'success' | 'error' | 'warning' | 'info' | 'question';

export interface SwalOptions {
  title: string;
  text?: string;
  type?: SwalType;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

@Injectable({ providedIn: 'root' })
export class SwalService {
  current = signal<(SwalOptions & { id: string; resolve: (v: boolean) => void }) | null>(null);

  fire(options: SwalOptions): Promise<boolean> {
    return new Promise(resolve => {
      this.current.set({
        id: this.generateId(),
        resolve,
        confirmText: 'ตกลง',
        cancelText: 'ยกเลิก',
        type: options.type ?? 'info',
        showCancel: options.showCancel ?? false,
        ...options
      });
    });
  }

  success(title: string, text?: string) {
    return this.fire({ title, text, type: 'success' });
  }

  error(title: string, text?: string) {
    return this.fire({ title, text, type: 'error' });
  }

  warning(title: string, text?: string) {
    return this.fire({ title, text, type: 'warning' });
  }

  info(title: string, text?: string) {
    return this.fire({ title, text, type: 'info' });
  }

  question(title: string, text?: string) {
    return this.fire({ title, text, type: 'question', showCancel: true });
  }

  resolve(value: boolean) {
    const current = this.current();
    if (current) {
      current.resolve(value);
      this.current.set(null);
    }
  }

  private generateId() {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
    return `sw-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}
