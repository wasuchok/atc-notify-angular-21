import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-chat-index',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex items-center justify-center">
      <div class="text-center max-w-md">
        <div class="mx-auto w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center border border-slate-200">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M8 10h8M8 14h5m-8 4h10l5 3V6a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <p class="mt-3 text-sm font-semibold text-slate-900">เลือกห้องแชทจากแถบซ้าย</p>
        <p class="text-xs text-slate-500">จะแสดงข้อความล่าสุดและสามารถส่งข้อความได้</p>
      </div>
    </div>
  `,
})
export class ChatIndexComponent {}

