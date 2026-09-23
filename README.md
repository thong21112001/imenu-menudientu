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
2. **Staff Lifecycle & Security**:
   - Add, edit, branch reassignment, and cross-branch employee transfer (`POST /users/transfer`).
   - Quick lock/unlock toggle (`PATCH /users/:id/toggle-status`), with self-lockout and Super Admin protection.
   - **Soft Delete** mechanism (`DELETE /users/:id`): preserves bill and order audit integrity while aliasing emails to release MongoDB unique constraints.
3. **Role-Based Access Control (RBAC) & Permission Matrix**:
   - 6 default system roles (`SYSTEM_ADMIN`, `RESTAURANT_ADMIN`, `RESTAURANT_MANAGER`, `CASHIER`, `KITCHEN`, `WAITER`).
   - Create custom roles (`POST /roles`) and fine-tune permission matrices across POS, Kitchen KDS, Menu, Reports, Staff, and Settings.
   - Protected against deletion of system roles or roles currently assigned to active employees.

---

## 📦 Build & Verification

```bash
# Build all workspaces
npm run build

# Run type checks
npm run typecheck
```

