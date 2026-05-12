# 🎨 TaskFlow Design Tokens

ระบบดีไซน์ **Glassmorphic Command Surface** — โทนเย็น, มีความลึกแบบหลายชั้น, สีม่วงเป็นจุดเด่น — สร้างขึ้นจากลำดับชั้นที่อ่านง่าย, ระดับความสูงที่นุ่มนวล, และระบบพื้นผิวแบบ Light/Dark

ทุกการตัดสินใจด้านภาพต้องสื่อถึงความชัดเจนและความมั่นคง

---

## 1. จุดประสงค์ด้านภาพ

ระบบนี้ต้องสื่อถึงความมินิมอลที่มั่นใจ: พื้นที่ว่างกว้างขวาง, สีที่มีวัตถุประสงค์ชัดเจนและไม่ใช้แบบฟุ่มเฟือย, และพื้นผิวที่ดูมีน้ำหนักแต่ไม่หนักอึ้ง สี Accent หลัก — ม่วงไฟฟ้าเข้ม — ต้องใช้เป็นสัญญาณที่แม่นยำ ไม่ใช่แค่ตกแต่ง

โหมดมืดต้องดูเหมือนแผงควบคุมของมืออาชีพ โหมดสว่างต้องดูเหมือนกระจกฝ้าขัดเงาบนท้องฟ้าสีฟ้า-เทา

---

## 2. ระบบ Layout & Spacing

### ช่วงระยะห่าง (ใช้ผ่าน Tailwind classes เท่านั้น)

| Token | ค่า | การใช้งาน |
|---|---|---|
| `space-1` | 4px | ระยะห่างเล็กน้อย, ชดเชยไอคอน |
| `space-2` | 8px | ระยะห่างรายการแบบแน่น |
| `space-3` | 12px | Padding ของ Badge, ช่องว่าง Label |
| `space-4` | 16px | Padding ภายใน Component มาตรฐาน |
| `space-5` | 20px | Padding การ์ดเริ่มต้น, ขอบหน้า |
| `space-6` | 24px | ตัวแบ่ง Section |
| `space-7` | 28px | Margin ด้านบนกราฟ |
| `space-8` | 30px | Padding เนื้อหาหน้า (md+) |
| `space-10` | 40px | Offset ด้านบนหน้า Auth |
| `space-14` | 56px | Padding แนวตั้ง Hero section |

### กฎ Layout

- คอลัมน์เนื้อหาหลักต้องชดเชยจาก Navigation panel เป็น `calc(100% - 290px)` ที่ breakpoint `xl` ขึ้นไป
- Container เนื้อหาต้องใช้ `px-5` (mobile) และ `px-8 pt-[50px]` (desktop) เป็นค่าต่ำสุด
- Layout ทั้งหมดต้องสร้างด้วย `flexbox` หรือ `grid` — ห้ามใช้ absolute positioning สำหรับการไหลของเนื้อหาหลัก
- การ์ดต้องมี `w-full` ภายในคอลัมน์เสมอ
- Navigation panel ต้องเป็น `fixed`, สูงเต็มหน้า และไม่ทับเนื้อหาหลักที่ breakpoint ขนาดใหญ่

### Breakpoints

| ชื่อ | Min-width |
|---|---|
| `sm` | 320px |
| `2sm` | 380px |
| `md` | 768px |
| `lg` | 960px |
| `xl` | 1200px |
| `2xl` | 1600px |
| `3xl` | 1920px |

---

## 3. ระบบ Typography

### ตัวอักษร

- **ตัวอักษรหลัก:** DM Sans — ต้องเป็นตัวอักษรเดียวที่ใช้ทั้งระบบ
- **น้ำหนักที่ใช้:** 400 (Regular), 500 (Medium), 700 (Bold) เท่านั้น
- **Letter spacing:** ใช้ `tracking-[-0.5px]` ทั้งระบบที่ `body`; ห้าม override ต่อ component
- **Line height:** `leading-none` (100%) สำหรับ stats, headings, ตัวเลข; `leading-[150%]` สำหรับ body copy

