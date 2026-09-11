import { Restaurant, Table, MenuCategory, MenuItem, Order, User, RoleDefinition, PermissionGroup } from '@imenu/types';

const STORAGE_KEYS = {
  RESTAURANT: 'imenu_restaurant_v1',
  TABLES: 'imenu_tables_v1',
  CATEGORIES: 'imenu_categories_v1',
  MENU_ITEMS: 'imenu_menu_items_v1',
  ORDERS: 'imenu_orders_v1',
  USERS: 'imenu_users_v1',
  ROLES: 'imenu_roles_v1',
  CURRENT_USER: 'imenu_current_user_v1',
};

// ================= SEED DATA =================
export const SEED_RESTAURANT: Restaurant = {
  id: 'rest-bep-nha',
  name: 'Bếp Nhà - Ẩm Thực Việt',
  slug: 'bep-nha',
  phone: '0908 123 456',
  address: 'Số 68 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
  tagline: 'Hương vị truyền thống, phục vụ hiện đại',
  openingHours: '08:00 - 22:30 hàng ngày',
  isOpen: true,
  plan: 'Advanced',
  bankAccount: {
    bankId: 'MB',
    bankName: 'MBBank',
    accountNo: '0908123456',
    accountName: 'BEP NHA RESTAURANT',
  },
  branches: [
    { id: 'branch-1', name: 'Chi nhánh Quận 1 (Chính)', address: '68 Nguyễn Huệ, Q.1', phone: '0908 123 456', isMainBranch: true },
    { id: 'branch-2', name: 'Chi nhánh Quận 3', address: '124 Nam Kỳ Khởi Nghĩa, Q.3', phone: '0908 654 321' },
  ],
  createdAt: new Date().toISOString(),
};

export const SEED_CATEGORIES: MenuCategory[] = [
  { id: 'cat-main', name: 'Món Chính Đặc Sắc', slug: 'mon-chinh', icon: '🍲', order: 1, itemsCount: 6 },
  { id: 'cat-appetizer', name: 'Khai Vị & Ăn Kèm', slug: 'khai-vi', icon: '🥗', order: 2, itemsCount: 4 },
  { id: 'cat-drink', name: 'Đồ Uống & Trà Sữa', slug: 'do-uong', icon: '🧋', order: 3, itemsCount: 4 },
  { id: 'cat-dessert', name: 'Tráng Miệng', slug: 'trang-mieng', icon: '🍨', order: 4, itemsCount: 2 },
];

