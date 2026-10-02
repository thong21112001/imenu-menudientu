# 🍽️ iMenu — Nền Tảng Quản Lý Nhà Hàng & Menu Điện Tử Thế Hệ Mới (Frontend Monorepo)

*Đọc tài liệu bằng tiếng Anh: [English README (Tài liệu Tiếng Anh)](README.md)*

Hệ thống mã nguồn **Frontend Monorepo** toàn diện cho nền tảng **iMenu** (F&B All-in-One SaaS: Gọi món QR tại bàn, POS Thu ngân, Màn hình Bếp KDS Real-time WebSocket, Sơ đồ Bàn trực quan, Thanh toán VietQR & Quản lý Chuỗi Đa Chi Nhánh), được xây dựng theo chuẩn kiến trúc **Turborepo** và **npm workspaces** đồng bộ với các tiêu chuẩn thiết kế hiện đại.

Kho mã nguồn chính thức: [https://github.com/thong21112001/imenu-menudientu.git](https://github.com/thong21112001/imenu-menudientu.git)

---

## 📁 Cấu Trúc Dự Án (Monorepo Repository Structure)

```text
imenu-menudientu/
├── apps/
│   ├── imenu-admin/            # Ứng dụng Quản trị, POS, KDS, Sơ đồ Bàn, In QR & Hóa Đơn (Port 3003)
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
| **Merchant Admin & POS** | `@imenu/admin` | `http://localhost:3003` | Next.js 15, React 19, Tailwind v4, Lucide | Quản trị Sơ đồ bàn, POS thu ngân, Màn hình Bếp KDS Real-time WebSocket, In hóa đơn nhiệt 80mm, In Standee/Sticker QR, Báo cáo |
| **SaaS Landing & Onboarding** | `@imenu/client-web` | `http://localhost:3004` | Next.js 15, React 19, Tailwind v4, Framer Motion | Landing Page giới thiệu tính năng, bảng giá 3 gói dịch vụ, đăng ký & onboarding nhà hàng |
| **Customer QR Menu** | `@imenu/customer-menu` | `http://localhost:3005` | Next.js 15, React 19, Tailwind v4, VietQR SDK | Gọi món QR tại bàn trên di động, tùy chọn Topping/Size, Giỏ hàng nổi, Theo dõi tiến độ bếp & VietQR |

---

## 🛠️ Yêu Cầu Môi Trường (Prerequisites)

- **Node.js**: `>= 20.x`
- **Package Manager**: `npm >= 10.x` (khuyến nghị npm 11.x)
- **Backend API**: `imenu-api` đang chạy tại `http://localhost:3001` (NestJS + MongoDB)
- **Turbo CLI**: Tự động quản lý qua `devDependencies`

---

## 💻 Hướng Dẫn Cài Đặt & Khởi Chạy (Getting Started)

### 1. Cài đặt Dependencies

Tại thư mục gốc `imenu-menudientu`:

```bash
npm install
```

### 2. Cấu hình Biến Môi Trường (Environment Variables)

Các file `.env.local` mẫu cho từng app nếu cần tùy chỉnh:

```env
# apps/imenu-admin/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NEXT_PUBLIC_CUSTOMER_MENU_URL=http://localhost:3005

# apps/imenu-customer-menu/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

### 3. Khởi chạy toàn bộ hệ sinh thái (Development Mode)

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

## 👥 Quản Lý Nhân Sự & Phân Quyền (Phase 3: Staff & RBAC)

Hệ thống cung cấp giải pháp quản trị phân quyền nhân sự toàn diện tích hợp chặt chẽ giữa Backend API và Frontend Admin:

1. **Quản Trị Viên Hệ Thống (Super Admin)**:
   - Được định danh bảo mật thông qua cấu hình `.env` (`SUPERADMIN_EMAIL`, `SUPERADMIN_PASSWORD`).
   - Có bộ chọn nhà hàng (**Restaurant Switcher**) trên thanh điều hướng đầu trang (`AdminHeader`) để chuyển đổi nhanh giữa chế độ xem **"Toàn hệ thống"** hoặc từng nhà hàng cụ thể.
   - Toàn quyền xem, lọc và tạo nhân viên cho bất kỳ nhà hàng/chi nhánh nào trong hệ thống (`restaurantId`).
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

## 🍜 Quản Lý Thực Đơn, Danh Mục & Topping (Phase 4: Menu & Options)

Hệ thống quản lý thực đơn được kết nối trực tiếp với Backend API (`imenu-api`) và đồng bộ thời gian thực:

1. **Quản Lý Danh Mục Món Ăn (Categories)**:
   - Thêm mới, chỉnh sửa icon emoji, tên danh mục, mã định danh (slug tự động sinh không dấu chuẩn SEO) và thứ tự hiển thị (`order`).
   - Ràng buộc an toàn: Chặn xóa danh mục khi vẫn còn món ăn đang thuộc danh mục đó để bảo vệ dữ liệu nhà hàng.
2. **Quản Lý Món Ăn & Nhóm Tùy Chọn / Topping (Menu Items & Option Groups)**:
   - Thêm mới và cập nhật món ăn với hình ảnh trực quan, giá bán, giá gốc khuyến mãi, mô tả và cờ món bán chạy (Best Seller).
   - Hỗ trợ xây dựng các nhóm tùy chọn (Option Groups) linh hoạt: Kích cỡ (Size), Mức đá, Lượng đường, Độ cay, Topping thêm... với cấu hình `required` (Bắt buộc chọn) và `multiple` (Chọn nhiều).
   - Mỗi giá trị lựa chọn hỗ trợ cấu hình giá phụ thu (`priceDelta`).
3. **Thao Tác Nhanh Trạng Thái Còn/Hết Món (Fast Availability Toggle)**:
   - Hỗ trợ Thu ngân (`cashier`) và Bếp (`kitchen`) bật/tắt nhanh trạng thái Còn món / Tạm hết món chỉ với một cú click (`PATCH /api/menu-items/:id/status`).
   - Cập nhật giao diện tức thì (Optimistic UI) và phát sự kiện BroadcastChannel (`MENU_AVAILABILITY_CHANGED`) đồng bộ ngay lập tức tới mã QR của khách và màn hình POS.
4. **Truy Cập Thực Đơn Công Khai Qua Mã QR (Public QR Menu)**:
   - Khách hàng tại bàn quét mã QR xem thực đơn và gọi món mà không cần đăng nhập (`@Public()` endpoints `/api/categories/public` và `/api/menu-items/public`).

---

## 🪑 Sơ Đồ Bàn Trực Quan, POS Thu Ngân, Màn Hình Bếp KDS Real-time & Mã QR (Phase 5)

Phase 5 hoàn thiện toàn bộ chuỗi vận hành nhà hàng số từ Bàn ăn ➔ Bếp KDS ➔ Thu ngân POS ➔ Khách quét QR:

### 1. Sơ Đồ Bàn Trực Quan & Quản Lý Khu Vực (`/tables`)
- **Lọc theo Khu Vực (Table Zones)**: Phân chia không gian sàn nhà hàng linh hoạt (Ví dụ: "Tầng 1 - Trong nhà", "Tầng 2 - Ngoài trời", "Phòng VIP").
- **Chỉ Báo Trạng Thái Bàn Trực Quan**:
  - 🟢 **Trống (Empty)**: Sẵn sàng đón khách mới.
  - 🔴 **Có khách (Occupied / Dining)**: Khách đang ngồi dùng bữa hoặc đang gọi món.
  - 🟡 **Chờ dọn (Cleaning)**: Khách đã thanh toán, chờ nhân viên dọn dẹp vệ sinh.
  - 🔵 **Đã đặt (Reserved)**: Bàn đã có khách đặt trước theo khung giờ.
- **Thao Tác Nghiệp Vụ Bàn & Hộp Thoại (Modals)**:
  - **Tạo Nhanh Mẫu (Quick Seed)**: 1 click tự động khởi tạo ngay 12 bàn mẫu phân bố đều trên 3 khu vực chuẩn, giúp nhà hàng mới vận hành tức thì.
  - **Chuyển Bàn (`/transfer`)**: Chuyển toàn bộ order của khách từ bàn này sang bàn khác khi khách đổi chỗ.
  - **Gộp Bàn (`/merge`)**: Ghép nhiều bàn thành một đoàn khách lớn, tổng hợp hóa đơn thanh toán chung.
  - **Cập Nhật Trạng Thái**: Modal chuyển đổi nhanh trạng thái bàn trực quan.

### 2. Phân Lập Dữ Liệu Bàn & Khu Vực Đa Chi Nhánh (Multi-Branch Isolation)
- **Ràng Buộc Duy Nhất Cấp Chi Nhánh (Compound Index)**:
  - Bàn và Khu vực được định danh và phân lập tuyệt đối theo `(restaurantId, branchId)`.
  - Các chi nhánh khác nhau có thể sử dụng cùng mã bàn (Ví dụ: Chi nhánh 1 và Chi nhánh 2 đều có các bàn `B01` đến `B12`) mà không bị xung đột dữ liệu nhờ index `{ restaurantId: 1, branchId: 1, code: 1, isDeleted: 1 }`.
- **Phân Quyền Nhân Sự Theo Chi Nhánh**:
  - **Nhân viên chi nhánh con**: Bị khóa phạm vi nghiêm ngặt, không thể xem, sửa, xóa, seed bàn hay chuyển/gộp bàn của chi nhánh khác.
  - **Trụ sở chính (HQ) & Super Admin**: Có thể chuyển đổi qua lại giữa các chi nhánh bằng dropdown trên Header. Danh sách bàn và tab khu vực tự động cập nhật ngay khi nhận sự kiện `imenu:branch_changed`.

### 3. Quản Lý Mã QR & Xưởng In Ấn (`/qr-codes`)
- **Cơ Chế Token Bảo Mật**:
  - Mỗi bàn sở hữu một mã token mật mã (`qrToken`) và trạng thái kích hoạt (`qrStatus: ACTIVE | INACTIVE`).
  - Nút Tạo Lại Token (`/regenerate-qr`) giúp thu hồi token cũ ngay lập tức nếu mã QR bị sao chép hoặc thất thoát ra ngoài.
- **Tạo URL Mã QR Định Danh Chi Nhánh**:
  - Định dạng URL: `http://localhost:3005/menu/:restaurantSlug/:tableCode?t=:token&branch=:branchId`.
  - Tham số `branch` đảm bảo khách quét QR luôn được điều hướng chính xác vào chi nhánh đang ngồi ăn.
- **Mẫu Thiết Kế In Ấn Chuyên Nghiệp**:
  - **Standee A6 (105 x 148 mm)**: Mẫu biển mica để bàn sang trọng gồm Logo nhà hàng, số bàn nổi bật, hướng dẫn quét món và thông tin Wi-Fi.
  - **Sticker Bàn (80 x 80 mm)**: Mẫu tem decal chống nước dán góc bàn nhỏ gọn.
  - **In Hàng Loạt (Bulk Print)**: Cho phép chọn in tất cả các bàn hoặc lọc theo khu vực, hỗ trợ xem trước khi in và kích hoạt in qua chuẩn CSS `@media print`.

### 4. Máy Bán Hàng Thu Ngân POS (`/pos`) & In Phiếu Thanh Toán 80mm (`/bills`)
- **Giao Diện Tạo Đơn Nhanh**:
  - Danh mục món trực quan, tìm kiếm theo tên, popup tùy chọn Topping, đá, đường, kích cỡ và ghi chú riêng.
  - Bộ chọn bàn ăn nhanh chóng.
  - Tính toán hóa đơn tự động: Tạm tính, Thuế VAT, Giảm giá/Voucher và Tổng thanh toán cuối cùng.
- **Tích Hợp Thanh Toán VietQR Động**:
  - Tự động sinh mã QR chuyển khoản ngân hàng Napas 247 đúng số tiền cần thanh toán và nội dung chuyển khoản là mã đơn hàng.
- **In Hóa Đơn Nhiệt 80mm Chuẩn ESC/POS**:
  - Giao diện mẫu bill in nhiệt 80mm chuẩn mực bao gồm thông tin chi nhánh, địa chỉ, thu ngân, bảng chi tiết từng món ăn và lời cảm ơn.

### 5. Màn Hình Bếp KDS Real-Time WebSocket (`/kitchen`)
- **Kết Nối WebSocket Trực Tiếp**:
  - Kết nối Gateway WebSocket NestJS (`OrderGateway`) tại `http://localhost:3001`.
  - Tự động gia nhập phòng riêng của chi nhánh: `joinBranch: { restaurantId, branchId }`.
- **Quy Trình Vé Bếp Chuẩn Hóa**:
  - `PENDING` (Chờ xử lý) ➔ `PREPARING` (Đang nấu) ➔ `READY` (Chờ phục vụ) ➔ `SERVED` (Đã xong).
  - Đồng hồ đếm thời gian thực từ lúc nhận đơn, đổi màu cảnh báo khi đơn bị trễ.
- **Âm Thanh Thông Báo (Chime Alert)**:
  - Tích hợp Web Audio API phát âm thanh chuông báo tinh tế mỗi khi có đơn gọi món mới từ mã QR của khách hoặc POS.
- **Đồng Bộ Khi Đổi Chi Nhánh**:
  - Lắng nghe sự kiện `imenu:branch_changed`, tự động rời phòng cũ và gia nhập phòng của chi nhánh mới, tải lại toàn bộ vé bếp của chi nhánh đó.

### 6. Ứng Dụng Gọi Món QR Dành Cho Khách (`apps/imenu-customer-menu`)
- **Đường Dẫn Bàn Trực Tiếp**:
  - Cấu trúc: `/menu/[restaurantSlug]/[tableCode]?t=[token]&branch=[branchId]`.
  - Tự động kiểm tra token bảo mật và hiển thị thực đơn theo đúng chi nhánh.
- **Trải Nghiệm Khách Hàng**:
  - Giao diện Mobile PWA mượt mà, cuộn danh mục mượt (sticky categories), tìm kiếm món.
  - Bottom sheet tùy chọn topping, size, mức đường đá và số lượng.
  - Giỏ hàng nổi hiển thị số lượng và tổng tiền tức thời.
  - Màn hình theo dõi tiến độ chuẩn bị món ăn theo thời gian thực từ Bếp.
  - Quét mã VietQR chuyển khoản thanh toán tiện lợi.

---

## 🧪 Kiểm Thử & Kiểm Tra Toàn Diện (Testing & Validation)

```bash
# Phía Backend API (imenu-api):
npm run test:phase5         # 18/18 test case Phase 5 PASS
npm run test:phase4         # 17/17 test case Phase 4 PASS
npm run test:phase3         # 16/16 test case Phase 3 PASS
npm run test:phase2:all     # 11/11 test case Phase 2 PASS
# Tổng số test case tự động Backend: 73/73 PASS

# Phía Frontend (imenu-menudientu):
npm run lint                # Kiểm tra ESLint
npm run typecheck           # Kiểm tra kiểu TypeScript (0 lỗi)
npm run build               # Build sản xuất Turborepo
```

---

## 📄 Giấy Phép & Bản Quyền (License)

Dự án thuộc quyền sở hữu của **Hệ Sinh Thái Nhà Hàng Số iMenu**. Nghiêm cấm sao chép trái phép.