### ลำดับชั้น Typography

| บทบาท | ขนาด | น้ำหนัก | สี (สว่าง / มืด) |
|---|---|---|---|
| หน้าหลัก / hero stat | `text-[34px]` | 700 | `secondaryGray.900` / white |
| Section heading | `text-2xl` (22px) | 700 | `secondaryGray.900` / white |
| หัวข้อการ์ด | `text-xl` | 700 | `secondaryGray.900` / white |
| หัวข้อรอง / label | `text-lg` (18px) | 700 | `secondaryGray.900` / white |
| Body / ค่า | `text-sm` | 700 | `secondaryGray.900` / white |
| ป้ายกำกับรอง | `text-sm` | 400–500 | `secondaryGray.600` (`#A3AED0`) |
| หัวข้อตาราง | `text-[10px]`–`text-[12px]` | 400 | `gray.400` |
| Micro / badge | `text-xs` | 400–700 | ตามบริบท |

### กฎ Typography

- ห้ามใช้ตัวอักษรอื่นนอกจาก DM Sans
- ห้ามใช้น้ำหนักนอกเหนือจาก 400, 500, 700
- ตัวเลขและค่าสถิติต้องใช้ `font-bold` (700) และ `leading-none` เสมอ
- คำอธิบายรองต้องใช้ `secondaryGray.600` และน้ำหนัก 400 หรือ 500
- หัวข้อคอลัมน์ตารางต้องเป็นตัวพิมพ์ใหญ่, `text-xs` หรือเล็กกว่า, และ `gray.400`
- Label ที่ Active ต้องเป็น `font-bold`; ที่ไม่ active ต้องเป็น `font-normal`

---

## 4. สี & พื้นผิว

### ชุดสี Brand

| Token | Hex | การใช้งาน |
|---|---|---|
| `brand.500` | `#422AFB` | CTA หลัก, ไอคอน Active, Accent หลัก (โหมดสว่าง) |
| `brand.400` | `#7551FF` | Accent หลัก (โหมดมืด), Hover fills |
| `brand.600` | `#3311DB` | Hover state ของปุ่มหลัก |
| `brand.900` | `#02044A` | ปุ่ม Brand มืด |
| `brand.100` | `#E9E3FF` | พื้นหลังสีอ่อน |
| Gradient accent | `135deg, #868CFF → #4318FF` | Premium CTAs, FAB, การ์ด Upgrade |

### ชุดสี Secondary Gray (ฟ้า-เทาโทนเย็น)

| Token | Hex | การใช้งาน |
|---|---|---|
| `secondaryGray.900` | `#1B2559` | ข้อความหลัก (โหมดสว่าง) |
| `secondaryGray.700` | `#707EAE` | ข้อความระดับกลาง, ไอคอน |
| `secondaryGray.600` | `#A3AED0` | ข้อความรอง, Placeholder |
| `secondaryGray.500` | `#8F9BBA` | ข้อความระดับตติยภูมิ |
| `secondaryGray.400` | `#E9EDF7` | Hover fills, พื้นหลัง Muted |
| `secondaryGray.300` | `#F4F7FE` | พื้นหลังหน้า (โหมดสว่าง), ปุ่ม Muted fill |
| `secondaryGray.200` | `#E1E9F8` | เส้นขอบเล็กน้อย, เส้นแบ่ง |
| `secondaryGray.100` | `#E0E5F2` | เส้นขอบ Input, เส้นแบ่ง |

### ชุดสี Navy (พื้นผิวโหมดมืด)

| Token | Hex | การใช้งาน |
|---|---|---|
| `navy.900` | `#0b1437` | พื้นหลังหน้า (โหมดมืด) |
| `navy.800` | `#111c44` | พื้นผิวการ์ด (โหมดมืด), Sidebar (โหมดมืด) |
| `navy.700` | `#1B254B` | ข้อความบนพื้นมืด, พื้นผิวรอง |
| `navy.500` | `#1b3bbb` | Navy กลาง |
| `navy.400` | `#3652ba` | Accent |

### ชุดสีความหมาย (Semantic)

