import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-toolbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-4 font-sarabun">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-800 tracking-tight">{{ title }}</h2>
          <p class="text-slate-500 text-sm mt-1 font-light">จัดการรายชื่อผู้ใช้งานและกำหนดสิทธิ์ (Roles)</p>
        </div>
        <button (click)="addUser.emit()" class="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-primary-200 transition-all transform hover:-translate-y-0.5 flex items-center justify-center text-sm font-semibold">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          เพิ่มผู้ใช้งานใหม่
        </button>
      </div>

      <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col lg:flex-row gap-5 justify-between items-center relative z-20">
        <div class="relative w-full lg:w-96 group">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="ค้นหาชื่อ อีเมล...."
            [(ngModel)]="searchTerm"
            (ngModelChange)="onSearchChange($event)"
            class="pl-11 pr-4 py-3 w-full bg-slate-50 border-transparent focus:bg-white border focus:border-primary-500 rounded-xl text-sm transition-all duration-200 placeholder-slate-400 text-slate-700 focus:ring-4 focus:ring-primary-500/10 outline-none">
        </div>

        <div class="flex flex-wrap gap-3 w-full lg:w-auto">
          <div class="relative group">
            <select
              [(ngModel)]="status"
              (change)="onStatusChange($any($event.target).value)"
              class="appearance-none pl-4 pr-10 py-3 bg-slate-50 border border-transparent hover:bg-white hover:border-slate-200 focus:bg-white focus:border-primary-500 rounded-xl text-sm text-slate-600 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all cursor-pointer min-w-[140px]">
              <option value="">ทุกสถานะ</option>
              <option value="Active">ใช้งานอยู่</option>
              <option value="Inactive">ระงับการใช้งาน</option>
            </select>
            <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <div class="relative group">
            <select
              [(ngModel)]="role"
              (change)="onRoleChange($any($event.target).value)"
              class="appearance-none pl-4 pr-10 py-3 bg-slate-50 border border-transparent hover:bg-white hover:border-slate-200 focus:bg-white focus:border-primary-500 rounded-xl text-sm text-slate-600 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all cursor-pointer min-w-[140px]">
              <option value="">ทุกตำแหน่ง</option>
              <option value="Admin">ผู้ดูแลระบบ</option>
              <option value="User">ผู้ใช้งานทั่วไป</option>
            </select>
            <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class UserToolbarComponent {
  @Input() title = 'จัดการผู้ใช้งาน';

  @Output() addUser = new EventEmitter<void>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() statusChange = new EventEmitter<string>();
  @Output() roleChange = new EventEmitter<string>();

  searchTerm = '';
  status = '';
  role = '';

  onSearchChange(value: string) {
    this.searchChange.emit(value);
  }

  onStatusChange(value: string) {
    this.status = value;
    this.statusChange.emit(value);
  }

  onRoleChange(value: string) {
    this.role = value;
    this.roleChange.emit(value);
  }
}
