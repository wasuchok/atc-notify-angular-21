import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');
      * { font-family: 'Sarabun', sans-serif; }

      aside { transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1); }

      .custom-scrollbar::-webkit-scrollbar { width: 3px; }
      .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(255, 255, 255, 0.1); border-radius: 20px; }

      .dropdown-enter { animation: slideDown 0.2s ease-out forwards; }
      @keyframes slideDown {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }


      .spinner {
        border: 4px solid rgba(0, 0, 0, 0.1);
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border-left-color: var(--color-primary-600);
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>

    @if (loading()) {
      <div class="fixed inset-0 z-[1000] bg-black/20 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300">
        <div class="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center justify-center min-w-[200px]">
          <div class="spinner mb-4"></div>
          <p class="text-gray-700 text-sm font-medium">กรุณารอสักครู่...</p>
        </div>
      </div>
    }

    <div class="flex h-screen bg-gray-50 overflow-hidden">
      <!-- Sidebar -->
      <aside [class.w-60]="!sidebarCollapsed()" [class.w-[68px]]="sidebarCollapsed()"
             class="bg-[#0f172a] flex flex-col shadow-2xl relative z-20 flex-shrink-0 text-slate-300 border-r border-slate-800">

        <!-- Logo Area -->
        <div class="h-14 flex items-center justify-center border-b border-slate-800 relative bg-[#0f172a]">
          <div class="flex items-center w-full px-3" [class.justify-center]="sidebarCollapsed()" [class.justify-start]="!sidebarCollapsed()">
            <div class="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center flex-shrink-0 text-white shadow-lg shadow-primary-900/30 ring-1 ring-white/10">
              <img src="/assets/logo.png" alt="Logo" class="w-6 h-6 object-contain">
            </div>

            <div class="ml-3 overflow-hidden whitespace-nowrap transition-opacity duration-300"
                 [class.opacity-0]="sidebarCollapsed()"
                 [class.opacity-100]="!sidebarCollapsed()"
                 [style.display]="sidebarCollapsed() ? 'none' : 'block'">
              <h1 class="text-sm font-bold text-white tracking-wide leading-tight">ระบบแจ้งเตือน</h1>
              <p class="text-[9px] text-slate-400 uppercase tracking-wider">Notify Center</p>
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 py-4 px-2 space-y-1 overflow-y-auto custom-scrollbar">
          <ng-container *ngFor="let item of menuItems">
            <a [routerLink]="item.path" routerLinkActive="bg-primary-600 text-white shadow-md shadow-primary-900/20"
               class="flex items-center px-2.5 py-2 rounded-lg hover:bg-slate-800/80 hover:text-white transition-all duration-200 group relative cursor-pointer overflow-hidden">

              <div class="flex-shrink-0 w-5 h-5 flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" [attr.d]="item.icon" />
                </svg>
              </div>

              <span class="ml-3 text-[13px] font-medium whitespace-nowrap transition-all duration-300"
                    [class.opacity-0]="sidebarCollapsed()"
                    [class.translate-x-4]="sidebarCollapsed()"
                    [class.opacity-100]="!sidebarCollapsed()"
                    [class.translate-x-0]="!sidebarCollapsed()"
                    [style.display]="sidebarCollapsed() ? 'none' : 'block'">
                {{ item.label }}
              </span>

              @if (sidebarCollapsed()) {
                <div class="absolute left-14 top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1.5 bg-slate-900 text-white text-[11px] rounded shadow-xl border border-slate-700 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                  {{ item.label }}
                </div>
              }
            </a>
          </ng-container>
        </nav>

        <!-- Sidebar Footer -->
        <div class="p-3 border-t border-slate-800 bg-[#0f172a]">
           <button class="flex items-center w-full px-2.5 py-2 text-slate-400 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors group relative overflow-hidden">
             <div class="flex-shrink-0 w-5 h-5 flex items-center justify-center">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                 <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
               </svg>
             </div>
             <span class="ml-3 text-[13px] font-medium whitespace-nowrap transition-all duration-300"
                   [class.opacity-0]="sidebarCollapsed()"
                   [class.translate-x-4]="sidebarCollapsed()"
                   [class.opacity-100]="!sidebarCollapsed()"
                   [class.translate-x-0]="!sidebarCollapsed()"
                   [style.display]="sidebarCollapsed() ? 'none' : 'block'">
               ออกจากระบบ
             </span>
           </button>
        </div>
      </aside>


      <div class="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50">
        <!-- Header -->
        <header class="relative bg-white shadow-sm z-[999] h-14 flex items-center justify-between px-5 border-b border-gray-100">

          <div class="flex items-center">
            <button (click)="toggleSidebar()"
                    class="p-1.5 -ml-1.5 rounded-md text-slate-500 hover:bg-slate-50 hover:text-blue-600 focus:outline-none transition-colors mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </button>

            <div class="hidden md:flex items-center space-x-2 text-sm">
              <span class="text-slate-400 text-xs">หน้าหลัก</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
              <span class="font-semibold text-blue-900 text-xs">{{ currentTitle() }}</span>
            </div>
          </div>

          <div class="flex items-center space-x-3">
             <button class="p-1.5 text-slate-400 hover:text-blue-600 relative rounded-full hover:bg-blue-50 transition-colors">
                <span class="absolute top-1.5 right-1.5 h-1.5 w-1.5 bg-red-500 rounded-full border border-white"></span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
             </button>

             <div class="relative">
               <div (click)="toggleProfileMenu()" class="flex items-center space-x-2 cursor-pointer p-1 rounded-full hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200">
                 <div class="text-right hidden sm:block">
                   <p class="text-xs font-bold text-slate-700">ผู้ดูแลระบบ</p>
                 </div>
                 <div class="h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 text-white flex items-center justify-center text-xs font-bold shadow-sm ring-2 ring-white">
                   A
                 </div>
               </div>

               @if (profileMenuOpen()) {
                 <div class="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-1 border border-slate-100 dropdown-enter z-[2100]">
                   <div class="px-4 py-3 border-b border-slate-50 bg-slate-50/50">
                     <p class="text-sm font-bold text-slate-800">ผู้ดูแลระบบ</p>
                     <p class="text-xs text-slate-500">admin@notify.com</p>
                   </div>
                   <div class="py-1">
                     <a href="#" class="block px-4 py-2 text-xs text-slate-600 hover:bg-blue-50 hover:text-blue-700">ข้อมูลส่วนตัว</a>
                     <a href="#" class="block px-4 py-2 text-xs text-slate-600 hover:bg-blue-50 hover:text-blue-700">ตั้งค่าบัญชี</a>
                   </div>
                   <div class="border-t border-slate-100 my-1"></div>
                   <a href="#" class="block px-4 py-2 text-xs text-red-600 hover:bg-red-50">ออกจากระบบ</a>
                 </div>
                 <div (click)="toggleProfileMenu()" class="fixed inset-0 z-[2000]" style="cursor: default;"></div>
               }
             </div>
          </div>
        </header>

        <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-5">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
})
export class AdminLayoutComponent {
  sidebarCollapsed = signal(false);
  profileMenuOpen = signal(false);
  currentTitle = signal('ภาพรวมระบบ');

