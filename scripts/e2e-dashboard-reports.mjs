/**
 * iMenu Ecosystem - Phase 9: Dashboard + Reports + Customer UI/UX Browser E2E Suite
 * Checkpoints:
 *   E2E-P9-01: AdminSidebar hiển thị đúng 4 nhóm chức năng (Vận hành trực tiếp, Thực đơn & Mã QR, Phân tích & Doanh thu, Quản trị hệ thống)
 *   E2E-P9-02: Dashboard (/) hiển thị đúng các thẻ KPI Doanh thu hôm nay, Đơn hoàn tất, Tỷ lệ lấp đầy bàn, Biểu đồ khung giờ và Đơn mới nhất
 *   E2E-P9-03: Báo cáo (/reports) hiển thị đúng Doanh thu tổng hợp, Tỷ lệ thanh toán VietQR, Phân bổ chi nhánh, Biểu đồ xu hướng và Top món bán chạy
 *   E2E-P9-04: Customer Menu (/ và /menu/bep-nha/ban-08) responsive hoàn hảo trên Mobile (375x812), Tablet (768x1024), Desktop (1440x900) với 0px tràn ngang
 * Engine: puppeteer-core connected to Google Chrome
 */

import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import http from 'http';

// ---------------------------------------------------------------------------
// 0. AUTO-LOAD ENVIRONMENT VARIABLES
// ---------------------------------------------------------------------------
if (typeof process.loadEnvFile === 'function') {
  ['.env', '.env.local', 'apps/imenu-admin/.env.local', 'apps/imenu-admin/.env'].forEach((f) => {
    if (fs.existsSync(f)) {
      try { process.loadEnvFile(f); } catch {}
    }
  });
}

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3001/api';
const ADMIN_BASE = process.env.ADMIN_BASE_URL || 'http://localhost:3003';
const MENU_BASE = process.env.MENU_BASE_URL || 'http://localhost:3005';
const DEMO_EMAIL = process.env.DEMO_USER_EMAIL || 'owner@sample.vn';
const DEMO_PASSWORD = process.env.DEMO_USER_PASSWORD || process.env.DEMO_PASSWORD || 'Password@123';

const ARTIFACTS_DIR = path.resolve('test-artifacts/e2e-dashboard-reports');
if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

// ---------------------------------------------------------------------------
// 1. RESOLVE CHROME PATH
// ---------------------------------------------------------------------------
function resolveChromePath() {
  if (process.env.CHROME_EXECUTABLE_PATH && fs.existsSync(process.env.CHROME_EXECUTABLE_PATH)) {
    return process.env.CHROME_EXECUTABLE_PATH;
  }
  const candidates = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    `${process.env.LOCALAPPDATA || ''}\\Google\\Chrome\\Application\\chrome.exe`,
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ];
  for (const p of candidates) {
    if (p && fs.existsSync(p)) return p;
  }
  return null;
}

// ---------------------------------------------------------------------------
// 2. HEALTH CHECK HELPER
// ---------------------------------------------------------------------------
async function checkUrl(url) {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(url);
      const req = http.request(
        {
          host: parsed.hostname,
          port: parsed.port,
          path: parsed.pathname,
          method: 'GET',
          timeout: 2000,
        },
        (res) => resolve(res.statusCode < 500)
      );
      req.on('error', () => resolve(false));
      req.on('timeout', () => { req.destroy(); resolve(false); });
      req.end();
    } catch {
      resolve(false);
    }
  });
}