| Token | Hex | การใช้งาน |
|---|---|---|
| `green.500` | `#01B574` | สำเร็จ, แนวโน้มเชิงบวก, สถานะ "ตามแผน" |
| `green.100` | `#E6FAF5` | พื้นหลังสีสำเร็จ |
| `red.500` | `#EE5D50` | ข้อผิดพลาด, สถานะปิดการใช้งาน |
| `red.100` | `#FEEFEE` | พื้นหลังสีข้อผิดพลาด |
| `orange.500` | `#FFB547` | สถานะเตือน |
| `orange.100` | `#FFF6DA` | พื้นหลังสีเตือน |
| `blue.500` | `#3965FF` | ข้อมูล |
| `blue.50` | `#EFF4FB` | Progress bar track (โหมดสว่าง) |

### กฎพื้นผิว & ระดับความสูง

- **ระดับ 0 (หน้า):** สว่าง: `secondaryGray.300` (`#F4F7FE`). มืด: `navy.900`.
- **ระดับ 1 (การ์ด):** สว่าง: ขาวบริสุทธิ์ (`#ffffff`). มืด: `navy.800`. Border-radius `rounded-[20px]`. Shadow: `shadow-[14px_17px_40px_4px_rgba(112,144,176,0.08)]`.
- **ระดับ 2 (Navigation panel):** สว่าง: ขาว. มืด: `navy.800`. ไม่มีเส้นขอบ. Shadow: `shadow-[14px_17px_40px_4px_rgba(112,144,176,0.08)]` (โหมดสว่างเท่านั้น).
- **ระดับ 3 (Floating navbar):** Glassmorphism — `backdrop-blur-[20px]`, พื้นหลัง `rgba(244,247,254,0.2)` (สว่าง) / `rgba(11,20,55,0.5)` (มืด), `rounded-[16px]`, เส้นขอบโปร่งใส 1.5px.
- **ระดับ 4 (พื้นผิว Gradient):** สำหรับการ์ด Premium/FAB เท่านั้น — ใช้ `linear-gradient(135deg, #868CFF 0%, #4318FF 100%)`.
- ห้ามใช้สีดำบริสุทธิ์ (`#000000`) บนพื้นผิวใดๆ
- ห้ามใช้ข้อความขาวบนพื้นผิวสว่าง; ห้ามใช้ข้อความมืดบนพื้นผิวมืด
- Avatar/ขอบรูปในการ์ดโหมดมืด ต้องใช้ `navy.800`; โหมดสว่างต้องใช้ `white`

---

## 5. Component & รูปทรง

### ช่วง Border Radius

| ค่า | Class | ใช้กับ |
|---|---|---|
| 5px | `rounded-[5px]` | แถบตัวบอก Active nav |
| 8px | `rounded-[8px]` | Input พื้นฐาน, ปุ่มไอคอนเล็ก |
| 10px | `rounded-[10px]` | Badge, Calendar tiles, ไอคอนเล็ก |
| 16px | `rounded-2xl` | ปุ่มมาตรฐาน, Input fields, Navbar container |
| 20px | `rounded-[20px]` | การ์ด (พื้นผิวหลัก) |
| 30px | `rounded-[30px]` | Hero banner, Upgrade card |
| 50px / full | `rounded-full` | Pill buttons, Icon boxes, Avatar, FAB |

### กฎ Component

**การ์ด (Cards)**
- ต้องใช้ `p-5` เป็น padding ภายในขั้นต่ำ
- ต้องใช้ `rounded-[20px]` เท่านั้น
- ต้องเป็น `w-full` ภายในคอลัมน์
- พื้นหลังขาว (สว่าง) / `navy.800` (มืด) เท่านั้น
- ห้ามมีเส้นขอบชัดเจน; ใช้เฉพาะความแตกต่างของพื้นหลังและเงา

