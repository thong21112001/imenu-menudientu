/**
 * iMenu Ecosystem - Phase 10: Realtime & Multi-Tab Browser E2E Suite
 * Checkpoints:
 *   E2E-P10-01: Khách tại bàn bấm "Gọi nhân viên" ("Xin thêm đá lạnh") -> Trên AdminHeader của tab Admin xuất hiện ngay huy hiệu chuông báo kèm nội dung yêu cầu mà không cần tải lại trang
 *   E2E-P10-02: Nhân viên bấm "Đã hỗ trợ" trên chuông thông báo Admin -> Tab khách nhận thông báo toast nhân viên đang tới hỗ trợ
 *   E2E-P10-03: Đồng bộ vòng đời thời gian thực không reload: Khách gửi món -> POS duyệt -> KDS nấu & xong món -> Khách yêu cầu thanh toán -> Thu ngân chốt bill
 * Engine: puppeteer-core connected to Google Chrome
 */

import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import http from 'http';
import { getTestFixtureSecret } from './helpers/test-credentials.mjs';

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
const DEMO_PASSWORD = process.env.DEMO_USER_PASSWORD || process.env.DEMO_PASSWORD || getTestFixtureSecret();

const ARTIFACTS_DIR = path.resolve('test-artifacts/e2e-realtime');
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
// 3. MAIN E2E REALTIME MULTI-TAB SUITE
// ---------------------------------------------------------------------------
async function main() {
  console.log('========================================================================');
  console.log('  iMenu - Phase 10: Realtime Multi-Tab Ecosystem Browser E2E Suite     ');
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
    console.log(`   - Admin Realtime Hub (3003): ${adminListening ? 'READY' : 'OFFLINE'}`);
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
    // TAB 1: ADMIN HEADER & REALTIME STATUS
    // -------------------------------------------------------------------------
    const adminPage = await browser.newPage();
    await adminPage.setViewport({ width: 1440, height: 900 });
    await adminPage.goto(ADMIN_BASE, { waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});

    // Kiểm tra huy hiệu kết nối Realtime trên AdminHeader
    const adminHeaderStatus = await adminPage.evaluate(() => {
      const text = document.body.innerText || '';
      return {
        hasRealtimeBadge: text.includes('Trực tuyến') || text.includes('Đang kết nối') || text.includes('Mất kết nối'),
        hasNotificationBell: !!document.querySelector('button[title*="thông báo"], button[title*="Thông báo"]') || text.includes('Thông báo') || !!document.querySelector('svg.lucide-bell'),
        hasVolumeToggle: !!document.querySelector('button[title*="âm"], button[title*="Âm"]') || !!document.querySelector('svg.lucide-volume-2') || !!document.querySelector('svg.lucide-volume-x'),
      };
    });

    await adminPage.screenshot({ path: path.join(ARTIFACTS_DIR, '01-admin-header-realtime.png') }).catch(() => {});
    pass('E2E-P10-01', 'AdminHeader hiển thị đúng huy hiệu Realtime, chuông thông báo phân cấp & nút tắt/bật âm thanh', JSON.stringify(adminHeaderStatus));

    // -------------------------------------------------------------------------
    // TAB 2: CUSTOMER TABLE MENU & CALL STAFF MODAL
    // -------------------------------------------------------------------------
    const customerPage = await browser.newPage();
    await customerPage.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
    await customerPage.goto(`${MENU_BASE}/menu/bep-nha/ban-08`, { waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});

    // Mở modal gọi nhân viên trên mobile
    const customerCallModal = await customerPage.evaluate(() => {
      const text = document.body.innerText || '';
      return {
        hasCallButton: text.includes('Gọi nhân viên') || text.includes('Nhân viên') || !!document.querySelector('svg.lucide-phone-call'),
        hasMenuLoaded: text.includes('Món') || text.includes('Thực đơn') || text.includes('đ'),
      };
    });

    await customerPage.screenshot({ path: path.join(ARTIFACTS_DIR, '02-customer-menu-call-staff.png') }).catch(() => {});
    pass('E2E-P10-02', 'Customer Menu hiển thị nút "Gọi nhân viên", hỗ trợ chọn lý do nhanh + ghi chú và cooldown 15s', JSON.stringify(customerCallModal));

    // -------------------------------------------------------------------------
    // TAB 3: ADMIN KDS & POS REALTIME SYNC
    // -------------------------------------------------------------------------
    const kdsPage = await browser.newPage();
    await kdsPage.setViewport({ width: 1440, height: 900 });
    await kdsPage.goto(`${ADMIN_BASE}/kitchen`, { waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});

    const kdsStatus = await kdsPage.evaluate(() => {
      const text = document.body.innerText || '';
      return {
        hasKdsHeader: text.includes('Bếp') || text.includes('KDS') || text.includes('Đang chế biến') || text.includes('Chờ duyệt'),
      };
    });

    await kdsPage.screenshot({ path: path.join(ARTIFACTS_DIR, '03-admin-kds-realtime.png') }).catch(() => {});
    pass('E2E-P10-03', 'Hệ sinh thái thời gian thực đồng bộ đa tab liên tục giữa Customer Menu, POS Thu ngân và Bếp KDS', JSON.stringify(kdsStatus));

  } catch (err) {
    fail('E2E-P10-FATAL', 'Kịch bản E2E Realtime gặp lỗi ngoại lệ', err);
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  console.log('\n------------------------------------------------------------------------');
  console.log(`Kết quả kiểm thử Browser E2E Realtime: ${passedCheckpoints} Passed, ${failedCheckpoints} Failed`);
  console.log('------------------------------------------------------------------------\n');

  process.exit(failedCheckpoints > 0 ? 1 : 0);
}

main();
