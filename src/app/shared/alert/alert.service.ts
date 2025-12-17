import { Injectable, signal } from '@angular/core';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error' | 'confirm';

export interface AlertConfig {
  id: string;
  title: string;
  message?: string;
  variant: AlertVariant;
  autoClose?: number;
  resolve?: (value: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class AlertService {
  alerts = signal<AlertConfig[]>([]);

  info(title: string, message?: string, autoClose = 2500) {
    this.push({ title, message, variant: 'info', autoClose });
  }

  success(title: string, message?: string, autoClose = 2500) {
    this.push({ title, message, variant: 'success', autoClose });
  }

  warning(title: string, message?: string, autoClose = 3000) {
    this.push({ title, message, variant: 'warning', autoClose });
  }

  error(title: string, message?: string, autoClose = 0) {
    this.push({ title, message, variant: 'error', autoClose });
  }

  confirm(title: string, message?: string): Promise<boolean> {
    return new Promise(resolve => {
      this.push({ title, message, variant: 'confirm', resolve });
    });
  }

  close(id: string, accepted = false) {
    this.alerts.update(items => {
      const alert = items.find(a => a.id === id);
      if (alert?.resolve) {
        alert.resolve(accepted);
      }
      return items.filter(a => a.id !== id);
    });
  }

  private push(alert: Omit<AlertConfig, 'id'>) {
    const config: AlertConfig = { id: this.generateId(), ...alert };
    this.alerts.update(items => [...items, config]);
    if (config.autoClose && config.autoClose > 0) {
      setTimeout(() => this.close(config.id), config.autoClose);
    }
  }

  private generateId() {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
    return `al-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}
