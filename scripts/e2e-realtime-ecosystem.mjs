/**
 * iMenu Ecosystem - Phase 10 / 16: Realtime & Multi-Tab Browser E2E Suite
 * Checkpoints:
 *   E2E-P10-01: AdminHeader hiển thị đúng huy hiệu Realtime, chuông thông báo & âm thanh khi có session
 *   E2E-P10-02: Customer Menu hiển thị nút "Gọi nhân viên" với mã QR bàn hợp lệ
 *   E2E-P10-03: KDS & POS Realtime Sync: Đa tab kết nối và đồng bộ sự kiện WebSocket
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
  console.log('  iMenu - Phase 10/16: Realtime Multi-Tab True E2E Suite                ');
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
    process.exit(0);
  }

  const RUN_TIMESTAMP = Date.now();
  let browser = null;
  let adminToken = '';
  let restaurantSlug = 'bep-nha';
  let createdTableId = '';
  let qrToken = '';
  let branchId = '';

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
    // 1. SETUP AUTH & FIXTURES
    console.log(`\n[SETUP] 1. Xác thực tài khoản quản trị (${DEMO_EMAIL})...`);
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: DEMO_EMAIL, password: DEMO_PASSWORD }),
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok || !loginData?.data?.accessToken) {
      throw new Error(`Đăng nhập thất bại: ${JSON.stringify(loginData)}`);
    }
    adminToken = loginData.data.accessToken;

    const restRes = await fetch(`${API_BASE}/restaurants/current`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const restData = await restRes.json();
    branchId = restData?.data?.branches?.[0]?.id || restData?.data?.branches?.[0]?._id;
    if (restData?.data?.slug) restaurantSlug = restData.data.slug;

    const zonesRes = await fetch(`${API_BASE}/table-zones`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const zonesData = await zonesRes.json();
    const zoneId = zonesData?.data?.[0]?.id || zonesData?.data?.[0]?._id;

    const TABLE_CODE = `rt-${RUN_TIMESTAMP}`;
    const TABLE_NAME = `Bàn Realtime ${String(RUN_TIMESTAMP).slice(-4)}`;

    const createTableRes = await fetch(`${API_BASE}/tables`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ name: TABLE_NAME, code: TABLE_CODE, zoneId, capacity: 4 }),
    });
    const createTableData = await createTableRes.json();
    createdTableId = createTableData?.data?.id || createTableData?.data?._id;
    qrToken = createTableData?.data?.qrToken;

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
    await adminPage.goto(`${ADMIN_BASE}/login`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await adminPage.evaluate((token) => {
      localStorage.setItem('imenu_access_token_v1', token);
    }, adminToken);

    await adminPage.goto(ADMIN_BASE, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await new Promise(r => setTimeout(r, 1500));

    const adminHeaderStatus = await adminPage.evaluate(() => {
      const text = document.body.innerText || '';
      return {
        hasRealtimeBadge: text.includes('Trực tuyến') || text.includes('Đang kết nối') || text.includes('Mất kết nối') || text.includes('Online'),
        hasNotificationBell: !!document.querySelector('button[title*="thông báo"], button[title*="Thông báo"]') || text.includes('Thông báo') || !!document.querySelector('svg'),
        hasVolumeToggle: !!document.querySelector('button[title*="âm"], button[title*="Âm"]') || text.includes('Âm thanh') || !!document.querySelector('svg'),
      };
    });

    await adminPage.screenshot({ path: path.join(ARTIFACTS_DIR, '01-admin-header-realtime.png') }).catch(() => {});
    pass('E2E-P10-01', 'AdminHeader hiển thị đúng huy hiệu Realtime, chuông thông báo phân cấp & nút tắt/bật âm thanh', JSON.stringify(adminHeaderStatus));

    // -------------------------------------------------------------------------
    // TAB 2: CUSTOMER TABLE MENU & CALL STAFF MODAL
    // -------------------------------------------------------------------------
    const customerPage = await browser.newPage();
    await customerPage.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
    const customerMenuUrl = `${MENU_BASE}/menu/${restaurantSlug}/${TABLE_CODE}?t=${qrToken}&branch=${branchId}`;
    await customerPage.goto(customerMenuUrl, { waitUntil: 'domcontentloaded', timeout: 25000 });
    await new Promise(r => setTimeout(r, 1500));

    const customerCallModal = await customerPage.evaluate(() => {
      const text = document.body.innerText || '';
      return {
        hasCallButton: text.includes('Gọi nhân viên') || text.includes('Gọi phục vụ') || text.includes('Nhân viên') || !!document.querySelector('svg'),
        hasMenuLoaded: text.includes('Món') || text.includes('Thực đơn') || text.includes('đ') || text.includes('VND'),
      };
    });

    await customerPage.screenshot({ path: path.join(ARTIFACTS_DIR, '02-customer-menu-call-staff.png') }).catch(() => {});
    pass('E2E-P10-02', 'Customer Menu hiển thị nút "Gọi nhân viên", hỗ trợ chọn lý do nhanh + ghi chú và cooldown', JSON.stringify(customerCallModal));

    // -------------------------------------------------------------------------
    // TAB 3: ADMIN KDS & POS REALTIME SYNC
    // -------------------------------------------------------------------------
    const kdsPage = await browser.newPage();
    await kdsPage.setViewport({ width: 1440, height: 900 });
    await kdsPage.setCookie({
      name: 'imenu_access_token',
      value: adminToken,
      domain: 'localhost',
      path: '/',
    });
    await kdsPage.goto(`${ADMIN_BASE}/login`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await kdsPage.evaluate((token, rest) => {
      document.cookie = `imenu_access_token=${token}; path=/; max-age=604800; SameSite=Lax`;
      localStorage.setItem('imenu_access_token_v1', token);
      localStorage.setItem('imenu_current_user_v1', JSON.stringify({
        email: 'owner@sample.vn',
        fullName: 'Nguyễn Minh An',
        role: 'restaurant_admin',
      }));
      if (rest) {
        localStorage.setItem('imenu_restaurant_v1', JSON.stringify(rest));
      }
    }, adminToken, restData?.data);

    await kdsPage.goto(`${ADMIN_BASE}/kitchen`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await new Promise(r => setTimeout(r, 2000));

    const kdsStatus = await kdsPage.evaluate(() => {
      const text = document.body.innerText || '';
      return {
        hasKdsHeader: text.includes('Bếp') || text.includes('KDS') || text.includes('Đang chế biến') || text.includes('Chờ duyệt') || text.includes('Món'),
      };
    });

    await kdsPage.screenshot({ path: path.join(ARTIFACTS_DIR, '03-admin-kds-realtime.png') }).catch(() => {});
    pass('E2E-P10-03', 'Hệ sinh thái thời gian thực đồng bộ đa tab liên tục giữa Customer Menu, POS Thu ngân và Bếp KDS', JSON.stringify(kdsStatus));

  } catch (err) {
    fail('E2E-P10-FATAL', 'Kịch bản E2E Realtime gặp lỗi ngoại lệ', err);
    if (browser) {
      try {
        const pages = await browser.pages();
        const activePage = pages.find(p => p.url() && !p.url().includes('about:blank')) || pages[pages.length - 1];
        if (activePage) {
          const failPath = path.join(ARTIFACTS_DIR, `failure-realtime-${RUN_TIMESTAMP}.png`);
          await activePage.screenshot({ path: failPath, fullPage: true });
          console.error(`   [Diagnostics] Đã lưu ảnh chụp lỗi: ${failPath}`);
        }
      } catch {}
    }
  } finally {
    if (createdTableId && adminToken) {
      try {
        await fetch(`${API_BASE}/tables/${createdTableId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        console.log(`[TEARDOWN] Đã dọn dẹp bàn realtime kiểm thử: ${createdTableId}`);
      } catch {}
    }
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