  menuItems = [
    { path: '/admin/dashboard', label: 'ภาพรวมระบบ', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { path: '/admin/users', label: 'จัดการผู้ใช้งาน', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { path: '/admin/teams', label: 'จัดการทีม', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { path: '/admin/channels', label: 'จัดการแชนแนล', icon: 'M8 10h8M8 14h5m-8 4h10l5 3V6a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { path: '/admin/settings', label: 'ตั้งค่าระบบ', icon: 'M11.983 2.25c.426 0 .84.048 1.238.139l.385 2.311a7.5 7.5 0 011.624.94l2.18-.94a.75.75 0 01.92.33l1.5 2.598a.75.75 0 01-.184.96l-1.795 1.372a7.55 7.55 0 010 1.88l1.795 1.372a.75.75 0 01.184.96l-1.5 2.598a.75.75 0 01-.92.33l-2.18-.94a7.5 7.5 0 01-1.624.94l-.385 2.311a.75.75 0 01-.74.627h-3a.75.75 0 01-.74-.627l-.385-2.311a7.5 7.5 0 01-1.624-.94l-2.18.94a.75.75 0 01-.92-.33l-1.5-2.598a.75.75 0 01.184-.96l1.795-1.372a7.55 7.55 0 010-1.88L2.324 9.29a.75.75 0 01-.184-.96l1.5-2.598a.75.75 0 01.92-.33l2.18.94a7.5 7.5 0 011.624-.94l.385-2.311a.75.75 0 01.74-.627h3zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z' },
  ];

  constructor(private router: Router, public readonly loadingService: LoadingService) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.loadingService.show();
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        setTimeout(() => {
          this.loadingService.hide();

          if (event instanceof NavigationEnd) {
            const url = this.router.url;
            const item = this.menuItems.find(i => i.path === url);
            if (item) {
              this.currentTitle.set(item.label);
            }
          }
        }, 300);
      }
    });
  }

  toggleSidebar() {
    this.sidebarCollapsed.update(value => !value);
  }

  toggleProfileMenu() {
    this.profileMenuOpen.update(value => !value);
  }

  loading() {
    return this.loadingService.loading();
  }
}
