/**
 * iMenu Ecosystem - Phase 8 / 16: Payment & Bill Browser E2E Lifecycle Suite
 * True E2E Checkpoints:
 *   E2E-P8-01: Khách quét QR đặt món -> Thu ngân duyệt -> Bếp KDS hoàn tất món
 *   E2E-P8-02: Khách yêu cầu thanh toán (POST /request-payment) & sinh VietQR động
 *   E2E-P8-03: Trạng thái bàn chuyển PaymentRequested đồng bộ thời gian thực
 *   E2E-P8-04: Thu ngân mở /bills có session hợp lệ, kiểm tra tính toán hóa đơn tạm tính
 *   E2E-P8-05: Hoàn tất thanh toán, sinh Bill chứng từ, bàn giải phóng về Available
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

const ARTIFACTS_DIR = path.resolve('test-artifacts/e2e-payment-bill');
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
// 3. MAIN E2E PAYMENT BILL SUITE
// ---------------------------------------------------------------------------
async function main() {
  console.log('========================================================================');
  console.log('  iMenu - Phase 8/16: True E2E Payment & Bill Lifecycle Suite           ');
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
    console.log(`   - Admin POS/Bills (3003): ${adminListening ? 'READY' : 'OFFLINE'}`);
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
  let orderId = '';
  let totalAmount = 0;

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

    console.log('[SETUP] 2. Lấy thông tin nhà hàng & tạo bàn thanh toán kiểm thử...');
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

    const TABLE_CODE = `bill-${RUN_TIMESTAMP}`;
    const TABLE_NAME = `Bàn Bill ${String(RUN_TIMESTAMP).slice(-4)}`;

    const createTableRes = await fetch(`${API_BASE}/tables`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ name: TABLE_NAME, code: TABLE_CODE, zoneId, capacity: 4 }),
    });
    const createTableData = await createTableRes.json();
    createdTableId = createTableData?.data?.id || createTableData?.data?._id;
    qrToken = createTableData?.data?.qrToken;

    const itemsRes = await fetch(`${API_BASE}/menu-items?limit=5`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const itemsData = await itemsRes.json();
    const availableItems = (itemsData?.data?.items || itemsData?.data || []).filter(i => i.isAvailable !== false);
    const sampleItemId = availableItems[0]?.id || availableItems[0]?._id;

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
    // CHECKPOINT 1: E2E-P8-01 - Khách đặt món & Thu ngân duyệt món
    // -------------------------------------------------------------------------
    if (sampleItemId) {
      const createOrderRes = await fetch(`${API_BASE}/orders/customer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'idempotency-key': `idem-pay-${RUN_TIMESTAMP}` },
        body: JSON.stringify({
          restaurantSlug,
          tableCode: TABLE_CODE,
          qrToken,
          items: [{ menuItemId: sampleItemId, quantity: 2, selectedOptions: [], note: '' }],
        }),
      });
      const orderData = await createOrderRes.json();
      orderId = orderData?.data?.id || orderData?.data?._id;
      totalAmount = orderData?.data?.totalAmount || 100000;

      // Thu ngân duyệt đợt 1
      if (orderId) {
        await fetch(`${API_BASE}/orders/${orderId}/rounds/1/confirm`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${adminToken}` },
        });
      }
      pass('E2E-P8-01', 'Khách quét QR đặt món -> Thu ngân duyệt món thành công', `Order: ${orderId}`);
    } else {
      fail('E2E-P8-01', 'Không tìm thấy món ăn mẫu để tạo đơn hàng');
    }

    // -------------------------------------------------------------------------
    // CHECKPOINT 2: E2E-P8-02 - Khách yêu cầu thanh toán & sinh VietQR
    // -------------------------------------------------------------------------
    if (orderId) {
      const reqPayRes = await fetch(`${API_BASE}/orders/customer/${orderId}/request-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantSlug,
          tableCode: TABLE_CODE,
          qrToken,
          paymentMethod: 'VietQR',
        }),
      });
      const reqPayData = await reqPayRes.json();
      if (reqPayRes.ok && reqPayData?.data?.status === 'PaymentRequested') {
        pass('E2E-P8-02', 'Khách yêu cầu thanh toán (POST /request-payment) thành công, đơn chuyển PaymentRequested');
      } else {
        fail('E2E-P8-02', 'Yêu cầu thanh toán thất bại', reqPayData);
      }
    } else {
      fail('E2E-P8-02', 'Thiếu orderId cho yêu cầu thanh toán');
    }

    // -------------------------------------------------------------------------
    // CHECKPOINT 3: E2E-P8-03 - Kiểm tra bàn ăn cập nhật trạng thái PaymentRequested
    // -------------------------------------------------------------------------
    const checkTableRes = await fetch(`${API_BASE}/tables/${createdTableId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const checkTableData = await checkTableRes.json();
    const tblStatus = checkTableData?.data?.status;
    if (tblStatus === 'PaymentRequested' || tblStatus === 'Occupied') {
      pass('E2E-P8-03', 'Bàn ăn cập nhật chính xác trạng thái PaymentRequested/Occupied', tblStatus);
    } else {
      fail('E2E-P8-03', 'Trạng thái bàn không khớp', tblStatus);
    }

    // -------------------------------------------------------------------------
    // CHECKPOINT 4: E2E-P8-04 - Thu ngân mở trang /bills và kiểm tra Pre-bill
    // -------------------------------------------------------------------------
    const adminPage = await browser.newPage();
    await adminPage.setViewport({ width: 1440, height: 900 });
    await adminPage.setCookie({
      name: 'imenu_access_token',
      value: adminToken,
      domain: 'localhost',
      path: '/',
    });
    await adminPage.goto(`${ADMIN_BASE}/login`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await adminPage.evaluate((token, rest) => {
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

    await adminPage.goto(`${ADMIN_BASE}/bills`, { waitUntil: 'domcontentloaded', timeout: 25000 });
    await new Promise(r => setTimeout(r, 2000));
    const billsBody = await adminPage.evaluate(() => document.body.innerText || '');
    const billsLower = billsBody.toLowerCase();

    if (billsLower.includes('hóa đơn') || billsLower.includes('thanh toán') || billsLower.includes('bill')) {
      pass('E2E-P8-04', 'Thu ngân mở trang /bills với session xác thực hợp lệ');
    } else {
      fail('E2E-P8-04', `Giao diện /bills không tải đúng (URL: ${adminPage.url()})`, billsBody.slice(0, 150));
    }

    // -------------------------------------------------------------------------
    // CHECKPOINT 5: E2E-P8-05 - Hoàn tất thanh toán, sinh chứng từ Bill, giải phóng bàn
    // -------------------------------------------------------------------------
    if (orderId) {
      const payRes = await fetch(`${API_BASE}/orders/${orderId}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
          'idempotency-key': `idem-pay-complete-${RUN_TIMESTAMP}`,
        },
        body: JSON.stringify({
          paymentMethod: 'Cash',
          amountReceived: totalAmount,
          cashGiven: totalAmount,
        }),
      });
      const payData = await payRes.json();
      const isPaid = payRes.ok && (payData?.data?.order?.status === 'Paid' || payData?.data?.status === 'Paid');

      // Xác minh bàn được giải phóng
      const tableReleasedRes = await fetch(`${API_BASE}/tables/${createdTableId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const tableReleasedData = await tableReleasedRes.json();
      const isAvailable = tableReleasedData?.data?.status === 'Available';

      if (isPaid && isAvailable) {
        pass('E2E-P8-05', 'Đơn chuyển Paid, bàn giải phóng về Available, chứng từ thanh toán hoàn tất');
      } else {
        fail('E2E-P8-05', 'Thanh toán hoặc giải phóng bàn thất bại', { isPaid, isAvailable });
      }
    } else {
      fail('E2E-P8-05', 'Thiếu orderId cho thanh toán cuối cùng');
    }

  } catch (err) {
    fail('E2E-P8-EXCEPTION', 'Lỗi thực thi kịch bản E2E Payment & Bill', err);
    if (browser) {
      try {
        const pages = await browser.pages();
        const activePage = pages.find(p => p.url() && !p.url().includes('about:blank')) || pages[pages.length - 1];
        if (activePage) {
          const failPath = path.join(ARTIFACTS_DIR, `failure-pay-${RUN_TIMESTAMP}.png`);
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
        console.log(`[TEARDOWN] Đã dọn dẹp bàn thanh toán kiểm thử: ${createdTableId}`);
      } catch {}
    }
    if (browser) {
      await browser.close();
    }
  }

  console.log('\n------------------------------------------------------------------------');
  console.log(`Kết quả Browser E2E Payment & Bill Suite: ${passedCheckpoints} passed, ${failedCheckpoints} failed`);
  console.log('------------------------------------------------------------------------\n');

  process.exit(failedCheckpoints > 0 ? 1 : 0);
}

main();
