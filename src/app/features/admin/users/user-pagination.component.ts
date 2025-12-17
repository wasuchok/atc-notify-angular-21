import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-user-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 pt-6">
      <div class="text-sm text-slate-500 mb-4 sm:mb-0">
        แสดง <span class="font-bold text-slate-800">{{ startIndex + 1 }}</span> ถึง <span class="font-bold text-slate-800">{{ endIndex }}</span> จาก <span class="font-bold text-slate-800">{{ totalItems }}</span> รายการ
      </div>

      <div class="flex items-center gap-2">
        <button
          (click)="prev.emit()"
          [disabled]="currentPage === 1"
          class="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-white hover:text-primary-600 hover:border-primary-200 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all bg-slate-50">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </button>

        <div class="flex gap-1">
          @for (page of pages; track page) {
            <button
              (click)="goToPage.emit(page)"
              [class.bg-primary-600]="currentPage === page"
              [class.text-white]="currentPage === page"
              [class.shadow-md]="currentPage === page"
              [class.shadow-primary-200]="currentPage === page"
              [class.bg-white]="currentPage !== page"
              [class.text-slate-600]="currentPage !== page"
              [class.hover:bg-slate-50]="currentPage !== page"
              class="w-9 h-9 rounded-lg text-sm font-bold flex items-center justify-center transition-all border border-transparent"
              [class.border-slate-200]="currentPage !== page">
              {{ page }}
            </button>
          }
        </div>

        <button
          (click)="next.emit()"
          [disabled]="currentPage === totalPages"
          class="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-white hover:text-primary-600 hover:border-primary-200 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all bg-slate-50">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  `
})
export class UserPaginationComponent {
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() startIndex = 0;
  @Input() endIndex = 0;
  @Input() totalItems = 0;
  @Input() pages: number[] = [];

  @Output() prev = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();
  @Output() goToPage = new EventEmitter<number>();
}
