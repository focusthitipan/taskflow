<p align="center">
  <img src="public/icon.svg" alt="TaskFlow Logo" width="100" />
</p>

<h1 align="center">TaskFlow</h1>

<p align="center">
  <strong>ระบบจัดการงานทีมสมัยใหม่ — Glassmorphic, แบ่งบทบาท, ทำงานร่วมกันแบบเรียลไทม์</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/NextAuth-4-6C47FF?logo=nextdotjs" alt="NextAuth" />
  <img src="https://img.shields.io/badge/shadcn/ui-New%20York-000000?logo=shadcnui" alt="shadcn/ui" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/License-Apache_2.0-D22128?logo=apache" alt="License" />
</p>

---

## 📖 ภาพรวม

**TaskFlow** คือระบบจัดการงาน (Task Management) แบบ Full-stack ที่สร้างขึ้นสำหรับทีมประสิทธิภาพสูง มาพร้อม UI สไตล์ Glassmorphic ด้วยโทนสีฟ้า-เทาเย็นตา สีม่วงที่เป็นเอกลักษณ์ และรองรับทั้งโหมดสว่างและมืด ทุกรายละเอียดถูกออกแบบอย่างพิถีพิถัน — ทุกพิกเซล ระยะห่าง และสีล้วนมีที่มาที่ไป

### ✨ ฟีเจอร์หลัก

| ฟีเจอร์ | คำอธิบาย |
|---|---|
| 🔐 **ระบบยืนยันตัวตน** | ล็อกอินด้วยอีเมล/รหัสผ่าน ผ่าน NextAuth.js (Credentials + JWT) |
| 🛡️ **ระบบสิทธิ์ตามบทบาท (RBAC)** | Admin, Member, Viewer — กำหนดสิทธิ์ละเอียดทั้งระดับหน้า, API และ UI |
| 📋 **บอร์ด Kanban** | ลาก-วางงานข้ามคอลัมน์ (ยังไม่เริ่ม → กำลังทำ → เสร็จแล้ว) |
| 📝 **จัดการงาน** | สร้าง แก้ไข ลบงาน พร้อมกำหนดความสำคัญ วันครบกำหนด แท็ก ผู้รับผิดชอบ ความคืบหน้า |
| 👥 **ไดเรกทอรีทีม** | การ์ดสมาชิก ภาพรวมภาระงาน ฟีดกิจกรรมล่าสุด |
| 📊 **กราฟรายวัน** | แผนภูมิ 3 แกน — Productivity · Energy · Focus (Recharts) |
| 👑 **จัดการผู้ใช้** | เฉพาะ Admin: เพิ่ม/ลบ/แก้ไขผู้ใช้ เปลี่ยนบทบาท รีเซ็ตรหัสผ่าน |
| ⚙️ **ตั้งค่า Workspace** | ปรับแต่งชื่อพื้นที่ทำงาน วันทำงาน เวลาทำการ ความสำคัญเริ่มต้น |
| 🌗 **โหมดสว่าง/มืด** | รองรับระบบ พร้อมสลับเองได้ |
| 🎨 **สี Accent แบบไดนามิก** | 6 สี preset ปรับได้ทั่วทั้งระบบผ่าน CSS variables |
| 🌐 **ภาษาหลายภาษา** | อังกฤษ & ไทย (เพิ่มภาษาได้) i18n แบบ Context |
| 🔔 **การแจ้งเตือน** | แจ้งเตือนเก็บในฐานข้อมูล + toast ผ่าน Sonner |
| 💬 **ความคิดเห็น** | แสดงความคิดเห็นต่องาน ตรวจสอบสิทธิ์ตามเจ้าของ |
| 📄 **ส่งออก PDF** | ส่งออกกราฟรายวันหรืองานเป็น PDF (jsPDF + html2canvas) |
| 🔍 **ค้นหาทั่วไป** | ค้นหางานด้วยชื่อ, ความสำคัญ, สถานะ (cmdk) |
| 🧭 **Sidebar ที่ตอบสนอง** | Sidebar ย่อ-ขยายได้ มีตัวบอกหน้า Active |

---

## 🖼️ ภาพหน้าจอ

<p align="center">
  <strong>📋 Dashboard — บอร์ด Kanban</strong><br/>
  <img src="screens/kanban.jpg" alt="Dashboard Kanban Board" width="100%" />
</p>

<p align="center">
  <strong>📅 My Tasks — มุมมองปฏิทิน</strong><br/>
  <img src="screens/calendar.jpg" alt="My Tasks Calendar View" width="100%" />