**ปุ่ม (Buttons)**
- มาตรฐาน: `rounded-2xl`, shadow `45px 76px 113px 7px rgba(112,144,176,0.08)`
- Pill/action: `rounded-full` (radius 50px)
- Gradient/premium: `linear-gradient(135deg, #868CFF 0%, #4318FF 100%)`, `rounded-full`
- Focus และ Active state ต้องไม่แสดง outline หรือ box-shadow ring
- ห้ามใช้ underline, transforms, หรือการเปลี่ยนเส้นขอบเมื่อ hover

**Input**
- ทุก input ต้องใช้ `rounded-2xl` (16px), `border` 1px solid, `secondaryGray.100` (สว่าง) / `whiteAlpha.100` (มืด)
- Placeholder ต้องใช้ `secondaryGray.600` น้ำหนัก 400
- Label ต้องใช้ `font-bold` ที่ `text-sm`, offset `ms-[10px]`
- ความสูง Input: `h-[44px]` มาตรฐาน; `p-5` สำหรับตัวแปรใหญ่
- Search input ต้องใช้ `border-none` และรับ radius จาก container

**Badge**
- `rounded-[10px]`, `py-[7px] px-3`, `leading-none`
- Brand variant: `brand.500` fill, ข้อความขาว
- Outline variant: `rounded-2xl`

**Icon Boxes**
- ต้องเป็นวงกลมเสมอ (`rounded-full`)
- จัดกึ่งกลางไอคอนด้วย flexbox

**Navigation (Sidebar)**
- ความกว้างคงที่: 300px (desktop) / 285px (drawer/mobile)
- ตัวบอก Active: แถบด้านขวา `w-1 h-9 rounded-[5px]` สี `brand.500` (สว่าง) / `brand.400` (มืด)
- ไอคอน Active: `brand.500` (สว่าง) / white (มืด). ไอคอน Inactive: `secondaryGray.500`
- Label Active: `font-bold`, `gray.700` (สว่าง) / white (มืด)
- Label Inactive: `secondaryGray.600`
- ห้ามใช้พื้นหลัง fill หรือ pill สำหรับ Active nav — ใช้เฉพาะแถบบอกตัว

**Navigation (Top Navbar)**
- ต้องเป็น `position: fixed`, ลอยเหนือเนื้อหา
- ต้องใช้ Glassmorphism: `backdrop-blur-[20px]`, พื้นหลังกึ่งโปร่งใส, `rounded-2xl`, เส้นขอบโปร่งใส 1.5px
- ความสูงต่ำสุด: `min-h-[75px]`
- ชื่อหน้า: `text-[34px] font-bold`

**Progress Bars**
- Track และ Fill ต้องใช้ `rounded-[20px]`
- ความสูง Track: `h-2` (8px). พื้นหลัง Track: `blue.50` (สว่าง) / `whiteAlpha.50` (มืด)
- Fill: `brand.500` เสมอ

**Switches / Toggles**
- Thumb: `rounded-full`, `w-4 h-4`
- Track: `w-10 h-5 p-0.5`, `rounded-full`
- Focus state ต้องซ่อน box-shadow ทั้งหมด

**Tables**
- ตัวแปร: `simple`
- เส้นขอบแถว: `transparent` สำหรับ `td`, ตามโหมดสำหรับ `th` (`gray.200` สว่าง / `whiteAlpha.100` มืด)
- หัวข้อคอลัมน์: `text-xs`–`text-[12px]`, `gray.400`, ตัวพิมพ์ใหญ่
- ข้อมูลในเซลล์: `text-sm font-bold`, สีข้อความหลัก
- ห่อตารางใน Card ที่มี `px-0 overflow-x-scroll` (mobile) / `overflow-x-hidden` (desktop)

**Links**
- ห้ามแสดง underline ในทุกสถานะ
- ห้ามแสดง box-shadow หรือ outline เมื่อ focus

---

## 6. Motion & การโต้ตอบ

### Timing Tokens

| ระยะเวลา | Easing | ใช้กับ |
|---|---|---|
| `150ms` | `ease` | Micro interactions (icon hover, opacity) |
| `200ms` | `linear` | Layout width transitions, switch state |
| `250ms` | `ease` / `linear` | Component transitions มาตรฐาน (ปุ่ม, input, navbar) |
| `330ms` | `cubic-bezier(0.685, 0.0473, 0.346, 1)` | Sidebar open/close slide |

