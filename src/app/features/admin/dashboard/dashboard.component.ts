import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { LoadingService } from '../../../core/services/loading.service';
import { SwalService } from '../../../shared/swal/swal.service';

type DashboardStats = {
  messages_today: number;
  active_users: number;
  active_channels: number;
  device_tokens: number;
};

type DashboardRecent = {
  id: number;
  channel_id: number;
  channel_name: string;
  type: string;
  title: string;
  sender_uuid: string;
  sender_name: string;
  sender_email: string | null;
  created_at: string;
  image_url: string | null;
};

type DashboardResponse = {
  data: {
    stats: DashboardStats;
    charts: {
      messages_by_day: Array<{ day: string; count: number }>;
      messages_by_type: Array<{ type: string; count: number }>;
      top_channels: Array<{ channel_id: number; channel_name: string; count: number }>;
    };
    recent_messages: DashboardRecent[];
  };
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  providers: [provideCharts(withDefaultRegisterables())],
  template: `
    <div class="space-y-5 font-sarabun">

      <!-- Header -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-xl sm:text-2xl font-bold text-slate-900">ภาพรวมระบบ</h1>
          <p class="text-sm text-slate-500">สรุปการใช้งานล่าสุด (เฉพาะ admin)</p>
        </div>

        <div class="flex items-center gap-2">
          <select [ngModel]="days()" (ngModelChange)="onDaysChange($event)"
            class="text-sm border border-slate-200 rounded-xl text-slate-700 bg-white px-3 py-2 hover:bg-slate-50 focus:ring-4 focus:ring-slate-200 focus:border-slate-300 outline-none transition-all">
            <option [ngValue]="7">7 วันล่าสุด</option>
            <option [ngValue]="14">14 วันล่าสุด</option>
            <option [ngValue]="30">30 วันล่าสุด</option>
          </select>

          <button type="button" (click)="fetchDashboard()"
            class="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-3-6.708M21 3v6h-6" />
            </svg>
            รีเฟรช
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div class="bg-white rounded-2xl border border-slate-200 p-5">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-xs font-semibold text-slate-600">ข้อความวันนี้</p>
              <p class="mt-2 text-2xl font-bold text-slate-900 tabular-nums">{{ stats().messages_today | number }}</p>
              <p class="text-[11px] text-slate-500">ข้อความ</p>
            </div>
            <div class="w-11 h-11 rounded-2xl bg-white text-slate-500 flex items-center justify-center ring-1 ring-slate-100">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M8 10h8M8 14h5m-8 4h10l5 3V6a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200 p-5">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-xs font-semibold text-slate-600">ผู้ใช้งานทั้งหมด</p>
              <p class="mt-2 text-2xl font-bold text-slate-900 tabular-nums">{{ stats().active_users | number }}</p>
              <p class="text-[11px] text-slate-500">คน</p>
            </div>
            <div class="w-11 h-11 rounded-2xl bg-white text-slate-500 flex items-center justify-center ring-1 ring-slate-100">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200 p-5">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-xs font-semibold text-slate-600">แชนแนลที่ใช้งาน</p>
              <p class="mt-2 text-2xl font-bold text-slate-900 tabular-nums">{{ stats().active_channels | number }}</p>
              <p class="text-[11px] text-slate-500">แชนแนล</p>
            </div>
            <div class="w-11 h-11 rounded-2xl bg-white text-slate-500 flex items-center justify-center ring-1 ring-slate-100">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M3 5h18M3 12h18M3 19h18" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200 p-5">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-xs font-semibold text-slate-600">Device Tokens</p>
              <p class="mt-2 text-2xl font-bold text-slate-900 tabular-nums">{{ stats().device_tokens | number }}</p>
              <p class="text-[11px] text-slate-500">รายการ</p>
            </div>
            <div class="w-11 h-11 rounded-2xl bg-white text-slate-500 flex items-center justify-center ring-1 ring-slate-100">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M12 18h.01M8 7h8a2 2 0 012 2v10a2 2 0 01-2 2H8a2 2 0 01-2-2V9a2 2 0 012-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <!-- Chart 1: Delivery Stats -->
        <div class="bg-white rounded-2xl border border-slate-200 p-5 lg:col-span-2">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="font-bold text-slate-900 text-sm">สถิติข้อความ</h3>
              <p class="text-xs text-slate-500">{{ days() }} วันล่าสุด</p>
            </div>
          </div>
          <div class="h-56">
            <canvas baseChart [type]="'bar'" [data]="deliveryChartData()" [options]="deliveryChartOptions"></canvas>
          </div>
        </div>

        <!-- Chart 2: Top Channels -->
        <div class="bg-white rounded-2xl border border-slate-200 p-5">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="font-bold text-slate-900 text-sm">Top แชนแนล</h3>
              <p class="text-xs text-slate-500">ตามจำนวนข้อความ</p>
            </div>
          </div>
          <div class="flex items-center justify-center h-48">
            <div class="w-40 h-40">
              <canvas baseChart [type]="'doughnut'" [data]="channelChartData()" [options]="channelChartOptions"></canvas>
            </div>
          </div>
          <div class="space-y-2 mt-2" *ngIf="topChannelsLegend().length">
            <div *ngFor="let item of topChannelsLegend()" class="flex justify-between text-xs text-slate-600">
              <span class="flex items-center min-w-0">
                <span class="w-2 h-2 rounded-full mr-2 flex-shrink-0" [style.background]="item.color"></span>
                <span class="truncate">{{ item.label }}</span>
              </span>
              <span class="font-semibold">{{ item.value | number }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Notifications (Compact List) -->
      <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 class="font-bold text-slate-900 text-sm">รายการแจ้งเตือนล่าสุด</h3>
            <p class="text-xs text-slate-500">แสดง {{ recentMessages().length }} รายการล่าสุด</p>
          </div>
          <button type="button" (click)="fetchDashboard()" class="text-slate-700 hover:text-slate-900 text-xs font-semibold transition-colors">รีเฟรช</button>
        </div>

        <div class="divide-y divide-slate-100">
          <div *ngFor="let r of recentMessages()" class="px-5 py-4 hover:bg-slate-50/60 transition-colors">
            <div class="flex items-start gap-4">
              <div class="w-10 h-10 rounded-2xl bg-slate-200 text-slate-700 font-bold flex items-center justify-center ring-1 ring-slate-300 flex-shrink-0">
                {{ (r.sender_name || '?').trim().slice(0,1) }}
              </div>

              <div class="min-w-0 flex-1">
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <p class="text-sm font-semibold text-slate-900 truncate">{{ r.title || '—' }}</p>
                    <div class="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                      <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-slate-200 bg-white text-slate-700 font-semibold">
                        {{ r.channel_name }}
                      </span>
                      <span class="inline-flex items-center px-2 py-0.5 rounded-full border border-slate-200 bg-white text-slate-700 font-semibold">
                        {{ r.type }}
                      </span>
                      <span class="hidden sm:inline text-slate-300">•</span>
                      <span class="hidden sm:inline truncate max-w-[260px]">{{ r.sender_name }}</span>
                      <span class="hidden sm:inline text-slate-300">•</span>
                      <span class="tabular-nums">{{ thaiTime(r.created_at) }}</span>
                      <span class="hidden sm:inline text-slate-300">•</span>
                      <span class="font-mono truncate">#{{ r.id }}</span>
                    </div>
                  </div>

                  <button type="button" (click)="copyText(r.sender_uuid)"
                    class="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors flex-shrink-0"
                    title="คัดลอก UUID">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M10 4h8a2 2 0 012 2v10a2 2 0 01-2 2h-8a2 2 0 01-2-2V6a2 2 0 012-2z" />
                    </svg>
                  </button>
                </div>

                <p class="mt-2 text-[11px] text-slate-500 truncate sm:hidden">
                  {{ r.sender_name }} • {{ thaiTime(r.created_at) }} • #{{ r.id }}
                </p>
              </div>
            </div>
          </div>

          <div *ngIf="recentMessages().length === 0" class="px-5 py-10 text-center text-slate-500 text-sm">
            ยังไม่มีข้อมูล
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent {
  stats = signal<DashboardStats>({
    messages_today: 0,
    active_users: 0,
    active_channels: 0,
    device_tokens: 0,
  });

  days = signal<number>(7);
  recentMessages = signal<DashboardRecent[]>([]);

  private readonly palette = ['#22c55e', '#3b82f6', '#f97316', '#a855f7', '#ef4444'];
  topChannelsLegend = signal<Array<{ label: string; value: number; color: string }>>([]);

  deliveryChartData = signal<ChartConfiguration<'bar'>['data']>({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: 'rgba(59, 130, 246, 0.75)',
        hoverBackgroundColor: 'rgba(37, 99, 235, 0.9)',
        borderRadius: 10,
        borderSkipped: false,
        maxBarThickness: 26,
      },
    ],
  });

  readonly deliveryChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 700,
      easing: 'easeOutQuart'
    },
    layout: { padding: { top: 6, right: 6, bottom: 0, left: 0 } },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 10,
        displayColors: false,
        callbacks: {
          label: (ctx) => ` ${ctx.parsed.y} ข้อความ`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { size: 10, weight: 600 } }
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: '#94a3b8',
          font: { size: 10 },
        },
        grid: { color: 'rgba(148,163,184,0.12)' },
        border: { display: false }
      }
    }
  };

  channelChartData = signal<ChartConfiguration<'doughnut'>['data']>({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [],
        borderColor: '#ffffff',
        borderWidth: 4,
        hoverOffset: 6,
      },
    ],
  });

  readonly channelChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    animation: {
      duration: 700,
      easing: 'easeOutQuart'
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.label}: ${ctx.parsed}`
        }
      }
    }
  };

  constructor(
    private readonly api: ApiService,
    private readonly loadingService: LoadingService,
    private readonly swal: SwalService
  ) {}

  async ngOnInit() {
    await this.fetchDashboard();
  }

  async fetchDashboard() {
    this.loadingService.show();
    try {
      const res = await firstValueFrom(
        this.api.getPrivate<DashboardResponse>('/dashboard', { params: { days: this.days(), limit: 10 } })
      );

      const data = res.data;
      this.stats.set(data.stats);
      this.recentMessages.set(data.recent_messages || []);

      const labels = (data.charts.messages_by_day || []).map((d) => this.thaiDayLabel(d.day));
      const values = (data.charts.messages_by_day || []).map((d) => d.count);
      this.deliveryChartData.set({
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: 'rgba(59, 130, 246, 0.75)',
            hoverBackgroundColor: 'rgba(37, 99, 235, 0.9)',
            borderRadius: 10,
            borderSkipped: false,
            maxBarThickness: 26,
          },
        ],
      });

      const top = data.charts.top_channels || [];
      const topLabels = top.map((t) => t.channel_name);
      const topValues = top.map((t) => t.count);
      const colors = topValues.map((_, idx) => this.palette[idx % this.palette.length]);
      this.channelChartData.set({
        labels: topLabels,
        datasets: [
          {
            data: topValues,
            backgroundColor: colors,
            borderColor: '#ffffff',
            borderWidth: 4,
            hoverOffset: 6,
          },
        ],
      });
      this.topChannelsLegend.set(topLabels.map((label, idx) => ({ label, value: topValues[idx] || 0, color: colors[idx] })));
    } catch (err: any) {
      const message = err?.error?.message || 'ไม่สามารถดึงข้อมูล dashboard ได้';
      this.swal.error('แจ้งเตือน', message);
    } finally {
      this.loadingService.hide();
    }
  }

  async onDaysChange(value: number) {
    if (value === this.days()) return;
    this.days.set(value);
    await this.fetchDashboard();
  }

  thaiDayLabel(isoDate: string) {
    const d = new Date(isoDate);
    if (Number.isNaN(d.getTime())) return isoDate;
    const weekday = d.toLocaleDateString('th-TH', { weekday: 'short' });
    const day = d.toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit' });
    return `${weekday} ${day}`;
  }

  thaiTime(iso: string) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleString('th-TH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  async copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      this.swal.success('สำเร็จ', 'คัดลอกแล้ว');
    } catch {
      this.swal.error('ไม่สำเร็จ', 'ไม่สามารถคัดลอกได้');
    }
  }
}