</p>

<p align="center">
  <strong>👥 Team — สมาชิกทีม & ภาระงาน</strong><br/>
  <img src="screens/team.jpg" alt="Team Members & Workload" width="100%" />
</p>

<p align="center">
  <strong>📊 Daily Graph — Productivity · Energy · Focus</strong><br/>
  <img src="screens/daily-graph.jpg" alt="Daily Graph 3-axis Chart" width="100%" />
</p>

<p align="center">
  <strong>👑 User Management — จัดการผู้ใช้ (Admin)</strong><br/>
  <img src="screens/user-management.jpg" alt="User Management Admin" width="100%" />
</p>

<p align="center">
  <strong>🔐 หน้าเข้าสู่ระบบ</strong><br/>
  <img src="screens/login.jpg" alt="Login Page" width="100%" />
</p>

---

## 🏗️ โครงสร้างโปรเจกต์

```
src/
├── app/
│   ├── (auth)/login/          # หน้าเข้าสู่ระบบ
│   ├── (main)/                # หน้าที่ต้องยืนยันตัวตน
│   │   ├── dashboard/         # บอร์ด Kanban
│   │   ├── my-tasks/          # Kanban / รายการ / ปฏิทิน
│   │   ├── team/              # สมาชิกทีม & กิจกรรม
│   │   ├── graph/             # กราฟรายวัน (Productivity/Energy/Focus)
│   │   ├── users/             # จัดการผู้ใช้ (เฉพาะ Admin)
│   │   └── settings/          # โปรไฟล์, แจ้งเตือน, หน้าตา, Workspace, ความปลอดภัย
│   ├── api/                   # REST API routes
│   │   ├── auth/              # NextAuth handlers
│   │   ├── tasks/             # Task CRUD + ความคิดเห็น
│   │   ├── users/             # User CRUD
│   │   ├── team/              # ข้อมูลทีม
│   │   ├── notifications/     # จุดเชื่อมต่อการแจ้งเตือน
│   │   ├── settings/          # โปรไฟล์ / Workspace / แจ้งเตือน / รหัสผ่าน
│   │   └── graph/             # ข้อมูลกราฟ
│   ├── globals.css            # Tailwind + CSS variables
│   └── layout.tsx             # Root layout (ThemeProvider, I18nProvider, AccentProvider)
├── components/
│   ├── ui/                    # shadcn/ui primitives (60+ components)
│   ├── layout/                # Sidebar, Topbar, ค้นหา, Providers
│   ├── dashboard/             # Kanban, TaskCard, FilterBar, TaskModal
│   ├── my-tasks/              # ListView, CalendarView, SummaryWidgets
│   ├── team/                  # MemberCard, WorkloadOverview, ActivityFeed
│   ├── graph/                 # DailyChart
│   └── users/                 # UserModal, UsersTable, DeleteDialog
├── hooks/                     # Custom React hooks
├── lib/
│   ├── auth.ts                # ตัวช่วย Auth (requireAuth, requireAdmin)
│   ├── can-edit.ts            # ตรวจสอบสิทธิ์แก้ไข Task
│   ├── db.ts                  # Prisma client singleton
│   ├── notify.ts              # ตัวช่วยการแจ้งเตือน
│   ├── utils.ts               # cn(), ฟังก์ชันจัดรูปแบบ
│   └── i18n/                  # คำแปล EN / TH
└── middleware.ts              # NextAuth middleware
```

---

## 🔐 ระบบสิทธิ์ตามบทบาท (RBAC)

TaskFlow ใช้ระบบบทบาท 3 ระดับ:

| บทบาท | สิทธิ์ |
|---|---|
| **Admin** 👑 | เข้าถึงทุกอย่าง — จัดการผู้ใช้, ตั้งค่า workspace, ทุกงาน, ทุกความคิดเห็น |
| **Member** 👤 | สร้าง/แก้ไขงานที่ตัวเองรับผิดชอบ; เพิ่ม/ลบความคิดเห็นของตัวเอง; ดูทีม |
| **Viewer** 👁️ | อ่านอย่างเดียว — ดูแดชบอร์ด, งาน, ทีม, กราฟ |

### ชั้นการป้องกัน

