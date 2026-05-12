# 🛡️ Role-Based Access Control (RBAC) — TaskFlow

TaskFlow มีระบบ Role 3 ระดับ เพื่อควบคุมสิทธิ์การเข้าถึงและการดำเนินการของผู้ใช้

---

## 📋 ภาพรวม

| Role | สิทธิ์ | เหมาะสำหรับ |
|---|---|---|
| **Admin** 👑 | ทำได้ทุกอย่าง | หัวหน้าทีม, Project Manager |
| **Member** 👤 | สร้าง/แก้ไข Task ที่ตัวเองได้รับมอบหมาย | สมาชิกทีมทั่วไป |
| **Viewer** 👁️ | อ่านอย่างเดียว | Stakeholder, Client, Observer |

---

## 🔐 การเข้าถึงหน้า

| หน้า | Admin | Member | Viewer |
|---|---|---|---|
| Dashboard | ✅ | ✅ | ✅ |
| My Tasks (งานของฉัน) | ✅ | ✅ | ✅ |
| Team (ทีม) | ✅ | ✅ | ✅ |
| Daily Graph (กราฟรายวัน) | ✅ | ✅ | ✅ |
| User Management (จัดการผู้ใช้) | ✅ | ❌ | ❌ |
| Settings — Profile | ✅ | ✅ | ✅ |
| Settings — Notifications | ✅ | ✅ | ✅ |
| Settings — Appearance | ✅ | ✅ | ✅ |
| Settings — Workspace | ✅ | ❌ | ❌ |
| Settings — Security | ✅ | ❌ | ❌ |

> **หมายเหตุ:** Viewer ที่พยายามเข้าถึง `/users` โดยตรงจะถูก Redirect ไป Dashboard

---

## ✏️ Task Actions

| Action | Admin | Member | Viewer |
|---|---|---|---|
| สร้าง Task | ✅ | ✅ | ❌ |
| แก้ไข Task (PUT) | ✅ | ✅ (เฉพาะที่ตัวเองถูก assign) | ❌ |
| เปลี่ยน Status (PATCH) | ✅ | ✅ (เฉพาะที่ตัวเองถูก assign) | ❌ |
| ลบ Task | ✅ | ❌ | ❌ |
| เพิ่ม Comment | ✅ | ✅ | ❌ |
| ลบ Comment | ✅ (ทุกอัน) | ✅ (เฉพาะของตัวเอง) | ❌ |
| ดู Task | ✅ | ✅ | ✅ |

---

## 👥 User Management Actions

| Action | Admin | Member | Viewer |
|---|---|---|---|
| ดูรายชื่อผู้ใช้ทั้งหมด | ✅ | ❌ | ❌ |
| ดูรายละเอียดผู้ใช้ | ✅ | ❌ | ❌ |
| สร้างผู้ใช้ | ✅ | ❌ | ❌ |
| แก้ไขผู้ใช้ | ✅ | ❌ | ❌ |
| ลบผู้ใช้ | ✅ | ❌ | ❌ |
| เปลี่ยน Role | ✅ | ❌ | ❌ |
| เปลี่ยน Status | ✅ | ❌ | ❌ |
| Reset รหัสผ่านผู้ใช้ | ✅ | ❌ | ❌ |

---

## 👥 Team Actions

| Action | Admin | Member | Viewer |
|---|---|---|---|
| ดูสมาชิกทีม | ✅ | ✅ | ✅ |
| ดู Activity Log | ✅ | ✅ | ✅ |
| เปลี่ยน Role สมาชิก | ✅ | ❌ | ❌ |
| ลบสมาชิก | ✅ | ❌ | ❌ |
| เชิญสมาชิกใหม่ | ✅ | ❌ | ❌ |

---

## ⚙️ Settings Actions

