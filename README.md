# 🍽️ iMenu — Next-Generation Restaurant & Digital QR Menu Platform

*Read documentation in Vietnamese: [Vietnamese README](README_vn.md)*

**iMenu** is a complete, full-featured **F&B All-in-One SaaS Platform** (Digital QR Table Menu, POS Terminal, Kitchen Display System KDS, Interactive Table Map, VietQR Settlement and Multi-Branch Management) built using **Turborepo** and **npm workspaces** following the architectural standards of `happyco-frontend-v2`.

Official Repository: [https://github.com/thong21112001/imenu-menudientu.git](https://github.com/thong21112001/imenu-menudientu.git)

---

## 📁 Repository Structure

```text
imenu-menudientu/
├── apps/
│   ├── imenu-admin/            # Admin Hub, POS, KDS, Table Map & Thermal Bill (Port 3003)
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
| **Merchant Admin & POS** | `@imenu/admin` | `http://localhost:3003` | Next.js 15, React 19, Tailwind v4 | Table Map, POS, Kitchen KDS, 80mm Thermal Bill, Reports |
| **SaaS Landing & Onboarding** | `@imenu/client-web` | `http://localhost:3004` | Next.js 15, React 19, Tailwind v4 | Marketing, Features, 3-Tier Pricing, Restaurant Setup Wizard |
| **Customer QR Menu** | `@imenu/customer-menu` | `http://localhost:3005` | Next.js 15, React 19, Tailwind v4, VietQR | QR Menu, Modifiers, Floating Cart, Order Tracker, VietQR |

---

## 💻 Quick Start

```bash
# Install dependencies
npm install

# Run all apps in development mode
npm run dev
```

---

## 👥 Staff Management & RBAC (Phase 3)

The platform provides an end-to-end staff and role-based access control system synchronized across Backend API and Admin Frontend:

1. **System Administrator (Super Admin)**:
   - Configured securely via `.env` (`SUPERADMIN_EMAIL`, `SUPERADMIN_PASSWORD`).
   - Integrated **Restaurant Switcher** in the top navigation bar (`AdminHeader`) to toggle between **"All Platform"** global overview and specific restaurant scopes.
   - Global view and onboarding assistance: Super Admin can view all restaurants and create staff for any tenant by passing target `restaurantId`.
2. **Sub-Branch Scoping & Multi-Branch Isolation**:
   - **Header & Branch Switcher**: Sub-branch accounts (even with `restaurant_admin` role) have their active branch locked to their assigned branch. The branch dropdown is replaced with a static branch badge labeled "Chi nhánh con".
   - **Sidebar & /branches Access**: The "Quản lý Chi nhánh" menu is automatically hidden for sub-branch users. Direct URL navigation to `/branches` presents a clear Access Denied notice.
   - **Independent Branch Settings & VietQR**: The settings link switches to "Cài đặt Chi nhánh", allowing each branch to configure its own independent hotline, operating hours, and dedicated VietQR receiving bank account.
3. **Staff Lifecycle & Security**:
   - Add, edit, lock/unlock (`PATCH /users/:id/toggle-status`), and soft-delete (`DELETE /users/:id`) within the caller's assigned branch.
   - Sub-branch accounts are blocked from mutating staff outside their branch or assigning administrative roles (`restaurant_admin`, `restaurant_manager`).
   - Cross-branch staff transfer (`POST /users/transfer`) is restricted to Main Branch (HQ) accounts.
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

## 📦 Build & Verification

```bash
# Build all workspaces
npm run build

# Run type checks
npm run typecheck
```