| ชั้น | กลไก |
|---|---|
| **Middleware** | `next-auth/middleware` — ทุกหน้าต้องล็อกอิน |
| **Page** | Redirect non-admin ออกจาก `/users` |
| **UI** | Sidebar ซ่อนเมนู Admin; Settings ซ่อนแท็บ Admin |
| **API** | `requireAuth()` / `requireAdmin()` ตรวจสอบทุก API route |
| **Task** | `canEditTask()` — Member แก้ไขได้เฉพาะงานที่ตัวเองสร้างหรือได้รับมอบหมาย |
| **Ownership** | ความคิดเห็น/การแจ้งเตือน ตรวจสอบความเป็นเจ้าของ |

> 📘 ดู [`docs/roles.md`](docs/roles.md) สำหรับตารางสิทธิ์ฉบับเต็ม

---

## 🎨 ระบบดีไซน์

TaskFlow ใช้ระบบดีไซน์ **Glassmorphic Command Surface** โดยเฉพาะ:

- **ตัวอักษร:** DM Sans (น้ำหนัก: 400, 500, 700)
- **ชุดสี:** Secondary Gray (ฟ้า-เทาโทนเย็น), Navy (โหมดมืด), Brand Purple (`#422AFB`)
- **พื้นผิว:** 4 ระดับความสูง — จากกระจกฝ้าไปจนถึง Gradient CTA
- **ความโค้งมน:** 7 ระดับ (5px → วงกลมเต็ม)
- **การเคลื่อนไหว:** 150ms–330ms, ease/linear, ไม่มีแอนิเมชันตกแต่งเกินจำเป็น
- **โหมดมืด:** แผงควบคุมมืออาชีพ — การ์ด Navy 800 บนหน้าสี Navy 900
- **โหมดสว่าง:** กระจกฝ้าขัดเงา — การ์ดสีขาวบนพื้น `#F4F7FE`

> 📘 ดู [`docs/design-token.md`](docs/design-token.md) สำหรับข้อกำหนดการออกแบบฉบับเต็ม

---

## 🚀 เริ่มต้นใช้งาน

### ความต้องการ

- **Node.js** ≥ 20
- **PostgreSQL** ≥ 14
- **npm** ≥ 10 (หรือ yarn/pnpm)

### ตัวแปรสภาพแวดล้อม

สร้างไฟล์ `.env` ที่ root ของโปรเจกต์:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/taskflow"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-at-least-32-chars"
NEXTAUTH_URL="http://localhost:3000"
```

### การติดตั้ง

```bash
# 1. โคลน repository
git clone https://github.com/your-username/taskflow.git
cd taskflow

# 2. ติดตั้ง dependencies
npm install

# 3. สร้าง Prisma client
npm run db:generate

# 4. Push schema ลงฐานข้อมูล
npm run db:push

# 5. Seed ข้อมูลตัวอย่าง (แนะนำ)
npm run db:seed

# 6. เริ่มเซิร์ฟเวอร์สำหรับพัฒนา
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000) ในเบราว์เซอร์

### บัญชีทดสอบ

หลังจาก seed แล้ว ใช้บัญชีเหล่านี้สำหรับทดสอบ:

| บทบาท | อีเมล | รหัสผ่าน |
|---|---|---|
| Admin | `admin@taskflow.io` | `admin123` |
| Member | `sarah@taskflow.io` | `member123` |
| Member | `marcus@taskflow.io` | `member123` |
| Member | `priya@taskflow.io` | `member123` |
| Viewer | `tom@taskflow.io` | `viewer123` |

---

## 📦 เทคโนโลยีที่ใช้