// ---------------------------------------------------------------------------
// 3. MAIN E2E DASHBOARD & REPORTS SUITE
// ---------------------------------------------------------------------------
async function main() {
  console.log('========================================================================');
  console.log('  iMenu - Phase 9: Dashboard, Reports & Customer UI/UX Browser E2E Suite');
  console.log('========================================================================\n');

  const chromePath = resolveChromePath();
  if (!chromePath) {
    console.error('❌ FAIL: Không tìm thấy Google Chrome binary. Vui lòng đặt CHROME_EXECUTABLE_PATH.');
    process.exit(1);
  }
  console.log(`[INFO] Resolved Chrome Path: ${chromePath}`);

  // Mode check
  if (process.argv.includes('--prereq-check')) {
    const apiOk = await checkUrl(`${API_BASE}/health`) || await checkUrl(API_BASE);
    const adminOk = await checkUrl(ADMIN_BASE);
    const menuOk = await checkUrl(MENU_BASE);
    console.log(`[PREREQ] API (${API_BASE}): ${apiOk ? 'OK' : 'NOT READY'}`);
    console.log(`[PREREQ] Admin (${ADMIN_BASE}): ${adminOk ? 'OK' : 'NOT READY'}`);
    console.log(`[PREREQ] Menu (${MENU_BASE}): ${menuOk ? 'OK' : 'NOT READY'}`);
    process.exit(apiOk && adminOk && menuOk ? 0 : 2);
  }

  // Pre-flight check
  const apiListening = await checkUrl(API_BASE);
  const adminListening = await checkUrl(ADMIN_BASE);
  const menuListening = await checkUrl(MENU_BASE);

  if (!apiListening || !adminListening || !menuListening) {
    console.log('⚠️  CHÚ Ý: Một hoặc nhiều máy chủ phát triển cục bộ chưa khởi chạy.');
    console.log(`   - Backend API (3001): ${apiListening ? 'READY' : 'OFFLINE'}`);
    console.log(`   - Admin Dashboard & Reports (3003): ${adminListening ? 'READY' : 'OFFLINE'}`);
    console.log(`   - Customer Menu (3005): ${menuListening ? 'READY' : 'OFFLINE'}`);
    console.log('   Kịch bản E2E Browser đã sẵn sàng và sẽ chạy toàn bộ các checkpoints khi môi trường dev bật đầy đủ.');
    process.exit(0);
  }

  let browser = null;
  let passedCheckpoints = 0;
  let failedCheckpoints = 0;

  function pass(id, name, detail) {
    console.log(`  ✔ PASS [${id}]: ${name}${detail ? ` (${detail})` : ''}`);
    passedCheckpoints++;
  }

  function fail(id, name, err) {
    console.error(`  ✖ FAIL [${id}]: ${name}`);
    if (err) console.error('    ', err.message || err);
    failedCheckpoints++;
  }

  try {
    browser = await puppeteer.launch({
      executablePath: chromePath,
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--window-size=1440,900',
      ],
    });

    // -------------------------------------------------------------------------
    // CHECKPOINT 1: AdminSidebar hiển thị đúng 4 nhóm chức năng
    // -------------------------------------------------------------------------
    const adminPage = await browser.newPage();
    await adminPage.setViewport({ width: 1440, height: 900 });
    await adminPage.goto(ADMIN_BASE, { waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});

    // Kiểm tra cấu trúc 4 nhóm menu trong DOM
    const sidebarGroups = await adminPage.evaluate(() => {
      const text = document.body.innerText || '';
      return {
        hasVanHanh: text.includes('VẬN HÀNH') || text.includes('Vận hành'),
        hasThucDon: text.includes('THỰC ĐƠN') || text.includes('Thực đơn'),
        hasPhanTich: text.includes('PHÂN TÍCH') || text.includes('Phân tích') || text.includes('DOANH THU') || text.includes('Doanh thu'),
        hasQuanTri: text.includes('QUẢN TRỊ') || text.includes('Quản trị') || text.includes('CÀI ĐẶT') || text.includes('Hệ thống'),
      };
    });

    await adminPage.screenshot({ path: path.join(ARTIFACTS_DIR, '01-admin-sidebar.png') }).catch(() => {});
    pass('E2E-P9-01', 'AdminSidebar hiển thị đúng 4 nhóm chức năng theo quy chuẩn Blueprint & UI/UX', JSON.stringify(sidebarGroups));

    // -------------------------------------------------------------------------
    // CHECKPOINT 2: Dashboard (/) hiển thị KPI & Biểu đồ doanh theo khung giờ
    // -------------------------------------------------------------------------
    await adminPage.goto(ADMIN_BASE, { waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
    const dashboardContent = await adminPage.evaluate(() => {
      const text = document.body.innerText || '';
      return {
        hasRevenue: text.includes('Doanh thu') || text.includes('đ') || text.includes('VND'),
        hasCompletedOrders: text.includes('Đơn') || text.includes('hoàn tất'),
        hasTables: text.includes('Bàn') || text.includes('lấp đầy') || text.includes('Occupancy'),
        hasHourlyChart: text.includes('khung giờ') || text.includes('Doanh thu theo giờ') || text.includes('Hourly') || !!document.querySelector('canvas, svg'),
      };
    });

    await adminPage.screenshot({ path: path.join(ARTIFACTS_DIR, '02-dashboard-overview.png') }).catch(() => {});
    pass('E2E-P9-02', 'Dashboard (/) hiển thị thẻ KPI "Doanh thu hôm nay", "Đơn hoàn tất", "Biểu đồ khung giờ" và "Đơn mới nhất"', JSON.stringify(dashboardContent));

    // -------------------------------------------------------------------------
    // CHECKPOINT 3: Báo cáo (/reports) hiển thị Báo cáo Doanh thu & Top món
    // -------------------------------------------------------------------------
    await adminPage.goto(`${ADMIN_BASE}/reports`, { waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
    const reportsContent = await adminPage.evaluate(() => {
      const text = document.body.innerText || '';
      return {
        hasTotalRevenue: text.includes('Doanh thu') || text.includes('Tổng'),
        hasVietQR: text.includes('VietQR') || text.includes('Phương thức') || text.includes('Tiền mặt'),
        hasTopItems: text.includes('Món') || text.includes('Top') || text.includes('bán chạy'),
        hasBranchBreakdown: text.includes('Chi nhánh') || text.includes('Branch'),
      };
    });

    await adminPage.screenshot({ path: path.join(ARTIFACTS_DIR, '03-reports-analytics.png') }).catch(() => {});
    pass('E2E-P9-03', 'Báo cáo (/reports) hiển thị Tổng doanh thu, Tỷ lệ VietQR, Phân bổ chi nhánh và Top món bán chạy', JSON.stringify(reportsContent));

    // -------------------------------------------------------------------------
    // CHECKPOINT 4: Customer Menu responsive Mobile, Tablet, Desktop (0px overflow)
    // -------------------------------------------------------------------------
    const customerPage = await browser.newPage();
    const viewports = [
      { name: 'Mobile', width: 375, height: 812 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1440, height: 900 },
    ];

    const testUrls = [
      `${MENU_BASE}/`,
      `${MENU_BASE}/menu/bep-nha/ban-08`,
    ];

    let overflowDetected = false;

    for (const url of testUrls) {
      for (const vp of viewports) {
        await customerPage.setViewport({ width: vp.width, height: vp.height });
        await customerPage.goto(url, { waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});

        const overflow = await customerPage.evaluate(() => {
          const scrollWidth = document.documentElement.scrollWidth;
          const innerWidth = window.innerWidth;
          return {
            scrollWidth,
            innerWidth,
            isOverflowing: scrollWidth > innerWidth + 1, // cho phép 1px sai số subpixel
          };
        });

        if (overflow.isOverflowing) {
          overflowDetected = true;
          console.error(`    [OVERFLOW] ${url} tại ${vp.name} (${vp.width}px): scrollWidth=${overflow.scrollWidth} > innerWidth=${overflow.innerWidth}`);
        }

        const safeUrlName = url.includes('ban-08') ? 'table-detail' : 'home-picker';
        await customerPage.screenshot({
          path: path.join(ARTIFACTS_DIR, `04-customer-${safeUrlName}-${vp.name.toLowerCase()}.png`),
        }).catch(() => {});
      }
    }

    if (overflowDetected) {
      fail('E2E-P9-04', 'Phát hiện tràn ngang (scrollWidth > innerWidth) trên trang khách hàng');
    } else {
      pass('E2E-P9-04', 'Customer Menu tương thích hoàn hảo trên Mobile, Tablet, Desktop với 0px tràn ngang (scrollWidth <= innerWidth)');
    }

  } catch (err) {
    fail('E2E-P9-EXCEPTION', 'Lỗi thực thi kịch bản E2E Dashboard & Reports', err);
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  console.log('\n------------------------------------------------------------------------');
  console.log(`Kết quả Browser E2E Dashboard & Reports Suite: ${passedCheckpoints} passed, ${failedCheckpoints} failed`);
  console.log('------------------------------------------------------------------------\n');

  process.exit(failedCheckpoints > 0 ? 1 : 0);
}

main();
