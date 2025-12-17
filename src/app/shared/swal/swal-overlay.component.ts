import { CommonModule } from '@angular/common';
import { Component, effect, signal } from '@angular/core';
import { SwalService, SwalOptions } from './swal.service';

@Component({
  selector: 'app-swal-overlay',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (modal()) {
      <div class="swal-overlay">
        <div class="swal-backdrop"></div>
        <div class="swal-card animate-in fade-in">
          <div class="swal-content">
            <div class="swal-icon" [ngClass]="iconTone(modal()!.type)">
              <span class="swal-icon-mark">{{ iconSymbol(modal()!.type) }}</span>
            </div>
            <h3 class="swal-title">{{ modal()!.title }}</h3>
            @if (modal()!.text) {
              <p class="swal-text">{{ modal()!.text }}</p>
            }
          </div>
          <div class="swal-footer">
            @if (modal()!.showCancel) {
              <button (click)="close(false)" class="swal-btn ghost">ยกเลิก</button>
            }
            <button (click)="close(true)" class="swal-btn solid">ตกลง</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .swal-overlay {
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      pointer-events: none;
    }
    .swal-backdrop {
      position: absolute;
      inset: 0;
      background: rgba(15, 23, 42, 0.55);
      backdrop-filter: blur(6px);
      animation: fadein 0.18s ease forwards;
    }
    .swal-card {
      width: 100%;
      max-width: 380px;
      background: #ffffff;
      border-radius: 16px;
      border: 1px solid #e5e7eb;
      box-shadow: 0 18px 48px rgba(0,0,0,0.12);
      pointer-events: auto;
      padding: 28px 24px 22px;
      text-align: center;
      position: relative;
    }
    .swal-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
    }
    .swal-icon {
      width: 78px;
      height: 78px;
      border-radius: 50%;
      background: #f6f7fb;
      border: 1px solid #e5e7eb;
      display: grid;
      place-items: center;
      position: relative;
      animation: icon-pop 0.35s ease-out;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.5);
    }
    .swal-icon::after {
      content: '';
      position: absolute;
      inset: -8px;
      border-radius: 50%;
      box-shadow: 0 0 0 0 rgba(0,0,0,0.12);
      animation: ring 1s ease-out;
    }
    .swal-icon-mark {
      font-weight: 800;
      font-size: 30px;
      line-height: 1;
      transform: translateY(-1px);
    }
    .swal-icon.success { color: #2f855a; }
    .swal-icon.success::after { box-shadow: 0 0 0 0 rgba(47, 133, 90, 0.14); }
    .swal-icon.warning { color: #d97706; }
    .swal-icon.warning::after { box-shadow: 0 0 0 0 rgba(217, 119, 6, 0.14); }
    .swal-icon.error { color: #dc2626; }
    .swal-icon.error::after { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.16); }
    .swal-icon.question { color: #4338ca; }
    .swal-icon.question::after { box-shadow: 0 0 0 0 rgba(67, 56, 202, 0.18); }
    .swal-title {
      font-size: 20px;
      font-weight: 700;
      color: #1f2937;
      margin: 0;
      letter-spacing: -0.1px;
    }
    .swal-text {
      font-size: 14px;
      color: #4b5563;
      margin: 0;
      line-height: 1.6;
    }
    .swal-footer {
      margin-top: 14px;
      display: flex;
      justify-content: center;
      gap: 10px;
    }
    .swal-btn {
      border: 0;
      border-radius: 10px;
      padding: 10px 18px;
      font-weight: 700;
      font-size: 14px;
      transition: all 0.15s ease;
      cursor: pointer;
    }
    .swal-btn.solid {
      background: linear-gradient(180deg, #1f3f62, #173553);
      color: white;
      box-shadow: 0 8px 18px rgba(23, 53, 83, 0.25);
    }
    .swal-btn.solid:hover {
      background: linear-gradient(180deg, #223f5c, #13304b);
      transform: translateY(-1px);
    }
    .swal-btn.ghost {
      background: #f8fafc;
      color: #4b5563;
      border: 1px solid #e5e7eb;
    }
    .swal-btn.ghost:hover {
      background: #eef2f7;
    }
    .animate-in { opacity: 0; transform: scale(0.96); }
    .fade-in { animation: fadein 0.18s ease forwards, scalein 0.18s ease forwards; }
    @keyframes fadein { to { opacity: 1; } }
    @keyframes scalein { to { transform: scale(1); } }
    @keyframes icon-pop { from { transform: scale(0.7); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    @keyframes ring { to { box-shadow: 0 0 0 12px rgba(0,0,0,0); } }
  `]
})
export class SwalOverlayComponent {
  modal = signal<(SwalOptions & { id: string }) | null>(null);

  constructor(private readonly swal: SwalService) {
    effect(() => this.modal.set(this.swal.current()));
  }

  close(accepted: boolean) {
    this.swal.resolve(accepted);
  }

  iconSymbol(type?: SwalOptions['type']) {
    switch (type) {
      case 'error': return '×';
      case 'warning': return '!';
      case 'question': return '?';
      default: return '✓';
    }
  }

  iconTone(type?: SwalOptions['type']) {
    const map: Record<string, string> = {
      success: 'success',
      info: 'success',
      warning: 'warning',
      error: 'error',
      question: 'question'
    };
    return map[type || 'success'] || 'success';
  }
}
