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

## 👥 Quản Lý Nhân Sự & Phân Quyền (Phase 3: Staff & RBAC)

Hệ thống cung cấp giải pháp quản trị phân quyền nhân sự toàn diện tích hợp chặt chẽ giữa Backend API và Frontend Admin:

1. **Quản Trị Viên Hệ Thống (Super Admin)**:
   - Được định danh bảo mật thông qua cấu hình `.env` (`SUPERADMIN_EMAIL`, `SUPERADMIN_PASSWORD`).
   - Có bộ chọn nhà hàng (**Restaurant Switcher**) trên thanh điều hướng đầu trang (`AdminHeader`) để chuyển đổi nhanh giữa chế độ xem **"Toàn hệ thống"** hoặc từng nhà hàng cụ thể.
   - Toàn quyền xem, lọc và phụ tạo nhân viên cho bất kỳ nhà hàng/chi nhánh nào trong hệ thống (`restaurantId`).
2. **Phân Lập Nghiệp Vụ Chi Nhánh Con (Sub-branch Scoping)**:
   - **Thanh Header & Bộ chuyển Chi nhánh**: Tài khoản thuộc chi nhánh con (kể cả có vai trò `restaurant_admin`) được khóa chặt phạm vi tại chi nhánh của mình; ẩn dropdown đổi chi nhánh và hiển thị huy hiệu tĩnh kèm nhãn "Chi nhánh con".
   - **Thanh Bên (Sidebar) & Truy Cập /branches**: Tự động ẩn menu "Quản lý Chi nhánh" đối với chi nhánh con; truy cập trực tiếp URL `/branches` sẽ hiển thị màn hình từ chối quyền truy cập (Access Denied).
   - **Cài Đặt Chi Nhánh Độc Lập**: Menu "Cài đặt Nhà hàng" tự động đổi thành "Cài đặt Chi nhánh", cho phép mỗi chi nhánh con cấu hình số điện thoại hotline, giờ phục vụ và tài khoản ngân hàng nhận tiền VietQR riêng biệt.
3. **Quản Lý Nhân Viên & Khóa/Mở Khóa**:
   - Thêm mới, chỉnh sửa thông tin, khóa/mở khóa (`PATCH /users/:id/toggle-status`) và xóa mềm (`DELETE /users/:id`) trong phạm vi chi nhánh của mình.
   - Chặn chi nhánh con tạo/sửa/xóa nhân sự của chi nhánh khác hoặc gán các vai trò quản trị (`restaurant_admin`, `restaurant_manager`).
   - Quyền điều chuyển nhân sự giữa các chi nhánh (`POST /users/transfer`) dành riêng cho Trụ sở chính (HQ).
4. **Phân Quyền Vai Trò & Ma Trận Quyền Hạn (RBAC Matrix)**:
   - Hỗ trợ 6 vai trò mặc định hệ thống (`SYSTEM_ADMIN`, `RESTAURANT_ADMIN`, `RESTAURANT_MANAGER`, `CASHIER`, `KITCHEN`, `WAITER`). Vai trò mặc định hệ thống được bảo vệ tuyệt đối và chỉ có Super Admin mới có quyền cập nhật.
   - Trụ sở chính (HQ) có thể tạo và quản lý vai trò tùy chỉnh (`POST /roles`), thống kê nhân sự theo quy mô toàn chuỗi (`{userCount} nhân sự (toàn chuỗi) đang giữ vai trò này`).
   - Chi nhánh con không được phép tạo/sửa/xóa vai trò; giao diện Tab 2 RBAC hiển thị số lượng nhân sự thuộc phạm vi chi nhánh mình (`{userCount} nhân sự (tại chi nhánh này) đang giữ vai trò này`).
5. **Điều Hướng Thông Minh & Lọc Menu Theo Vai Trò (Smart Role Landing & Routing)**:
   - **Thu Ngân (`cashier`)**: Tự động chuyển hướng đến màn hình POS Bán hàng (`/pos`) ngay sau khi đăng nhập hoặc truy cập trang chủ `/`. Menu "Tổng quan" được ẩn khỏi Sidebar để tối ưu không gian làm việc chuyên trách. Khi truy cập các route quản trị như `/staff`, màn hình bảo vệ 403 hiển thị lý do và nút bấm "Quay về trang làm việc chính" đưa người dùng về lại `/pos`.
   - **Bếp KDS (`kitchen`)**: Tự động chuyển hướng đến màn hình Bếp (`/kitchen`), Sidebar chỉ hiển thị duy nhất chức năng KDS.
   - **Phục Vụ (`waiter`)**: Tự động chuyển hướng đến Sơ đồ Bàn (`/tables`), phục vụ gọi món tại bàn và theo dõi trạng thái bàn.
   - **Quản Lý (`restaurant_manager`)**: Đăng nhập vào Dashboard (`/`), quản lý toàn bộ vận hành, bàn, bếp, thực đơn và báo cáo doanh thu; bảo vệ chặn truy cập các trang nhạy cảm `/staff` và `/settings` (403 Forbidden).
   - **Chủ Quán (`restaurant_admin`)**: Toàn quyền truy cập mọi phân hệ bao gồm Quản lý nhân viên & Phân quyền ma trận (`/staff`) và Cài đặt Nhà hàng (`/settings`).

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
git commit -m "feat(phase-03): implement staff management, RBAC, and super admin platform switcher"
git branch -M main
git push -u origin main
```