| Action | Admin | Member | Viewer |
|---|---|---|---|
| ดู Workspace settings | ✅ | ✅ | ✅ |
| แก้ไข Workspace settings | ✅ | ❌ | ❌ |
| ดู Audit Log | ✅ | ❌ | ❌ |
| แก้ไข Profile ตัวเอง | ✅ | ✅ | ✅ |
| เปลี่ยนรหัสผ่านตัวเอง | ✅ | ✅ | ✅ |
| ตั้งค่า Notification ตัวเอง | ✅ | ✅ | ✅ |
| อัปโหลด Avatar ตัวเอง | ✅ | ✅ | ✅ |

---

## 🔔 Notifications

| Action | Admin | Member | Viewer |
|---|---|---|---|
| ดู notification ตัวเอง | ✅ | ✅ | ✅ |
| Mark as read (ของตัวเอง) | ✅ | ✅ | ✅ |
| Mark all read (ของตัวเอง) | ✅ | ✅ | ✅ |
| อ่าน notification คนอื่น | ❌ | ❌ | ❌ |

---

## 📊 การมองเห็นข้อมูล

| ข้อมูล | Admin | Member | Viewer |
|---|---|---|---|
| Dashboard — งานทั้งหมดในระบบ | ทุกงาน | ทุกงาน | ทุกงาน |
| My Tasks — งานของตัวเอง | งานตัวเอง | งานตัวเอง | งานตัวเอง |
| Team — สมาชิกทีม | ทุกคน | ทุกคน | ทุกคน |
| Graph — กราฟรายวัน | ทั้งระบบ | ทั้งระบบ | ทั้งระบบ |

---

## 🧭 Sidebar Navigation

```
ทุก Role เห็น:
  ├── Dashboard
  ├── My Tasks
  ├── Team
  ├── Daily Graph
  └── Settings

เฉพาะ Admin เห็นเพิ่ม:
  └── User Management
```

---

## ⚙️ Settings Tab Visibility

```
ทุก Role:
  ├── Profile
  ├── Notifications
  └── Appearance

เฉพาะ Admin:
  ├── Workspace
  └── Security
```

---

## 🔑 ตัวอย่าง Account สำหรับทดสอบ

| Role | Email | Password |
|---|---|---|
| Admin | `admin@taskflow.io` | `admin123` |
| Member | `sarah@taskflow.io` | `member123` |
| Member | `marcus@taskflow.io` | `member123` |
| Member | `priya@taskflow.io` | `member123` |
| Viewer | `tom@taskflow.io` | `viewer123` |

---

## 🛠️ วิธีการเปลี่ยน Role

1. Login ด้วย **Admin**
2. ไปที่ **User Management** (`/users`)
3. คลิกปุ่ม Edit บน User ที่ต้องการ
4. เปลี่ยน Role จาก dropdown
5. กด Save

---

## 🔒 การป้องกันทางเทคนิค

| ชั้น | กลไก |
|---|---|
| **Middleware** | `next-auth/middleware` — ทุกหน้าต้อง Login |
| **Page Level** | Users page → redirect non-admin ไป Dashboard |
| **UI Level** | Sidebar ซ่อนเมนู Admin, Settings ซ่อน Tab Admin-only |
| **API Level** | `requireAuth()` / `requireAdmin()` ใน `src/lib/auth.ts` — ทุก API route ตรวจสอบ Session + Role |
| **Task Scoping** | Member แก้ไข Task ได้เฉพาะที่ตัวเองถูก assign — ตรวจสอบผ่าน `authorizeWrite()` |
| **Ownership** | Notification/Comment — ตรวจสอบความเป็นเจ้าของก่อน mark read / delete |

---

## 📁 API Auth Reference

| Helper | ไฟล์ | ใช้เมื่อ |
|---|---|---|
| `requireAuth()` | `src/lib/auth.ts` | ต้องการ session (member+) |
| `requireAdmin()` | `src/lib/auth.ts` | ต้องการ admin เท่านั้น |
| `authorizeWrite()` | `src/app/api/tasks/[id]/route.ts` | Member ต้องถูก assign ถึงแก้ไข Task ได้ |

---

— Updated: มิถุนายน 2025
