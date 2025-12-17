import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  providers: [provideCharts(withDefaultRegisterables())],
  template: `
    <div class="space-y-5">

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <!-- Card 1 -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-200">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-gray-500 text-xs font-medium">ข้อความที่ส่งวันนี้</h3>
            <span class="text-[10px] font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">+12%</span>
          </div>
          <div class="flex items-baseline">
            <p class="text-2xl font-bold text-gray-800">1,240</p>
            <span class="ml-2 text-[10px] text-gray-400">ข้อความ</span>
          </div>
        </div>

        <!-- Card 2 -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-200">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-gray-500 text-xs font-medium">ผู้รับข่าวสาร (Active)</h3>
            <span class="text-[10px] font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">+5%</span>
          </div>
          <div class="flex items-baseline">
            <p class="text-2xl font-bold text-gray-800">8,421</p>
            <span class="ml-2 text-[10px] text-gray-400">คน</span>
          </div>
        </div>

        <!-- Card 3 -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-200">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-gray-500 text-xs font-medium">ส่งไม่สำเร็จ (Failed)</h3>
            <span class="text-[10px] font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-full">ตรวจสอบ</span>
          </div>
          <div class="flex items-baseline">
            <p class="text-2xl font-bold text-gray-800">12</p>
            <span class="ml-2 text-[10px] text-gray-400">รายการ</span>
          </div>
        </div>

        <!-- Card 4 -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-200">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-gray-500 text-xs font-medium">เครดิตคงเหลือ (SMS)</h3>
            <span class="text-[10px] font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-full">ปกติ</span>
          </div>
          <div class="flex items-baseline">
            <p class="text-2xl font-bold text-gray-800">5,000</p>
            <span class="ml-2 text-[10px] text-gray-400">ข้อความ</span>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <!-- Chart 1: Delivery Stats -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-5 lg:col-span-2">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold text-gray-800 text-sm">สถิติการส่งข้อความ (7 วันล่าสุด)</h3>
            <select class="text-[10px] border-gray-200 rounded-md text-gray-500 focus:ring-0 focus:border-primary-500 py-1">
              <option>Line Official</option>
              <option>Email</option>
              <option>SMS</option>
            </select>
          </div>
          <div class="h-56">
            <canvas baseChart [type]="'bar'" [data]="deliveryChartData" [options]="deliveryChartOptions"></canvas>
          </div>
        </div>

        <!-- Chart 2: Channel Distribution -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold text-gray-800 text-sm">ช่องทางการส่ง</h3>
          </div>
          <div class="flex items-center justify-center h-48">
            <div class="w-40 h-40">
              <canvas baseChart [type]="'doughnut'" [data]="channelChartData" [options]="channelChartOptions"></canvas>
            </div>
          </div>
          <div class="space-y-2 mt-2">
             <div class="flex justify-between text-xs text-gray-600">
               <span class="flex items-center"><span class="w-2 h-2 bg-green-500 rounded-full mr-2"></span>Line</span>
               <span>70%</span>
             </div>
             <div class="flex justify-between text-xs text-gray-600">
               <span class="flex items-center"><span class="w-2 h-2 bg-primary-500 rounded-full mr-2"></span>Email</span>
               <span>20%</span>
             </div>
             <div class="flex justify-between text-xs text-gray-600">
               <span class="flex items-center"><span class="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>SMS</span>
               <span>10%</span>
             </div>
          </div>
        </div>
      </div>

      <!-- Recent Notifications Table -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 class="font-bold text-gray-800 text-sm">รายการแจ้งเตือนล่าสุด</h3>
          </div>
          <button class="text-primary-600 hover:text-primary-800 text-xs font-medium transition-colors">ดูทั้งหมด</button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-xs text-gray-600">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-5 py-3 text-left font-semibold text-gray-600">หัวข้อแจ้งเตือน</th>
                <th class="px-5 py-3 text-left font-semibold text-gray-600">ช่องทาง</th>
                <th class="px-5 py-3 text-left font-semibold text-gray-600">ผู้รับ</th>
                <th class="px-5 py-3 text-left font-semibold text-gray-600">สถานะ</th>
                <th class="px-5 py-3 text-left font-semibold text-gray-600">เวลาส่ง</th>
                <th class="px-5 py-3 text-center font-semibold text-gray-600">จัดการ</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-5 py-3 font-medium text-gray-800">แจ้งเตือนเงินเดือนเข้า</td>
                <td class="px-5 py-3"><span class="flex items-center"><span class="w-2 h-2 bg-green-500 rounded-full mr-1"></span>Line</span></td>
                <td class="px-5 py-3">All Users</td>
                <td class="px-5 py-3"><span class="text-green-600 bg-green-50 px-2 py-0.5 rounded text-[10px] font-medium">สำเร็จ</span></td>
                <td class="px-5 py-3">10:30 น.</td>
                <td class="px-5 py-3 text-center"><button class="text-primary-600 hover:underline">ดูผล</button></td>
              </tr>
              <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-5 py-3 font-medium text-gray-800">OTP ยืนยันตัวตน</td>
                <td class="px-5 py-3"><span class="flex items-center"><span class="w-2 h-2 bg-orange-500 rounded-full mr-1"></span>SMS</span></td>
                <td class="px-5 py-3">081-234-xxxx</td>
                <td class="px-5 py-3"><span class="text-green-600 bg-green-50 px-2 py-0.5 rounded text-[10px] font-medium">สำเร็จ</span></td>
                <td class="px-5 py-3">10:28 น.</td>
                <td class="px-5 py-3 text-center"><button class="text-primary-600 hover:underline">ดูผล</button></td>
              </tr>
              <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-5 py-3 font-medium text-gray-800">สรุปยอดประจำวัน</td>
                <td class="px-5 py-3"><span class="flex items-center"><span class="w-2 h-2 bg-primary-500 rounded-full mr-1"></span>Email</span></td>
                <td class="px-5 py-3">ผู้บริหาร</td>
                <td class="px-5 py-3"><span class="text-red-600 bg-red-50 px-2 py-0.5 rounded text-[10px] font-medium">ล้มเหลว</span></td>
                <td class="px-5 py-3">08:00 น.</td>
                <td class="px-5 py-3 text-center"><button class="text-primary-600 hover:underline">แก้ไข</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent {
  readonly deliveryChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.', 'อา.'],
    datasets: [
      {
        data: [40, 60, 55, 70, 85, 65, 90],
        backgroundColor: 'rgba(59, 130, 246, 0.75)',
        hoverBackgroundColor: 'rgba(37, 99, 235, 0.9)',
        borderRadius: 10,
        borderSkipped: false,
        maxBarThickness: 26
      }
    ]
  };

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
          label: (ctx) => ` ${ctx.parsed.y}%`
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
        suggestedMax: 100,
        ticks: {
          stepSize: 20,
          color: '#94a3b8',
          font: { size: 10 },
          callback: (v) => `${v}%`
        },
        grid: { color: 'rgba(148,163,184,0.12)' },
        border: { display: false }
      }
    }
  };

  readonly channelChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Line', 'Email', 'SMS'],
    datasets: [
      {
        data: [70, 20, 10],
        backgroundColor: ['#22c55e', '#3b82f6', '#f97316'],
        borderColor: '#ffffff',
        borderWidth: 4,
        hoverOffset: 6
      }
    ]
  };

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
          label: (ctx) => ` ${ctx.label}: ${ctx.parsed}%`
        }
      }
    }
  };
}