export const SEED_MENU_ITEMS: MenuItem[] = [
  {
    id: 'dish-pho-bo',
    categoryId: 'cat-main',
    name: 'Phở Bò Tái Nạm Đặc Biệt',
    slug: 'pho-bo-tai-nam',
    description: 'Nước dùng hầm xương ống 12 giờ chuẩn vị Hà Nội xưa, thịt bò tái mềm ngọt và nạm giòn thơm.',
    price: 69000,
    originalPrice: 79000,
    imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    isPopular: true,
    options: [
      {
        id: 'opt-size',
        name: 'Kích cỡ tô',
        required: true,
        multiple: false,
        values: [
          { id: 'val-reg', name: 'Tô vừa', priceDelta: 0 },
          { id: 'val-big', name: 'Tô lớn (+20k)', priceDelta: 20000 },
          { id: 'val-spec', name: 'Tô đặc biệt (+35k)', priceDelta: 35000 },
        ]
      },
      {
        id: 'opt-topping',
        name: 'Thêm món',
        required: false,
        multiple: true,
        values: [
          { id: 'val-egg', name: 'Trứng chần', priceDelta: 10000 },
          { id: 'val-quav', name: 'Quẩy giòn (3 cái)', priceDelta: 10000 },
          { id: 'val-meat', name: 'Thịt bò thêm', priceDelta: 25000 },
        ]
      }
    ]
  },
  {
    id: 'dish-bun-bo-hue',
    categoryId: 'cat-main',
    name: 'Bún Bò Huế Cố Đô',
    slug: 'bun-bo-hue',
    description: 'Sợi bún to, nước dùng cay nồng mùi sả mắm ruốc, bắp bò hoa, chả cua và giò heo.',
    price: 65000,
    imageUrl: 'https://images.unsplash.com/photo-1594041680534-e8c8cdebd659?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    isPopular: true,
    options: [
      {
        id: 'opt-spicy',
        name: 'Mức cay',
        required: true,
        multiple: false,
        values: [
          { id: 'val-sp-1', name: 'Không cay', priceDelta: 0 },
          { id: 'val-sp-2', name: 'Cay vừa (Chuẩn)', priceDelta: 0 },
          { id: 'val-sp-3', name: 'Cay nhiều', priceDelta: 0 },
        ]
      }
    ]
  },
  {
    id: 'dish-com-tam',
    categoryId: 'cat-main',
    name: 'Cơm Tấm Sườn Bì Chả Trứng',
    slug: 'com-tam-suon-bi-cha',
    description: 'Sườn cốt lết nướng than hoa mật ong vàng óng, bì dai giòn, chả trứng hấp béo ngậy.',
    price: 68000,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    isPopular: true,
  },
  {
    id: 'dish-bun-cha',
    categoryId: 'cat-main',
    name: 'Bún Chả Hà Nội Nướng Than',
    slug: 'bun-cha-ha-noi',
    description: 'Chả miếng nướng xém cạnh, chả viên mềm mọng đậm đà trong bát nước chấm đu đủ cà rốt giòn rụm.',
    price: 65000,
    imageUrl: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
  },
  {
    id: 'dish-mi-quang',
    categoryId: 'cat-main',
    name: 'Mì Quảng Tôm Thịt Trứng Cút',
    slug: 'mi-quang-tom-thit',
    description: 'Mì vàng nghệ, nước nhưn tôm thịt sánh mịn ăn kèm bánh tráng mè nướng và đậu phộng rang giòn.',
    price: 59000,
    imageUrl: 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
  },
  {
    id: 'dish-banh-xeo',
    categoryId: 'cat-main',
    name: 'Bánh Xèo Miền Tây Giòn Rụm',
    slug: 'banh-xeo-mien-tay',
    description: 'Vỏ bánh giòn rụm thơm nước cốt dừa, nhân tôm sông, thịt ba chỉ, giá đỗ và rau rừng tươi sạch.',
    price: 75000,
    imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    isNew: true,
  },
  {
    id: 'dish-goi-cuon',
    categoryId: 'cat-appetizer',
    name: 'Gỏi Cuốn Tôm Thịt (4 Cuốn)',
    slug: 'goi-cuon-tom-thit',
    description: 'Tôm tươi ngọt thịt, thịt ba rọi mỏng mềm, bún và rau thơm cuốn bánh tráng, chấm tương đậu phộng béo bùi.',
    price: 49000,
    imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    isPopular: true,
  },
  {
    id: 'dish-nem-ran',
    categoryId: 'cat-appetizer',
    name: 'Nem Rán Hà Nội / Chả Giò',
    slug: 'nem-ran-ha-noi',
    description: 'Vỏ ram giòn tan, nhân thịt nạc vai, mộc nhĩ nấm hương, miến dong và trứng gà.',
    price: 55000,
    imageUrl: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
  },
  {
    id: 'dish-goi-ngo-sen',
    categoryId: 'cat-appetizer',
    name: 'Gỏi Ngó Sen Tôm Thịt',
    slug: 'goi-ngo-sen-tom-thit',
    description: 'Ngó sen giòn trắng chua ngọt hài hòa, tôm sú luộc mọng nước, rau răm và đậu phộng rang giòn.',
    price: 69000,
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
  },
  {
    id: 'dish-canh-ga-chien-nuoc-mam',
    categoryId: 'cat-appetizer',
    name: 'Cánh Gà Chiên Nước Mắm Tỏi Ớt',
    slug: 'canh-ga-chien-nuoc-mam',
    description: 'Cánh gà da giòn rụm ngấm sốt nước mắm Phú Quốc sánh vàng óng ánh thơm lừng.',
    price: 79000,
    imageUrl: 'https://images.unsplash.com/photo-1527477378370-52a16d3f2c9c?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
  },
  {
    id: 'dish-tra-dao-cam-sa',
    categoryId: 'cat-drink',
    name: 'Trà Đào Cam Sả Tươi',
    slug: 'tra-dao-cam-sa',
    description: 'Hương trà đen thanh khiết quyện cùng vị ngọt thanh của đào miếng giòn và hương cam sả thơm mát sảng khoái.',
    price: 39000,
    imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    isPopular: true,
    options: [
      {
        id: 'opt-sweet',
        name: 'Độ ngọt',
        required: true,
        multiple: false,
        values: [
          { id: 'sw-100', name: '100% đường (Bình thường)', priceDelta: 0 },
          { id: 'sw-70', name: '70% đường', priceDelta: 0 },
          { id: 'sw-50', name: '50% đường', priceDelta: 0 },
        ]
      },
      {
        id: 'opt-ice',
        name: 'Lượng đá',
        required: true,
        multiple: false,
        values: [
          { id: 'ice-100', name: '100% đá', priceDelta: 0 },
          { id: 'ice-50', name: '50% đá', priceDelta: 0 },
          { id: 'ice-0', name: 'Không đá', priceDelta: 0 },
        ]
      }
    ]
  },
  {
    id: 'dish-ca-phe-sua-da',
    categoryId: 'cat-drink',
    name: 'Cà Phê Sữa Đá Sài Gòn',
    slug: 'ca-phe-sua-da',
    description: 'Hạt Robusta Buôn Ma Thuột pha phin đậm đặc, sữa đặc béo ngậy chuẩn gu truyền thống.',
    price: 29000,
    imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    isPopular: true,
  },
  {
    id: 'dish-tra-sua-o-long',
    categoryId: 'cat-drink',
    name: 'Trà Sữa Ô Long Nướng Trân Châu',
    slug: 'tra-sua-o-long-nuong',
    description: 'Trà Ô Long sấy than đượm vị khói thơm lừng, trân châu hoàng kim dẻo mềm nấu đường đen.',
    price: 45000,
    imageUrl: 'https://images.unsplash.com/photo-1558857563-b37cf5c3ebfa?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
  },
  {
    id: 'dish-nuoc-ep-dua-hau',
    categoryId: 'cat-drink',
    name: 'Nước Ép Dưa Hấu Tươi 100%',
    slug: 'nuoc-ep-dua-hau',
    description: 'Dưa hấu tươi mát ép nguyên chất, không thêm đường, giải nhiệt tức thì.',
    price: 35000,
    imageUrl: 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
  },
  {
    id: 'dish-che-buoi',
    categoryId: 'cat-dessert',
    name: 'Chè Bưởi An Giang Béo Ngậy',
    slug: 'che-buoi-an-giang',
    description: 'Cùi bưởi giòn sần sật không hề đắng, đậu xanh ninh nhừ sánh đặc nước cốt dừa béo thơm.',
    price: 32000,
    imageUrl: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    isPopular: true,
  },
  {
    id: 'dish-flan-caramel',
    categoryId: 'cat-dessert',
    name: 'Bánh Flan Trứng Sữa Cà Phê Đá',
    slug: 'banh-flan-trung-sua',
    description: 'Bánh flan mềm mịn núng nính tan trong miệng ăn cùng cà phê espresso đắng nhẹ và đá bào mát lạnh.',
    price: 25000,
    imageUrl: 'https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
  },
];

