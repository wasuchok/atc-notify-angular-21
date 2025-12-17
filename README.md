# web-notify

Frontend (Angular) สำหรับระบบ Notify-ATC

## Requirements

- Node.js + npm (repo ใช้ `npm@10.x`)

## Setup

```bash
cd web-notify
npm install
```

## Run (dev)

```bash
cd web-notify
npm run start
```

เปิด `http://localhost:4200`

## Build

```bash
cd web-notify
npm run build
```

Output อยู่ที่ `web-notify/dist/web-notify`

## Environment / API Base URL

ค่า default ของ API คือ `http://localhost:3300/api/v1` (ดูที่ `web-notify/src/app/core/config/api.config.ts`)

สามารถ override ได้ด้วย env var ตอนรัน (Angular/Vite):

- `NG_APP_API_URL`
- `NG_APP_API_BASE`

ตัวอย่าง (PowerShell):

```powershell
$env:NG_APP_API_URL="http://10.17.3.244:3300/api/v1"
npm run start
```

## Admin Routes

- `/admin/dashboard` ภาพรวม
- `/admin/users` จัดการผู้ใช้งาน + assign roles
- `/admin/channels` จัดการแชนแนล + role visibility + แก้ชื่อ/สถานะ + ลบ (admin)
- `/admin/teams` จัดการทีม (Role) แบบ split-view + จัดการสมาชิกทีม

## Notes

- `MaterialIcons-Regular.otf` ถูกวางไว้ที่ `web-notify/src/assets/fonts/MaterialIcons-Regular.otf` เพื่อให้ `icon_codepoint` แสดงไอคอน “ตรงกับ Flutter”
- Angular assets ถูกกำหนดไว้ที่ `web-notify/angular.json` (`public/` และ `src/assets/`)

## Screenshots

<p>
  <img src="public/pic1.png" width="48%" />
  <img src="public/pic2.png" width="48%" />
</p>
<p>
  <img src="public/pic3.png" width="48%" />
  <img src="public/pic4.png" width="48%" />
</p>
