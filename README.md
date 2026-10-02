# 🍽️ iMenu — Next-Generation Restaurant & Digital QR Menu Platform (Frontend Monorepo)

*Read documentation in Vietnamese: [Vietnamese README (Tài liệu Tiếng Việt)](README_vn.md)*

**iMenu** is a complete, enterprise-grade **F&B All-in-One SaaS Platform** (Digital QR Table Menu, POS Terminal, Kitchen Display System KDS with Real-time WebSockets, Interactive Table Map, VietQR Settlement, and Multi-Branch Management) built using **Turborepo** and **npm workspaces** following production design system standards.

Official Repository: [https://github.com/thong21112001/imenu-menudientu.git](https://github.com/thong21112001/imenu-menudientu.git)

---

## 📁 Repository Structure

```text
imenu-menudientu/
├── apps/
│   ├── imenu-admin/            # Admin Hub, POS, KDS, Table Map, QR Generator & Bills (Port 3003)
│   ├── imenu-client-web/       # SaaS Marketing Landing Page, Pricing, Onboarding (Port 3004)
│   └── imenu-customer-menu/    # Mobile-First Customer QR Table Ordering PWA (Port 3005)
│
├── packages/
│   ├── ui/                     # Shared Design System & UI Components (@imenu/ui)
│   ├── utils/                  # Shared Helpers, VietQR, Date, Currency & Storage (@imenu/utils)
│   ├── types/                  # Shared TypeScript Models & Interfaces (@imenu/types)
│   ├── typescript-config/      # Shared TypeScript Configs (@imenu/typescript-config)
│   └── eslint-config/          # Shared ESLint Configs (@imenu/eslint-config)
│
├── turbo.json                  # Turborepo Build Pipeline & Caching
└── package.json                # Root package.json (npm workspaces)
```

---

## 🚀 Applications & Ports

| App | Package Name | Default Port | Tech Stack | Features |
| :--- | :--- | :--- | :--- | :--- |
| **Merchant Admin & POS** | `@imenu/admin` | `http://localhost:3003` | Next.js 15, React 19, Tailwind v4, Lucide | Table Map, POS, Kitchen KDS, 80mm Thermal Bill, Standee/Sticker QR Generator, Reports |
| **SaaS Landing & Onboarding** | `@imenu/client-web` | `http://localhost:3004` | Next.js 15, React 19, Tailwind v4, Framer Motion | Marketing, 3-Tier Pricing, Restaurant Setup Wizard, Onboarding Flow |
| **Customer QR Menu** | `@imenu/customer-menu` | `http://localhost:3005` | Next.js 15, React 19, Tailwind v4, VietQR | QR Menu, Modifiers/Toppings, Floating Cart, Order Tracker, VietQR Checkout |

---

## 🛠️ Prerequisites

- **Node.js**: `>= 20.x`
- **Package Manager**: `npm >= 10.x` (npm 11.x recommended)
- **Backend API**: `imenu-api` running on `http://localhost:3001` (NestJS + MongoDB)
- **Turbo CLI**: Managed automatically via workspace `devDependencies`

---

## 💻 Quick Start & Environment Setup

### 1. Install Dependencies

In the root of `imenu-menudientu`:

```bash
npm install
```

### 2. Environment Variables Configuration

Copy `.env.example` to `.env` in the required app folders if needed:

```env
# apps/imenu-admin/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NEXT_PUBLIC_CUSTOMER_MENU_URL=http://localhost:3005

# apps/imenu-customer-menu/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

### 3. Run Development Servers

Run all 3 applications concurrently via Turborepo:

```bash
npm run dev
```

Or run applications individually:

```bash
# Merchant Admin Hub & POS (Port 3003)
npm run dev:admin

# SaaS Landing Page & Onboarding (Port 3004)
npm run dev:client

# Customer QR Menu Mobile PWA (Port 3005)
npm run dev:menu
```

---

## 👥 Staff Management & Role-Based Access Control (Phase 3)

The platform delivers an end-to-end staff management and granular RBAC system synchronized between Backend API and Admin Frontend:

1. **System Administrator (Super Admin)**:
   - Configured securely via environment credentials.
   - Built-in **Restaurant Switcher** in the top navigation bar (`AdminHeader`) allowing seamless toggle between **"All Platform"** global overview and specific restaurant scopes.
   - Global multi-tenant access: Super Admin can inspect any restaurant and manage staff for any tenant by specifying target `restaurantId`.
2. **Sub-Branch Scoping & Multi-Branch Isolation**:
   - **Header & Branch Switcher**: Sub-branch accounts (even with `restaurant_admin` role) have their active branch locked to their assigned branch. The branch dropdown is replaced with a static branch badge labeled "Chi nhánh con".
   - **Sidebar & /branches Access**: The "Quản lý Chi nhánh" menu is automatically hidden for sub-branch users. Direct URL navigation to `/branches` presents a clear Access Denied notice.
   - **Independent Branch Settings & VietQR**: The settings link switches to "Cài đặt Chi nhánh", allowing each branch to configure its own independent hotline, operating hours, and dedicated VietQR receiving bank account.
3. **Staff Lifecycle & Security Controls**:
   - Add, edit, lock/unlock (`PATCH /users/:id/toggle-status`), and soft-delete (`DELETE /users/:id`) within the caller's assigned branch.
   - Sub-branch accounts are blocked from mutating staff outside their branch or assigning administrative roles (`restaurant_admin`, `restaurant_manager`).
   - Cross-branch staff transfer (`POST /users/transfer`) is restricted strictly to Main Branch (HQ) accounts.
4. **Role-Based Access Control (RBAC) & Permission Matrix**:
   - 6 default system roles (`SYSTEM_ADMIN`, `RESTAURANT_ADMIN`, `RESTAURANT_MANAGER`, `CASHIER`, `KITCHEN`, `WAITER`). System roles are protected and only editable by Super Admin.
   - Main Branch (HQ) accounts can create and manage custom roles (`POST /roles`), viewing chain-wide staff counts (`{userCount} nhân sự (toàn chuỗi) đang giữ vai trò này`).
   - Sub-branch accounts cannot create, edit, or delete roles, and role card counters reflect staff counts strictly within their own branch (`{userCount} nhân sự (tại chi nhánh này) đang giữ vai trò này`).
5. **Smart Landing & Role-Based Navigation Routing**:
   - **Cashier (`cashier`)**: Automatically redirected to POS terminal (`/pos`) on login or visiting `/`. The executive Dashboard overview is cleanly hidden from the sidebar. Accessing protected admin routes like `/staff` displays a 403 Forbidden screen with a one-click button returning to `/pos`.
   - **Kitchen (`kitchen`)**: Automatically redirected to the Kitchen KDS screen (`/kitchen`).
   - **Waitstaff (`waiter`)**: Automatically redirected to the Table Map (`/tables`).
   - **Manager (`restaurant_manager`)**: Lands on Dashboard (`/`); operations, POS, KDS, Menu and Reports are available while `/staff` and `/settings` are protected.
   - **Restaurant Owner (`restaurant_admin`)**: Lands on Dashboard (`/`) with full access to all modules including Staff & RBAC (`/staff`) and Restaurant Settings (`/settings`).

---

## 🍜 Menu Management & Dynamic Option Groups (Phase 4)

Complete menu administration integrated directly with the backend REST API:

1. **Category Management (`/categories`)**:
   - Create, edit, reorder categories with emoji icons and automated SEO slugification.
   - Safe delete constraint: prevents accidental deletion of categories when dishes are still assigned to them.
2. **Dishes & Dynamic Option Groups (Toppings)**:
   - Full dish catalog with visual previews, prices, promo prices, descriptions, and Best Seller badges.
   - Nested option groups builder: allows defining multiple groups per dish (e.g., Size, Sweetness, Ice, Toppings) with `required` and `multiple` configurations and item-level price deltas (`priceDelta`).
3. **Instant Stock Availability Toggle (Còn/Hết Món)**:
   - Cashiers and kitchen staff can flip dish availability with one click (`PATCH /api/menu-items/:id/status`).
   - Optimistic UI state with instant `BroadcastChannel` real-time notification (`MENU_AVAILABILITY_CHANGED`) synced across customer QR menus and POS stations.
4. **Public QR Menu Access**:
   - Contactless customer ordering without authentication barriers via `@Public()` endpoints (`/api/categories/public` and `/api/menu-items/public`).

---

## 🪑 Interactive Table Map, POS Terminal, Kitchen KDS & QR Codes (Phase 5)

Phase 5 introduces complete operational automation for restaurant floors, cashier counters, and kitchen lines:

### 1. Interactive Table Map & Zone Management (`/tables`)
- **Zone Filtering**: Organize floor space into logical zones (e.g., "Tầng 1 - Trong nhà", "Tầng 2 - Ngoài trời", "Phòng VIP").
- **Live Visual Status Indicators**:
  - 🟢 **Trống (Empty)**: Ready for guest seating.
  - 🔴 **Có khách (Occupied / Dining)**: Active guest party ordering or dining.
  - 🟡 **Chờ dọn (Cleaning)**: Guests finished; pending waitstaff cleanup.
  - 🔵 **Đã đặt (Reserved)**: Pre-booked reservation.
- **Table Operations & Modals**:
  - **Quick Seed**: One-click generation of 12 default tables across 3 standard zones for rapid onboarding.
  - **Table Transfer (`/transfer`)**: Move guest orders seamlessly from one table to another.
  - **Table Merge (`/merge`)**: Combine multiple tables into a single dining party with consolidated billing.
  - **Status Transitions**: Real-time modal to mark tables as occupied, cleaning, or free.

### 2. Multi-Branch Table & Zone Data Isolation
- **Compound Uniqueness Scoping**:
  - Tables and Zones are strictly isolated by `(restaurantId, branchId)`.
  - Different branches can have identical table codes (e.g., Branch 1 and Branch 2 both have tables `B01` through `B12`) without database collision.
- **Staff Access Control**:
  - **Sub-Branch Staff**: Locked to their own branch. They cannot view, edit, delete, seed, or transfer tables across different branches.
  - **HQ & Super Admin**: Can view and switch between branches using the header dropdown. The table grid and zone tabs instantly reload via the `imenu:branch_changed` event.

### 3. QR Code Management & Print Studio (`/qr-codes`)
- **Secure Token Architecture**:
  - Each table possesses an auto-generated unique cryptographic token (`qrToken`) and active status (`qrStatus: ACTIVE | INACTIVE`).
  - Regenerate Token button (`/regenerate-qr`) instantly invalidates old printed codes if compromised.
- **Branch-Aware QR URL Generation**:
  - URL schema: `http://localhost:3005/menu/:restaurantSlug/:tableCode?t=:token&branch=:branchId`.
  - Ensures customer scans are strictly tied to the correct branch dining room.
- **Printable Marketing Formats**:
  - **Standee A6 (105 x 148 mm)**: Elegant acrylic table standee with restaurant logo, table badge, instructions ("Quét mã để gọi món"), and Wi-Fi credentials.
  - **Table Sticker (80 x 80 mm)**: Compact waterproof sticker for corner placement.
  - **Bulk Printing**: Select all or specific zones to print in batches with browser print styles (`@media print`).

### 4. POS Cashier Terminal (`/pos`) & Thermal Bill Printing (`/bills`)
- **Visual Order Builder**:
  - Interactive dish grid with search, category filtering, and modifier selection modal (Size, Toppings, Notes).
  - Quick table assignment selector.
  - Dynamic bill calculation: Subtotal, VAT tax, custom voucher/discount, and Grand Total.
- **VietQR Payment Integration**:
  - Dynamically renders bank transfer QR codes containing exact transaction amount and order reference code using Napas 247 specifications.
- **80mm Thermal Bill Printing**:
  - ESC/POS standardized 80mm thermal receipt layout with restaurant header, branch address, cashier name, itemized bill, and thank-you footer.

### 5. Real-Time Kitchen Display System (KDS) (`/kitchen`)
- **WebSocket Gateway Connection**:
  - Connects to NestJS WebSocket gateway (`OrderGateway`) on `http://localhost:3001`.
  - Automatically joins dedicated room for the active branch: `joinBranch: { restaurantId, branchId }`.
- **Live Ticket Workflow**:
  - `PENDING` (Chờ xử lý) ➔ `PREPARING` (Đang nấu) ➔ `READY` (Chờ cung ứng) ➔ `SERVED` (Đã phục vụ).
  - Visual time elapsed counters with color alerts for long-pending orders.
- **Acoustic Notification**:
  - Integrated Web Audio API chime alerts kitchen staff whenever a new order ticket arrives from customer QR or POS.
- **Branch Switch Awareness**:
  - Listens for `imenu:branch_changed` events, immediately rejoining the new branch room and fetching updated tickets.

### 6. Mobile-First Customer QR Ordering PWA (`apps/imenu-customer-menu`)
- **Direct Table Menu Route**:
  - Route: `/menu/[restaurantSlug]/[tableCode]?t=[token]&branch=[branchId]`.
  - Verifies QR token security and loads branch-specific menu items and pricing.
- **Customer Experience**:
  - Fluid mobile UX with sticky category tabs, dish search, and modifier selection bottom sheet.
  - Floating cart badge with real-time item count and total price.
  - Live order tracking screen showing real-time kitchen preparation status.
  - One-click VietQR payment modal.

---

## 🧪 Testing & Validation

```bash
# In imenu-api (Backend):
npm run test:phase5         # 18/18 Phase 5 tests PASS
npm run test:phase4         # 17/17 Phase 4 tests PASS
npm run test:phase3         # 16/16 Phase 3 tests PASS
npm run test:phase2:all     # 11/11 Phase 2 tests PASS
# Total automated backend tests: 73/73 PASS

# In imenu-menudientu (Frontend):
npm run lint                # ESLint check
npm run typecheck           # TypeScript compiler check (0 errors)
npm run build               # Turborepo production build
```

---

## 📄 License & Attribution

Internal proprietary software developed for **iMenu Digital Restaurant Ecosystem**. All rights reserved.