### กฎ Transition

- ปุ่มต้อง transition `all 250ms ease`
- Top navbar ต้อง transition `box-shadow`, `background-color`, `filter`, `border` ที่ `250ms linear`
- Main content panel ต้อง transition `top`, `bottom`, `width` ที่ `200ms linear` / `350ms ease`
- ห้าม animate `transform: scale` บนองค์ประกอบที่โต้ตอบได้
- ห้ามใช้ spring animations บน Layout-level panels
- Hover transitions ทั้งหมดต้องเสร็จภายใน `≤ 250ms`
- Motion ต้องมีประโยชน์เสมอ — ห้ามใช้เพื่อตกแต่ง

---

## 7. รูปแบบที่ห้ามใช้

- **ห้าม** ใช้ตัวอักษรอื่นนอกจาก DM Sans
- **ห้าม** ใช้น้ำหนักนอกเหนือจาก 400, 500, 700
- **ห้าม** ใช้ค่า pixel นอกเหนือจากช่วงระยะห่างที่กำหนด
- **ห้าม** ใช้ inline `style={{}}` กับองค์ประกอบใดๆ
- **ห้าม** ใช้ default shadcn/ui styles โดยไม่ override ตามระบบนี้
- **ห้าม** ใช้สีดำบริสุทธิ์ (`#000`) หรือขาวบริสุทธิ์ (`#fff`) เป็นสีข้อความ
- **ห้าม** เพิ่ม focus rings หรือ box-shadows ที่มองเห็นได้บนปุ่มหรือลิงก์
- **ห้าม** ใช้ underline บนลิงก์ในทุกสถานะ
- **ห้าม** ใช้พื้นหลัง fill หรือ pill เพื่อบอก Active nav — ใช้แถบด้านขวาเท่านั้น
- **ห้าม** ใช้ border-radius นอกเหนือจาก 7 ระดับที่กำหนด (5 / 8 / 10 / 16 / 20 / 30 / 50-full px)
- **ห้าม** วาง Gradient บนการ์ดหรือ input มาตรฐาน — Gradient สำหรับ Premium/CTA เท่านั้น
- **ห้าม** ใช้ทิศทาง Gradient อื่นนอกจาก `135deg`
- **ห้าม** เพิ่มความหนาเส้นขอบเพื่อสื่อถึงระดับความสูง — เส้นขอบต้องคงที่ที่ 1px
- **ห้าม** ผสม Token โหมดสว่างและมืดใน Component เดียวกันโดยไม่มี `dark:` prefix guards

---

## 8. ตรวจสอบก่อนเสร็จสิ้น

ก่อนส่งมอบ UI ที่สร้างด้วยระบบนี้ ให้ตรวจสอบ:

1. ✅ DM Sans เป็นตัวอักษรเดียว, น้ำหนัก 400, 500, 700 เท่านั้น?
2. ✅ ทุกพื้นผิวใช้ Token จากชุดสีที่กำหนด (ไม่มีค่า hex นอกลำดับ)?
3. ✅ ทุกค่า border-radius ตรงกับ 1 ใน 7 ระดับ?
4. ✅ Gradient ใช้เฉพาะ Premium CTA และ FAB เท่านั้น?
5. ✅ Active nav สื่อผ่านแถบด้านขวาเท่านั้น (ไม่มีพื้นหลัง)?
6. ✅ Navbar ใช้ Glassmorphism (backdrop-blur + พื้นหลังกึ่งโปร่งใส + floating rounded container)?
7. ✅ Focus/Active rings ของปุ่มถูกซ่อนหมด?
8. ✅ Layout ชดเชยเนื้อหาหลัก `calc(100% - 290px)` ที่ `xl`+?
9. ✅ สีความหมาย (success/error/warning) ใช้จาก Token `green`/`red`/`orange` เท่านั้น?
10. ✅ UI นี้มีเอกลักษณ์เป็นของตัวเอง ไม่ซ้ำซ้อนกับโปรเจกต์อื่น?