export const SEED_TABLES: Table[] = [
  { id: 'tbl-01', code: 'ban-01', name: 'Bàn 01', zoneId: 'zone-1', zoneName: 'Tầng 1', capacity: 4, status: 'Available' },
  { id: 'tbl-02', code: 'ban-02', name: 'Bàn 02', zoneId: 'zone-1', zoneName: 'Tầng 1', capacity: 2, status: 'Occupied', totalGuests: 2, activeSince: new Date(Date.now() - 25 * 60000).toISOString() },
  { id: 'tbl-03', code: 'ban-03', name: 'Bàn 03', zoneId: 'zone-1', zoneName: 'Tầng 1', capacity: 4, status: 'Available' },
  { id: 'tbl-04', code: 'ban-04', name: 'Bàn 04', zoneId: 'zone-1', zoneName: 'Tầng 1', capacity: 6, status: 'PaymentRequested', totalGuests: 5, activeSince: new Date(Date.now() - 45 * 60000).toISOString() },
  { id: 'tbl-05', code: 'ban-05', name: 'Bàn 05', zoneId: 'zone-1', zoneName: 'Tầng 1', capacity: 4, status: 'Available' },
  { id: 'tbl-06', code: 'ban-06', name: 'Bàn 06', zoneId: 'zone-1', zoneName: 'Tầng 1', capacity: 2, status: 'Reserved' },
  { id: 'tbl-07', code: 'ban-07', name: 'Bàn 07', zoneId: 'zone-2', zoneName: 'Tầng 2 (Máy Lạnh)', capacity: 4, status: 'Available' },
  { id: 'tbl-08', code: 'ban-08', name: 'Bàn 08', zoneId: 'zone-2', zoneName: 'Tầng 2 (Máy Lạnh)', capacity: 4, status: 'Occupied', totalGuests: 3, activeSince: new Date(Date.now() - 15 * 60000).toISOString() },
  { id: 'tbl-09', code: 'ban-09', name: 'Bàn 09', zoneId: 'zone-2', zoneName: 'Tầng 2 (Máy Lạnh)', capacity: 8, status: 'Available' },
  { id: 'tbl-10', code: 'ban-10', name: 'Bàn 10', zoneId: 'zone-3', zoneName: 'Sân Vườn Ngoài Trời', capacity: 4, status: 'Available' },
  { id: 'tbl-11', code: 'ban-11', name: 'Bàn 11', zoneId: 'zone-3', zoneName: 'Sân Vườn Ngoài Trời', capacity: 6, status: 'Available' },
  { id: 'tbl-12', code: 'ban-12', name: 'Bàn VIP 01', zoneId: 'zone-vip', zoneName: 'Phòng VIP', capacity: 12, status: 'Available' },
];

