import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { TokenService } from '../../core/services/token.service';
import { SwalService } from '../../shared/swal/swal.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-[#f5f6f4] flex items-center justify-center px-4 font-sarabun">
      <div class="w-full max-w-5xl bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div class="grid grid-cols-1 lg:grid-cols-5">
          <!-- Left strip / crest -->
          <div class="relative lg:col-span-2 bg-gradient-to-b from-[#1b3c5d] to-[#23466c] text-white p-8">
            <div class="absolute inset-y-0 right-0 w-1 bg-amber-400/80"></div>
            <div class="relative space-y-6">
              <div class="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-white/10 border border-white/20">
                <div class="w-11 h-11  flex items-center justify-center overflow-hidden">
                  <img src="/assets/logo.png" alt="Logo" class="w-10 h-10 object-contain" loading="lazy" />
                </div>
                <div>
                  <p class="text-sm font-semibold leading-tight">ATC Notify</p>
                  <p class="text-xs text-white/70 leading-tight">Notify Center</p>
                </div>
              </div>
              <h1 class="text-3xl font-bold leading-snug">ศูนย์รวมการแจ้งเตือนสำหรับองค์กร</h1>
              <p class="text-white/80 text-sm">
           รองรับการแจ้งเตือนเหตุการณ์สำคัญแบบเรียลไทม์
ช่วยให้ทีมงานรับรู้ข้อมูลได้ทันที ติดตามสถานะ และตอบสนองได้อย่างมีประสิทธิภาพ
              </p>
              <div class="space-y-2 text-sm">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                  ระบบพร้อมใช้งาน
                </div>
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-amber-300"></span>
                  เวอร์ชันภายใน 1.0.0
                </div>
              </div>
            </div>
          </div>

          <!-- Form -->
          <div class="lg:col-span-3 p-8 lg:p-10 bg-white">
            <div class="space-y-1 mb-6">
              <p class="text-xs font-semibold text-[#1b3c5d] uppercase tracking-[0.12em]">ลงชื่อเข้าใช้</p>
              <h2 class="text-2xl font-bold text-slate-900">เข้าสู่ระบบ ATC Notify</h2>
              <p class="text-slate-500 text-sm"> โปรดเข้าสู่ระบบด้วยบัญชีผู้ใช้งานของคุณ</p>
              <p class="text-slate-500 text-xs leading-relaxed">

ระบบ ATC Notify ใช้สำหรับรับการแจ้งเตือนเหตุการณ์สำคัญ ติดตามสถานะ และจัดการข้อมูลการแจ้งเตือนแบบเรียลไทม์อย่างปลอดภัย
              </p>
            </div>

            <form class="space-y-4" (ngSubmit)="onSubmit()">
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-1">อีเมล</label>
                <input
                  type="email"
                  [(ngModel)]="email"
                  name="email"
                  required
                  class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#1b3c5d] focus:ring-4 focus:ring-[#1b3c5d]/10 outline-none transition-all placeholder:text-slate-400"
                  placeholder="user@example.com" />
              </div>

              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-1">รหัสผ่าน</label>
                <div class="relative">
                  <input
                    [type]="showPassword ? 'text' : 'password'"
                    [(ngModel)]="password"
                    name="password"
                    required
                    class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#1b3c5d] focus:ring-4 focus:ring-[#1b3c5d]/10 outline-none transition-all placeholder:text-slate-400"
                    placeholder="••••••••" />
                  <button type="button" (click)="showPassword = !showPassword"
                          class="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-[#1b3c5d] transition-colors">
                    <svg *ngIf="showPassword; else eyeGov" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <ng-template #eyeGov>
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.06 10.06 0 011.379-2.988m4.242-3.86A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.97 9.97 0 01-4.123 5.411M15 12a3 3 0 00-4.243-2.829M9.88 9.88L4.12 4.12m0 0L3 3m1.12 1.12L21 21" />
                      </svg>
                    </ng-template>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                [disabled]="loading()"
                class="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white font-semibold bg-[#1b3c5d] hover:bg-[#173553] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-slate-300 transition-all">
                <svg *ngIf="loading()" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                เข้าสู่ระบบ
              </button>

            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  email = 'wasuchokop2@gmail.com';
  password = 'Was@3210';
  showPassword = false;
  loading = signal(false);

  constructor(
    private readonly api: ApiService,
    private readonly tokenService: TokenService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,

    private readonly swal: SwalService
  ) { }

  async onSubmit() {
    if (this.loading()) return;
    if (!this.email || !this.password) {
      this.swal.warning('ข้อมูลไม่ครบถ้วน', 'กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }

    this.loading.set(true);
    try {
      const res = await firstValueFrom(
        this.api.postPublic<any>('/auth/login', { email: this.email, password: this.password })
      );

      this.tokenService.setTokens({ accessToken: res.data.accessToken, refreshToken: res.data.refreshToken });
      this.swal.success('เข้าสู่ระบบสำเร็จ', 'กำลังพาไปยังหน้าแดชบอร์ด');

      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
      const safeUrl = returnUrl && returnUrl.startsWith('/') ? returnUrl : '/admin/dashboard';
      await this.router.navigateByUrl(safeUrl);
    } catch (err: any) {
      const message = err?.error?.message || 'ไม่สามารถเข้าสู่ระบบได้';
      this.swal.error('ไม่สามารถเข้าสู่ระบบได้', message || 'โปรดลองใหม่');
    } finally {
      this.loading.set(false);
    }
  }

}
