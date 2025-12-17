import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User } from './user.model';

@Component({
  selector: 'app-user-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (visible) {
      <div class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" (click)="close.emit()"></div>
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 class="text-lg font-bold text-slate-800">{{ title }}</h3>
            <button (click)="close.emit()" class="text-slate-400 hover:text-slate-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">ชื่อ-นามสกุล</label>
              <input
                type="text"
                [value]="formData?.name || ''"
                (input)="updateField.emit({ field: 'name', value: $any($event.target).value })"
                class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                placeholder="กรอกชื่อ-นามสกุล">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">อีเมล</label>
              <input
                type="email"
                [value]="formData?.email || ''"
                (input)="updateField.emit({ field: 'email', value: $any($event.target).value })"
                class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                placeholder="example@notify.com">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">สิทธิ์การใช้งาน (Roles)</label>
              <div class="min-h-[80px] bg-slate-50 rounded-xl p-3 border border-slate-200">
                <div class="flex flex-wrap gap-2 mb-2">
                  @for (role of formData?.roles || []; track role) {
                    <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all" [ngClass]="roleStyleFn(role)">
                      <div class="w-1.5 h-1.5 rounded-full" [ngClass]="roleDotFn(role)"></div>
                      <span>{{ role }}</span>
                      <button (click)="removeRole.emit(role)" class="ml-1 hover:bg-black/10 rounded p-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  }
                </div>
                <div class="relative inline-block">
                  <button
                    (click)="toggleRoleSelector.emit()"
                    type="button"
                    class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-primary-400 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    เพิ่ม Role
                  </button>
                  @if (showRoleSelector) {
                    <div class="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
                      <div class="p-2 border-b border-slate-100">
                        <input
                          type="text"
                          placeholder="ค้นหา Role..."
                          [ngModel]="roleSearchQuery"
                          (ngModelChange)="roleSearchChange.emit($event)"
                          class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none">
                      </div>
                      <div class="max-h-48 overflow-y-auto custom-scrollbar">
                        @for (role of filteredRoles; track role) {
                          <button
                            (click)="addRole.emit(role)"
                            type="button"
                            class="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-slate-50 transition-colors text-left">
                            <div class="w-2 h-2 rounded-full" [ngClass]="roleDotFn(role)"></div>
                            <span class="font-medium text-slate-700">{{ role }}</span>
                            <span class="ml-auto text-xs text-slate-500">{{ roleDescriptionFn(role) }}</span>
                          </button>
                        } @empty {
                          <div class="px-3 py-4 text-center text-sm text-slate-500">ไม่พบ Role</div>
                        }
                      </div>
                    </div>
                    <div class="fixed inset-0 z-40" (click)="closeRoleSelector.emit()"></div>
                  }
                </div>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">สถานะ</label>
              <select
                [value]="formData?.status || 'Active'"
                (change)="updateField.emit({ field: 'status', value: $any($event.target).value })"
                class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all appearance-none">
                <option value="Active">ใช้งานอยู่</option>
                <option value="Inactive">ระงับการใช้งาน</option>
              </select>
            </div>
          </div>
          <div class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
            <button (click)="close.emit()" class="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/50 rounded-lg transition-all">ยกเลิก</button>
            <button (click)="submit.emit()" class="px-4 py-2 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-lg shadow-primary-200 transition-all">{{ submitLabel }}</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar {
      width: 4px;
      height: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 2px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }
  `]
})
export class UserFormModalComponent {
  @Input() visible = false;
  @Input() mode: 'add' | 'edit' = 'add';
  @Input() formData: Partial<User> | null = null;
  @Input() availableRoles: string[] = [];
  @Input() filteredRoles: string[] = [];
  @Input() showRoleSelector = false;
  @Input() roleSearchQuery = '';
  @Input() roleStyleFn: (role: string) => string = () => '';
  @Input() roleDotFn: (role: string) => string = () => '';
  @Input() roleDescriptionFn: (role: string) => string = () => '';

  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<void>();
  @Output() updateField = new EventEmitter<{ field: string; value: any }>();
  @Output() addRole = new EventEmitter<string>();
  @Output() removeRole = new EventEmitter<string>();
  @Output() toggleRoleSelector = new EventEmitter<void>();
  @Output() closeRoleSelector = new EventEmitter<void>();
  @Output() roleSearchChange = new EventEmitter<string>();

  get title(): string {
    return this.mode === 'add' ? 'เพิ่มผู้ใช้งานใหม่' : 'แก้ไขข้อมูลผู้ใช้งาน';
  }

  get submitLabel(): string {
    return this.mode === 'add' ? 'บันทึกข้อมูล' : 'บันทึกการแก้ไข';
  }
}
