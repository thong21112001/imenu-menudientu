# 🍽️ iMenu — Nền Tảng Quản Lý Nhà Hàng & Menu Điện Tử Thế Hệ Mới

*Đọc tài liệu bằng tiếng Anh: [English README](README.md)*

Hệ thống mã nguồn **Frontend Monorepo** cho nền tảng **iMenu** (tham chiếu và nâng cấp từ `menudientu.com`), được xây dựng theo chuẩn kiến trúc **Turborepo** và **npm workspaces** (đồng bộ kiến trúc với `happyco-frontend-v2`).

Kho mã nguồn chính thức: [https://github.com/thong21112001/imenu-menudientu.git](https://github.com/thong21112001/imenu-menudientu.git)

---

## 📁 Cấu Trúc Dự Án (Monorepo Repository Structure)

```text
imenu-menudientu/
├── apps/
│   ├── imenu-admin/            # Ứng dụng Quản trị, POS, KDS, Sơ đồ Bàn, In Hóa Đơn (Port 3003)
│   ├── imenu-client-web/       # Landing Page Marketing, Bảng giá, Onboarding Nhà hàng (Port 3004)
│   └── imenu-customer-menu/    # Web App Gọi món QR tại bàn Mobile-First dành cho Khách (Port 3005)
│
├── packages/
│   ├── ui/                     # Shared UI Components & Design System (@imenu/ui)
│   ├── utils/                  # Shared Helpers, VietQR, Date, Currency & Storage (@imenu/utils)
│   ├── types/                  # Shared TypeScript Models & Interfaces (@imenu/types)
│   ├── typescript-config/      # Shared TypeScript Configs (@imenu/typescript-config)
│   └── eslint-config/          # Shared ESLint Configs (@imenu/eslint-config)
│
├── turbo.json                  # Cấu hình Turborepo Pipeline & Caching
└── package.json                # Root package.json quản lý workspaces
```

---

## 🚀 Danh Sách Ứng Dụng & Cổng Khởi Chạy (Apps & Ports)

| Ứng dụng | Package Name | Cổng mặc định | Công nghệ chính | Mục đích & Nghiệp vụ |
| :--- | :--- | :--- | :--- | :--- |
| **Merchant Admin & POS** | `@imenu/admin` | `http://localhost:3003` | Next.js 15, React 19, Tailwind v4, Lucide | Quản trị Sơ đồ bàn, POS thu ngân, Màn hình Bếp KDS Real-time, In hóa đơn nhiệt 80mm, Báo cáo |
| **SaaS Landing & Onboarding** | `@imenu/client-web` | `http://localhost:3004` | Next.js 15, React 19, Tailwind v4, Framer Motion | Landing Page giới thiệu tính năng, bảng giá 3 gói dịch vụ, đăng ký & onboarding nhà hàng |
| **Customer QR Menu** | `@imenu/customer-menu` | `http://localhost:3005` | Next.js 15, React 19, Tailwind v4, VietQR SDK | Gọi món QR tại bàn trên di động, tùy chọn Topping/Size, Giỏ hàng nổi, Theo dõi tiến độ bếp & VietQR |

---

## 🛠️ Yêu Cầu Môi Trường (Prerequisites)

- **Node.js**: `>= 20.x`
- **Package Manager**: `npm >= 10.x` (khuyến nghị npm 11.x)
- **Turbo CLI**: Tự động quản lý qua `devDependencies`

---

## 💻 Hướng Dẫn Cài Đặt & Khởi Chạy (Getting Started)

### 1. Cài đặt Dependencies

Tại thư mục gốc dự án:

```bash
npm install
```

### 2. Khởi chạy toàn bộ hệ sinh thái (Development Mode)

Chạy tất cả 3 ứng dụng cùng lúc với Turbo:

```bash
npm run dev
```

Hoặc khởi chạy từng ứng dụng độc lập:

```bash
# 1. Khởi chạy Merchant Admin & POS (Port 3003)
npm run dev:admin

# 2. Khởi chạy Landing Page & Onboarding (Port 3004)
npm run dev:client

# 3. Khởi chạy Customer QR Menu (Port 3005)
npm run dev:menu
```

---

## ⚡ Cơ Chế Mô Phỏng Real-time Đa Tab (BroadcastChannel Simulation)

Dự án tích hợp sẵn **Mock Storage Engine** và **Realtime Hub (BroadcastChannel API)** cho phép mô phỏng 100% nghiệp vụ thời gian thực giữa Khách - Bếp - Thu ngân mà không phụ thuộc backend:

1. **Khách hàng** mở `http://localhost:3005/menu/bep-nha/ban-08` và bấm "Gửi gọi món".
2. **Màn hình Bếp (KDS)** tại `http://localhost:3003/kitchen` lập tức phát chuông báo (Web Audio API) và hiển thị vé order mới.
3. **Sơ đồ Bàn POS** tại `http://localhost:3003/tables` tự động chuyển bàn 08 sang màu Vàng (Đang dùng).
4. **Bếp bấm "Xong món"**, giao diện khách hàng cập nhật tiến độ "✓ Món sẵn sàng".
5. **Khách bấm "Quét VietQR"**, thu ngân mở màn hình hóa đơn `http://localhost:3003/bills` bấm in phiếu 80mm và xác nhận thanh toán.

---

## 📦 Build & Kiểm Tra Chất Lượng Mã (Build & Quality)

```bash
# Build toàn bộ monorepo (tự động cache với Turbo)
npm run build

# Kiểm tra cú pháp và quy chuẩn mã
npm run lint

# Kiểm tra chặt chẽ Type Safety
npm run typecheck
```

---

## 🌿 Đẩy Mã Nguồn Lên GitHub (Git Workflow)

```bash
git add .
git commit -m "feat: complete initial iMenu monorepo architecture with client, admin and customer menu"
git branch -M main
git push -u origin main
```