| หมวดหมู่ | เทคโนโลยี |
|---|---|
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router) |
| **ภาษา** | [TypeScript 5](https://www.typescriptlang.org/) |
| **ORM** | [Prisma 7](https://www.prisma.io/) |
| **ฐานข้อมูล** | PostgreSQL |
| **ยืนยันตัวตน** | [NextAuth.js 4](https://next-auth.js.org/) (Credentials + JWT) |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com/) (สไตล์ New York) |
| **CSS** | [Tailwind CSS 3](https://tailwindcss.com/) + `tailwindcss-animate` |
| **ลาก-วาง** | [dnd-kit](https://dndkit.com/) |
| **กราฟ** | [Recharts](https://recharts.org/) |
| **ฟอร์ม** | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| **ไอคอน** | [Lucide React](https://lucide.dev/) |
| **Toast** | [Sonner](https://sonner.emilkowal.ski/) |
| **Command Palette** | [cmdk](https://cmdk.paco.me/) |
| **ส่งออก PDF** | [jsPDF](https://parall.ax/products/jspdf) + [html2canvas](https://html2canvas.hertzen.com/) |
| **ธีม** | [next-themes](https://github.com/pacocoursey/next-themes) |
| **เข้ารหัสรหัสผ่าน** | [bcryptjs](https://github.com/dcodeIO/bcrypt.js) |

---

## 📋 สคริปต์ที่มีให้ใช้

| คำสั่ง | คำอธิบาย |
|---|---|
| `npm run dev` | เริ่มเซิร์ฟเวอร์สำหรับพัฒนา |
| `npm run build` | Build สำหรับ production |
| `npm run start` | เริ่มเซิร์ฟเวอร์ production |
| `npm run lint` | รัน ESLint |
| `npm run db:generate` | สร้าง Prisma client |
| `npm run db:migrate` | รัน database migrations |
| `npm run db:push` | Push schema ลงฐานข้อมูล |
| `npm run db:seed` | Seed ข้อมูลตัวอย่าง |
| `npm run db:studio` | เปิด Prisma Studio |

---

## 🔌 API Routes

API routes ทั้งหมดอยู่ภายใต้ `/api/`:

| Method | Endpoint | สิทธิ์ | คำอธิบาย |
|---|---|---|---|
| `GET/POST` | `/api/tasks` | Member+ | แสดงรายการ / สร้างงาน |
| `GET/PUT/DELETE` | `/api/tasks/[id]` | Member+ | ดู / แก้ไข / ลบงาน |
| `PATCH` | `/api/tasks/[id]` | Member+ | อัปเดตสถานะงาน |
| `GET/POST` | `/api/tasks/[id]/comments` | Member+ | แสดง / เพิ่มความคิดเห็น |
| `DELETE` | `/api/tasks/[id]/comments/[commentId]` | Member+ | ลบความคิดเห็น |
| `GET/POST` | `/api/users` | Admin | แสดงรายการ / สร้างผู้ใช้ |
| `GET/PUT/DELETE` | `/api/users/[id]` | Admin | ดู / แก้ไข / ลบผู้ใช้ |
| `PATCH` | `/api/users/[id]/status` | Admin | เปลี่ยนสถานะผู้ใช้ |
| `PATCH` | `/api/users/[id]/password` | Admin | รีเซ็ตรหัสผ่านผู้ใช้ |
| `GET` | `/api/team/members` | Member+ | แสดงสมาชิกทีม |
| `GET` | `/api/team/activity` | Member+ | ฟีดกิจกรรมล่าสุด |
| `GET` | `/api/notifications` | Member+ | การแจ้งเตือนของผู้ใช้ |
| `PATCH` | `/api/notifications/[id]/read` | Member+ | อ่านแล้ว |
| `PATCH` | `/api/notifications/read-all` | Member+ | อ่านทั้งหมด |
| `GET/PUT` | `/api/settings/workspace` | Member+/Admin | ตั้งค่า Workspace |
| `PUT` | `/api/settings/profile` | Member+ | อัปเดตโปรไฟล์ตัวเอง |
| `PUT` | `/api/settings/password` | Member+ | เปลี่ยนรหัสผ่านตัวเอง |
| `PUT` | `/api/settings/notifications` | Member+ | ตั้งค่าการแจ้งเตือน |
| `POST/DELETE` | `/api/settings/avatar` | Member+ | อัปโหลด / ลบรูปโปรไฟล์ |
| `GET` | `/api/settings/audit-log` | Admin | บันทึกประวัติกิจกรรม |
| `GET` | `/api/graph/daily` | Member+ | ข้อมูลกราฟรายวัน |

---

## 🗄️ โครงสร้างฐานข้อมูล

<p align="center">
  <em>โมเดลหลัก: User, Task, TaskAssignee, Comment, ActivityLog, Notification, WorkspaceSetting</em>
</p>

<details>
<summary><strong>คลิกเพื่อดูแผนภาพ Schema</strong></summary>

```
┌─────────────────┐       ┌──────────────────┐
│      User       │       │      Task        │
├─────────────────┤       ├──────────────────┤
│ id (PK)         │──┐    │ id (PK)          │
│ firstName       │  │    │ title            │
│ lastName        │  │    │ description      │
│ email (UQ)      │  │    │ status (enum)    │
│ password        │  │    │ priority (enum)  │
│ role (enum)     │  │    │ project          │
│ status (enum)   │  │    │ tags (string[])  │
│ avatarColor     │  │    │ dueDate          │
│ avatarUrl       │  │    │ progress         │
│ timezone        │  │    │ createdById (FK) │──┘
│ language        │  │    │ createdAt        │
│ notif*          │  │    │ updatedAt        │
│ createdAt       │  │    └──────────────────┘
└─────────────────┘  │
       │             │    ┌──────────────────┐
       │             │    │  TaskAssignee    │
       │             ├────│  (composite PK)  │
       │             │    │  taskId (FK)     │
       │             │    │  userId (FK)     │
       │             │    └──────────────────┘
       │             │
       │             │    ┌──────────────────┐
       │             ├────│    Comment       │
       │             │    │  taskId (FK)     │
       │             │    │  userId (FK)     │
       │             │    │  content         │
       │             │    └──────────────────┘
       │             │
       │             │    ┌──────────────────┐
       │             ├────│  ActivityLog     │
       │             │    │  userId (FK)     │
       │             │    │  targetId (FK)   │
       │             │    │  action          │
       │             │    └──────────────────┘
       │             │
       │             │    ┌──────────────────┐
       │             └────│  Notification    │
       │                  │  userId (FK)     │
       │                  │  title           │
       │                  └──────────────────┘
       │
       │                  ┌──────────────────┐
       └──────────────────│ WorkspaceSetting │
                          │  singleton       │
                          └──────────────────┘
```
</details>

---

## 🧪 ระบบหลายภาษา (i18n)

TaskFlow รองรับหลายภาษาผ่าน React Context Provider:

| ภาษา | ความครอบคลุม | ไฟล์ |
|---|---|---|
| English 🇬🇧 | 100% | `src/lib/i18n/en.ts` |
| ไทย 🇹🇭 | 100% | `src/lib/i18n/th.ts` |

การเพิ่มภาษาใหม่:
1. สร้างไฟล์ `src/lib/i18n/[lang].ts`
2. Implement interface `Translations` จาก `src/lib/i18n/types.ts`
3. เพิ่มตัวเลือกภาษาใน Settings → Profile dropdown

---

## 🎯 สี Accent แบบไดนามิก

ผู้ใช้สามารถเลือกสี Accent ได้ 6 สีผ่าน Settings → Appearance:

| สี | ค่าสี |
|---|---|
| ม่วง (ค่าเริ่มต้น) | `#4318FF` |
| ฟ้า | `#3965FF` |
| เขียว | `#01B574` |
| ส้ม | `#FFB547` |
| แดง | `#EE5D50` |
| ชมพู | `#EC4899` |

สี Accent ถูกนำไปใช้ทั่วทั้งระบบผ่าน CSS custom properties (`--brand-*`) ที่กำหนดใน `AccentProvider`

---

## 📄 สัญญาอนุญาต

โปรเจกต์นี้ใช้สัญญาอนุญาต **Apache License 2.0** — ดู [LICENSE](LICENSE) สำหรับรายละเอียด

```
Copyright 2025

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
```

---

## 🤝 การมีส่วนร่วม

ยินดีรับการมีส่วนร่วม, issues และ feature requests! โดยสามารถ:

1. Fork repository
2. สร้าง branch ฟีเจอร์ (`git checkout -b feature/amazing-feature`)
3. Commit การเปลี่ยนแปลง (`git commit -m 'Add some amazing feature'`)
4. Push ไปยัง branch (`git push origin feature/amazing-feature`)
5. เปิด Pull Request

---

## 🐛 ข้อจำกัดที่ทราบ และแผนงาน

### ข้อจำกัดปัจจุบัน
- การแจ้งเตือนทางอีเมลยังไม่ได้พัฒนา (มี toggle ใน UI แล้ว)
- ยังไม่มี WebSocket แบบเรียลไทม์ — ต้องรีเฟรชหน้าเพื่อดูการอัปเดตจากผู้ใช้หลายคน
- คำแปลภาษาไทยพร้อมแล้ว แต่ตัวเลือกภาษายังมีเฉพาะ EN/TH ใน dropdown

### แผนงาน
- [ ] แจ้งเตือนทางอีเมล (งานที่ได้รับมอบหมาย, เตือนวันครบกำหนด, สรุปทีมรายสัปดาห์)
- [ ] อัปเดตเรียลไทม์ผ่าน WebSocket
- [ ] แนบไฟล์ในงาน
- [ ] งานที่เกี่ยวข้องและงานย่อย (Task dependencies & subtasks)
- [ ] บันทึกเวลา (Time tracking)
- [ ] OAuth/SSO (Google, GitHub, Microsoft)
- [ ] แอปมือถือ

---

<p align="center">
  <em>สร้างด้วยความพิถีพิถัน ออกแบบเพื่อทีมที่ส่งงานได้จริง</em>
</p>