export const SEED_ORDERS: Order[] = [
  {
    id: 'ord-101',
    orderCode: 'IM-260902-001',
    tableId: 'tbl-08',
    tableName: 'Bàn 08',
    restaurantId: 'rest-bep-nha',
    items: [
      {
        id: 'item-1',
        menuItemId: 'dish-pho-bo',
        name: 'Phở Bò Tái Nạm Đặc Biệt',
        price: 69000,
        quantity: 2,
        itemTotal: 138000,
        status: 'Cooking',
        note: 'Ít hành lá, thêm ớt tươi',
        selectedOptions: [{ groupId: 'opt-size', groupName: 'Kích cỡ', valueId: 'val-reg', valueName: 'Tô vừa', priceDelta: 0 }]
      },
      {
        id: 'item-2',
        menuItemId: 'dish-tra-dao-cam-sa',
        name: 'Trà Đào Cam Sả Tươi',
        price: 39000,
        quantity: 2,
        itemTotal: 78000,
        status: 'Ready',
        selectedOptions: [
          { groupId: 'opt-sweet', groupName: 'Độ ngọt', valueId: 'sw-70', valueName: '70% đường', priceDelta: 0 },
          { groupId: 'opt-ice', groupName: 'Đá', valueId: 'ice-100', valueName: '100% đá', priceDelta: 0 }
        ]
      }
    ],
    subTotal: 216000,
    totalAmount: 216000,
    status: 'Preparing',
    isPaid: false,
    orderSource: 'QR_CUSTOMER',
    createdAt: new Date(Date.now() - 12 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    id: 'ord-102',
    orderCode: 'IM-260902-002',
    tableId: 'tbl-04',
    tableName: 'Bàn 04',
    restaurantId: 'rest-bep-nha',
    items: [
      {
        id: 'item-3',
        menuItemId: 'dish-com-tam',
        name: 'Cơm Tấm Sườn Bì Chả Trứng',
        price: 68000,
        quantity: 3,
        itemTotal: 204000,
        status: 'Served',
      },
      {
        id: 'item-4',
        menuItemId: 'dish-ca-phe-sua-da',
        name: 'Cà Phê Sữa Đá Sài Gòn',
        price: 29000,
        quantity: 3,
        itemTotal: 87000,
        status: 'Served',
      }
    ],
    subTotal: 291000,
    totalAmount: 291000,
    status: 'PaymentRequested',
    isPaid: false,
    paymentMethod: 'VietQR',
    orderSource: 'QR_CUSTOMER',
    createdAt: new Date(Date.now() - 40 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60000).toISOString(),
  }
];

export const SEED_USERS: User[] = [
  {
    id: 'usr-owner',
    email: 'owner@sample.vn',
    fullName: 'Nguyễn Minh An',
    phone: '0901234567',
    role: 'RESTAURANT_ADMIN',
    restaurantId: 'rest-bep-nha',
    branchName: 'Chi nhánh Quận 1 (Chính)',
    status: 'ACTIVE',
    createdAt: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'usr-manager',
    email: 'manager@sample.vn',
    fullName: 'Trần Văn Bình',
    phone: '0902345678',
    role: 'RESTAURANT_MANAGER',
    restaurantId: 'rest-bep-nha',
    branchName: 'Chi nhánh Quận 1 (Chính)',
    status: 'ACTIVE',
    createdAt: '2026-01-15T09:30:00.000Z',
  },
  {
    id: 'usr-cashier',
    email: 'cashier@sample.vn',
    fullName: 'Lê Thị Cúc',
    phone: '0903456789',
    role: 'CASHIER',
    restaurantId: 'rest-bep-nha',
    branchName: 'Chi nhánh Quận 1 (Chính)',
    status: 'ACTIVE',
    createdAt: '2026-02-01T14:15:00.000Z',
  },
  {
    id: 'usr-kitchen',
    email: 'kitchen@sample.vn',
    fullName: 'Phạm Hoàng Dũng',
    phone: '0904567890',
    role: 'KITCHEN',
    restaurantId: 'rest-bep-nha',
    branchName: 'Chi nhánh Quận 1 (Chính)',
    status: 'ACTIVE',
    createdAt: '2026-02-10T10:00:00.000Z',
  },
];

export const SEED_PERMISSION_GROUPS: PermissionGroup[] = [
  {
    id: 'group-menu',
    groupName: 'Quản Lý Thực Đơn',
    icon: '🍲',
    permissions: [
      { id: 'perm-menu-view', name: 'Xem thực đơn', description: 'Xem danh sách món ăn, giá và danh mục' },
      { id: 'perm-menu-create', name: 'Thêm món ăn mới', description: 'Tạo món mới, tải ảnh và cấu hình topping' },
      { id: 'perm-menu-status', name: 'Bật/Tắt trạng thái Còn/Hết', description: 'Bật tắt nhanh trạng thái Còn món / Hết món' },
      { id: 'perm-menu-category', name: 'Quản lý danh mục', description: 'Tạo, sửa, sắp xếp và xóa danh mục thực đơn' },
    ],
  },
  {
    id: 'group-pos',
    groupName: 'Sơ Đồ Bàn & POS Bán Hàng',
    icon: '🍽️',
    permissions: [
      { id: 'perm-pos-view', name: 'Xem sơ đồ bàn', description: 'Xem trạng thái bàn ăn thời gian thực' },
      { id: 'perm-pos-order', name: 'Tạo đơn gọi món', description: 'Chọn món và gửi đơn vào bếp cho khách' },
      { id: 'perm-pos-pay', name: 'Thanh toán & In hóa đơn', description: 'Xác nhận VietQR, thu tiền mặt, in bill 80mm' },
      { id: 'perm-pos-table', name: 'Quản lý bàn', description: 'Thêm bàn mới, sửa khu vực, gộp/chuyển bàn' },
    ],
  },
  {
    id: 'group-kds',
    groupName: 'Màn Hình Bếp KDS',
    icon: '👨‍🍳',
    permissions: [
      { id: 'perm-kds-view', name: 'Xem vé bếp', description: 'Nhận vé order thời gian thực từ khách và thu ngân' },
      { id: 'perm-kds-cook', name: 'Xác nhận chế biến', description: 'Chuyển trạng thái Đang nấu / Hoàn tất món' },
      { id: 'perm-kds-out', name: 'Báo hết nguyên liệu', description: 'Báo hết món trực tiếp từ khu vực bếp' },
    ],
  },
  {
    id: 'group-reports',
    groupName: 'Báo Cáo & Doanh Thu',
    icon: '📈',
    permissions: [
      { id: 'perm-rep-view', name: 'Xem doanh thu ngày', description: 'Xem biểu đồ doanh thu, số đơn và món bán chạy' },
      { id: 'perm-rep-export', name: 'Xuất báo cáo', description: 'Xuất file excel doanh thu và lịch sử hóa đơn' },
    ],
  },
  {
    id: 'group-admin',
    groupName: 'Nhân Sự & Cài Đặt',
    icon: '⚙️',
    permissions: [
      { id: 'perm-staff-manage', name: 'Quản lý nhân viên', description: 'Thêm nhân viên, khóa tài khoản, đổi thông tin' },
      { id: 'perm-role-manage', name: 'Quản lý phân quyền', description: 'Tạo vai trò mới và cấu hình ma trận quyền hạn' },
      { id: 'perm-qr-print', name: 'Tạo & In mã QR bàn', description: 'Xuất file in Standee mica và mã QR để bàn' },
      { id: 'perm-settings', name: 'Cài đặt nhà hàng', description: 'Cấu hình thông tin nhà hàng, tài khoản ngân hàng' },
    ],
  },
];

export const SEED_ROLES: RoleDefinition[] = [
  {
    id: 'role-owner',
    code: 'RESTAURANT_ADMIN',
    name: 'Chủ Nhà Hàng / Chi Nhánh',
    description: 'Toàn quyền quản trị chi nhánh, phân quyền nhân viên và cài đặt',
    isSystem: true,
    color: '#09271d',
    permissions: [
      'perm-menu-view', 'perm-menu-create', 'perm-menu-status', 'perm-menu-category',
      'perm-pos-view', 'perm-pos-order', 'perm-pos-pay', 'perm-pos-table',
      'perm-kds-view', 'perm-kds-cook', 'perm-kds-out',
      'perm-rep-view', 'perm-rep-export',
      'perm-staff-manage', 'perm-role-manage', 'perm-qr-print', 'perm-settings',
    ],
  },
  {
    id: 'role-manager',
    code: 'RESTAURANT_MANAGER',
    name: 'Quản Lý Ca',
    description: 'Điều hành ca làm việc, xử lý bàn ăn, xem báo cáo ca và quản lý thực đơn',
    isSystem: true,
    color: '#124a36',
    permissions: [
      'perm-menu-view', 'perm-menu-create', 'perm-menu-status', 'perm-menu-category',
      'perm-pos-view', 'perm-pos-order', 'perm-pos-pay', 'perm-pos-table',
      'perm-kds-view', 'perm-kds-cook', 'perm-kds-out',
      'perm-rep-view', 'perm-qr-print',
    ],
  },
  {
    id: 'role-cashier',
    code: 'CASHIER',
    name: 'Thu Ngân POS',
    description: 'Mở bàn, tạo đơn tại quầy, thu tiền VietQR/tiền mặt và in hóa đơn',
    isSystem: true,
    color: '#d97706',
    permissions: [
      'perm-menu-view', 'perm-menu-status',
      'perm-pos-view', 'perm-pos-order', 'perm-pos-pay',
      'perm-rep-view',
    ],
  },
  {
    id: 'role-kitchen',
    code: 'KITCHEN',
    name: 'Nhân Viên Bếp KDS',
    description: 'Theo dõi màn hình bếp, cập nhật tiến độ chế biến và hoàn tất món',
    isSystem: true,
    color: '#dc2626',
    permissions: [
      'perm-kds-view', 'perm-kds-cook', 'perm-kds-out',
    ],
  },
  {
    id: 'role-waiter',
    code: 'WAITER',
    name: 'Nhân Viên Phục Vụ',
    description: 'Hỗ trợ khách tại bàn, mở bàn và tiếp nhận yêu cầu gọi nhân viên',
    isSystem: true,
    color: '#2563eb',
    permissions: [
      'perm-menu-view', 'perm-pos-view', 'perm-pos-order',
    ],
  },
];

// ================= STORAGE API =================
export const storageService = {
  getRestaurant(): Restaurant {
    if (typeof window === 'undefined') return SEED_RESTAURANT;
    const data = localStorage.getItem(STORAGE_KEYS.RESTAURANT);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.RESTAURANT, JSON.stringify(SEED_RESTAURANT));
      return SEED_RESTAURANT;
    }
    return JSON.parse(data);
  },

  saveRestaurant(restaurant: Restaurant) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.RESTAURANT, JSON.stringify(restaurant));
  },

  getCategories(): MenuCategory[] {
    if (typeof window === 'undefined') return SEED_CATEGORIES;
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(SEED_CATEGORIES));
      return SEED_CATEGORIES;
    }
    return JSON.parse(data);
  },

  saveCategories(categories: MenuCategory[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  },

  getMenuItems(): MenuItem[] {
    if (typeof window === 'undefined') return SEED_MENU_ITEMS;
    const data = localStorage.getItem(STORAGE_KEYS.MENU_ITEMS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(SEED_MENU_ITEMS));
      return SEED_MENU_ITEMS;
    }
    return JSON.parse(data);
  },

  saveMenuItems(items: MenuItem[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(items));
  },

  getTables(): Table[] {
    if (typeof window === 'undefined') return SEED_TABLES;
    const data = localStorage.getItem(STORAGE_KEYS.TABLES);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(SEED_TABLES));
      return SEED_TABLES;
    }
    return JSON.parse(data);
  },

  saveTables(tables: Table[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(tables));
  },

  getOrders(): Order[] {
    if (typeof window === 'undefined') return SEED_ORDERS;
    const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(SEED_ORDERS));
      return SEED_ORDERS;
    }
    return JSON.parse(data);
  },

  saveOrders(orders: Order[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  },

  getUsers(): User[] {
    if (typeof window === 'undefined') return SEED_USERS;
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
      return SEED_USERS;
    }
    return JSON.parse(data);
  },

  saveUsers(users: User[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  getRoles(): RoleDefinition[] {
    if (typeof window === 'undefined') return SEED_ROLES;
    const data = localStorage.getItem(STORAGE_KEYS.ROLES);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.ROLES, JSON.stringify(SEED_ROLES));
      return SEED_ROLES;
    }
    return JSON.parse(data);
  },

  saveRoles(roles: RoleDefinition[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.ROLES, JSON.stringify(roles));
  },

  getPermissionGroups(): PermissionGroup[] {
    return SEED_PERMISSION_GROUPS;
  },
};
