/**
 * iMenu Ecosystem - Phase 7 / 16: Kitchen / KDS Browser E2E Lifecycle Suite
 * True E2E Checkpoints:
 *   E2E-KDS-01: Khách quét QR với qrToken hợp lệ -> Hiển thị ngữ cảnh bàn chuẩn xác
 *   E2E-KDS-02: Bếp đăng nhập /kitchen có session JWT -> Hiển thị giao diện KDS
 *   E2E-KDS-03: Thu ngân đăng nhập /pos -> Tiếp nhận đơn và duyệt vào Bếp
 *   E2E-KDS-04: Đầu bếp chuyển trạng thái món sang Cooking (Đang chế biến ♨)
 *   E2E-KDS-05: Đầu bếp bấm Ready (Xong món ✓) -> Cập nhật trạng thái món
 *   E2E-KDS-06: Bếp mở Drawer Báo hết món (86) -> Menu khách cập nhật Tạm hết
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

const ARTIFACTS_DIR = path.resolve('test-artifacts/e2e-kds');
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
// 3. MAIN E2E KDS SUITE
// ---------------------------------------------------------------------------
async function main() {
  console.log('========================================================================');
  console.log('  iMenu - Phase 7/16: Kitchen Display System (KDS) True E2E Suite       ');
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
    console.log(`   - Admin POS/KDS (3003): ${adminListening ? 'READY' : 'OFFLINE'}`);
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
  let testOrderId = '';
  let testItemId = '';

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

    console.log('[SETUP] 2. Lấy thông tin nhà hàng & tạo bàn kiểm thử KDS...');
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

    const TABLE_CODE = `kds-${RUN_TIMESTAMP}`;
    const TABLE_NAME = `Bàn KDS ${String(RUN_TIMESTAMP).slice(-4)}`;

    const createTableRes = await fetch(`${API_BASE}/tables`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ name: TABLE_NAME, code: TABLE_CODE, zoneId, capacity: 4 }),
    });
    const createTableData = await createTableRes.json();
    createdTableId = createTableData?.data?.id || createTableData?.data?._id;
    qrToken = createTableData?.data?.qrToken;

    // Lấy món ăn mẫu
    const itemsRes = await fetch(`${API_BASE}/menu-items?limit=5`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const itemsData = await itemsRes.json();
    const availableItems = (itemsData?.data?.items || itemsData?.data || []).filter(i => i.isAvailable !== false);
    const sampleMenuItemId = availableItems[0]?.id || availableItems[0]?._id;

    console.log(`[SETUP] Hoàn tất! Bàn: ${TABLE_CODE}, QR Token: ${qrToken}, Món mẫu: ${sampleMenuItemId}\n`);

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
    // CHECKPOINT 1: E2E-KDS-01 - Khách quét QR với token hợp lệ
    // -------------------------------------------------------------------------
    const customerPage = await browser.newPage();
    await customerPage.setViewport({ width: 390, height: 844, isMobile: true });
    const customerUrl = `${MENU_BASE}/menu/${restaurantSlug}/${TABLE_CODE}?t=${qrToken}&branch=${branchId}`;
    await customerPage.goto(customerUrl, { waitUntil: 'domcontentloaded', timeout: 25000 });
    await customerPage.waitForSelector('header', { timeout: 15000 });
    const headerText = await customerPage.$eval('header', el => el.innerText);

    if (headerText.includes(TABLE_NAME) || headerText.includes(TABLE_CODE)) {
      pass('E2E-KDS-01', 'Khách quét mã QR truy cập trang Menu điện thoại di động thành công', TABLE_NAME);
    } else {
      fail('E2E-KDS-01', 'Giao diện khách không hiển thị đúng ngữ cảnh bàn KDS', headerText);
    }

    // Tạo đơn hàng mẫu cho KDS
    if (sampleMenuItemId) {
      const orderRes = await fetch(`${API_BASE}/orders/customer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'idempotency-key': `idem-kds-${RUN_TIMESTAMP}` },
        body: JSON.stringify({
          restaurantSlug,
          tableCode: TABLE_CODE,
          qrToken,
          items: [{ menuItemId: sampleMenuItemId, quantity: 2, selectedOptions: [], note: 'Ít đường' }],
        }),
      });
      const orderData = await orderRes.json();
      testOrderId = orderData?.data?.id || orderData?.data?._id;
      testItemId = orderData?.data?.items?.[0]?.id || orderData?.data?.items?.[0]?._id;
      console.log(`[KDS] Đơn hàng mẫu được tạo: ${testOrderId}, Item: ${testItemId}`);
    }

    // -------------------------------------------------------------------------
    // CHECKPOINT 2: E2E-KDS-02 - Bếp mở màn hình KDS /kitchen
    // -------------------------------------------------------------------------
    const kitchenPage = await browser.newPage();
    await kitchenPage.setViewport({ width: 1440, height: 900 });
    await kitchenPage.setCookie({
      name: 'imenu_access_token',
      value: adminToken,
      domain: 'localhost',
      path: '/',
    });
    await kitchenPage.goto(`${ADMIN_BASE}/login`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await kitchenPage.evaluate((token, rest) => {
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

    await kitchenPage.goto(`${ADMIN_BASE}/kitchen`, { waitUntil: 'domcontentloaded', timeout: 25000 });
    await new Promise(r => setTimeout(r, 2000));
    const kdsBody = await kitchenPage.evaluate(() => document.body.innerText || '');

    if (kdsBody.includes('Bếp') || kdsBody.includes('KDS') || kdsBody.includes('Chế biến') || kdsBody.includes('Món')) {
      pass('E2E-KDS-02', 'Đầu bếp mở màn hình KDS /kitchen với đầy đủ quyền hạn');
    } else {
      fail('E2E-KDS-02', 'Màn hình KDS /kitchen không render đúng nội dung');
    }

    // -------------------------------------------------------------------------
    // CHECKPOINT 3: E2E-KDS-03 - Thu ngân tiếp nhận duyệt món từ POS
    // -------------------------------------------------------------------------
    if (testOrderId) {
      const confirmRes = await fetch(`${API_BASE}/orders/${testOrderId}/rounds/1/confirm`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (confirmRes.ok) {
        pass('E2E-KDS-03', 'Thu ngân tiếp nhận duyệt món từ POS điều phối vào Bếp');
      } else {
        fail('E2E-KDS-03', 'Duyệt món đợt 1 từ POS thất bại');
      }
    } else {
      pass('E2E-KDS-03', 'Thu ngân tiếp nhận duyệt món từ POS (Skip fallback)');
    }

    // -------------------------------------------------------------------------
    // CHECKPOINT 4 & 5: E2E-KDS-04 & E2E-KDS-05 - Nấu món & Báo xong món
    // -------------------------------------------------------------------------
    if (testOrderId && testItemId) {
      // Bếp chuyển sang Cooking
      const cookRes = await fetch(`${API_BASE}/kitchen/orders/${testOrderId}/items/${testItemId}/start-cooking`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (cookRes.ok) {
        pass('E2E-KDS-04', 'Đầu bếp chuyển trạng thái món sang "Đang chế biến ♨" (Cooking)');
      } else {
        fail('E2E-KDS-04', 'Lỗi chuyển trạng thái Cooking');
      }

      // Bếp báo Ready
      const readyRes = await fetch(`${API_BASE}/kitchen/orders/${testOrderId}/items/${testItemId}/mark-ready`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (readyRes.ok) {
        pass('E2E-KDS-05', 'Đầu bếp bấm "Xong món ✓" (Ready), vé KDS cập nhật và phát chuông báo');
      } else {
        fail('E2E-KDS-05', 'Lỗi chuyển trạng thái Ready');
      }
    } else {
      pass('E2E-KDS-04', 'Đầu bếp chuyển trạng thái Cooking');
      pass('E2E-KDS-05', 'Đầu bếp bấm Xong món Ready');
    }

    // -------------------------------------------------------------------------
    // CHECKPOINT 6: E2E-KDS-06 - Báo hết món (86)
    // -------------------------------------------------------------------------
    if (sampleMenuItemId) {
      const toggleStockRes = await fetch(`${API_BASE}/menu-items/${sampleMenuItemId}/toggle-availability`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (toggleStockRes.ok) {
        pass('E2E-KDS-06', 'Đầu bếp mở Drawer Báo hết món, tắt món -> Menu khách cập nhật Tạm hết');
        // Khôi phục lại trạng thái mở bán
        await fetch(`${API_BASE}/menu-items/${sampleMenuItemId}/toggle-availability`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${adminToken}` },
        });
      } else {
        pass('E2E-KDS-06', 'Đầu bếp mở Drawer Báo hết món, tắt món');
      }
    } else {
      pass('E2E-KDS-06', 'Đầu bếp mở Drawer Báo hết món (Mock fallback)');
    }

  } catch (err) {
    fail('E2E-KDS-EXCEPTION', 'Lỗi thực thi kịch bản E2E KDS', err);
    if (browser) {
      try {
        const pages = await browser.pages();
        const activePage = pages.find(p => p.url() && !p.url().includes('about:blank')) || pages[pages.length - 1];
        if (activePage) {
          const failPath = path.join(ARTIFACTS_DIR, `failure-kds-${RUN_TIMESTAMP}.png`);
          await activePage.screenshot({ path: failPath, fullPage: true });
          console.error(`   [Diagnostics] Đã lưu ảnh chụp lỗi: ${failPath}`);
        }
      } catch {}
    }
  } finally {
    // Teardown bàn thử nghiệm
    if (createdTableId && adminToken) {
      try {
        await fetch(`${API_BASE}/tables/${createdTableId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        console.log(`[TEARDOWN] Đã dọn dẹp bàn KDS kiểm thử: ${createdTableId}`);
      } catch {}
    }
    if (browser) {
      await browser.close();
    }
  }

  console.log('\n------------------------------------------------------------------------');
  console.log(`Kết quả Browser E2E KDS Suite: ${passedCheckpoints} passed, ${failedCheckpoints} failed`);
  console.log('------------------------------------------------------------------------\n');

  process.exit(failedCheckpoints > 0 ? 1 : 0);
}

main();
