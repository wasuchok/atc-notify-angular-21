import { CommonModule } from '@angular/common';
import { Component, effect, signal } from '@angular/core';
import { AlertService, AlertConfig } from './alert.service';

@Component({
  selector: 'app-alert-center',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full max-w-sm space-y-3"
         style="position: fixed; top: 16px; right: 16px; z-index: 2147483647; pointer-events: none;">
      @for (alert of visibleAlerts(); track alert.id) {
        <div
          class="rounded-2xl shadow-lg border p-4 transition-all animate-in fade-in slide-in-from-top-4 duration-200 bg-white"
          style="pointer-events: auto; box-shadow: 0 10px 30px rgba(0,0,0,0.12); border: 1px solid #e2e8f0;"
          [ngClass]="getContainerClass(alert.variant)">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0" [ngClass]="getBadgeClass(alert.variant)">
              {{ getIcon(alert.variant) }}
            </div>
            <div class="flex-1">
              <p class="text-sm font-semibold text-slate-800">{{ alert.title }}</p>
              @if (alert.message) {
                <p class="text-xs text-slate-600 mt-1 leading-relaxed">{{ alert.message }}</p>
              }
              @if (alert.variant === 'confirm') {
                <div class="flex gap-2 mt-3">
                  <button (click)="onConfirm(alert, true)" class="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700">ยืนยัน</button>
                  <button (click)="onConfirm(alert, false)" class="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200">ยกเลิก</button>
                </div>
              }
            </div>
            <button class="text-slate-400 hover:text-slate-600" (click)="close(alert)">✕</button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .animate-in {
      opacity: 0;
      transform: translateY(-6px);
    }
    .fade-in {
      animation: fadeIn 0.2s forwards;
    }
    .slide-in-from-top-4 {
      animation: slideDown 0.2s forwards;
    }
    @keyframes fadeIn { to { opacity: 1; } }
    @keyframes slideDown { to { transform: translateY(0); } }
  `]
})
export class AlertCenterComponent {
  visibleAlerts = signal<AlertConfig[]>([]);

  constructor(private readonly alerts: AlertService) {
    effect(() => this.visibleAlerts.set(this.alerts.alerts()));
  }

  close(alert: AlertConfig) {
    this.alerts.close(alert.id);
  }

  onConfirm(alert: AlertConfig, accepted: boolean) {
    this.alerts.close(alert.id, accepted);
  }

  getIcon(variant: AlertConfig['variant']) {
    switch (variant) {
      case 'success': return '✓';
      case 'error': return '!';
      case 'warning': return '!';
      case 'confirm': return '?';
      default: return 'i';
    }
  }

  getBadgeClass(variant: AlertConfig['variant']) {
    const map: Record<string, string> = {
      info: 'bg-blue-500',
      success: 'bg-green-500',
      warning: 'bg-amber-500',
      error: 'bg-red-500',
      confirm: 'bg-primary-600'
    };
    return map[variant] || 'bg-blue-500';
  }

  getContainerClass(variant: AlertConfig['variant']) {
    const map: Record<string, string> = {
      info: 'border-blue-100 bg-white',
      success: 'border-green-100 bg-white',
      warning: 'border-amber-100 bg-white',
      error: 'border-red-100 bg-white',
      confirm: 'border-primary-100 bg-white'
    };
    return map[variant] || 'border-slate-200 bg-white';
  }
}
