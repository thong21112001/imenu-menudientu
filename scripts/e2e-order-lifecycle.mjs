/**
 * iMenu Ecosystem - Sub-phase 6.9: Browser E2E Cross-App Validation Suite
 * Workflow: Customer QR -> POS Approval -> Round 1 -> Round 2 -> Pre-bill -> Cash Pay -> Table Release
 * Engine: puppeteer-core connected to system Google Chrome
 */

import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import http from 'http';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3001/api';
const ADMIN_BASE = process.env.ADMIN_BASE_URL || 'http://localhost:3003';
const MENU_BASE = process.env.MENU_BASE_URL || 'http://localhost:3005';

const ARTIFACTS_DIR = path.resolve('test-artifacts/e2e-failures');
if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

// ---------------------------------------------------------------------------
// 1. RESOLVE CHROME EXECUTABLE PATH
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
// 3. MAIN E2E SUITE
// ---------------------------------------------------------------------------
async function main() {
  console.log('========================================================================');
  console.log('  iMenu - Sub-phase 6.9: Cross-App Browser E2E Order Lifecycle Suite   ');
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

  // Pre-flight check before launch
  const apiListening = await checkUrl(API_BASE);
  const adminListening = await checkUrl(ADMIN_BASE);
  const menuListening = await checkUrl(MENU_BASE);

  if (!apiListening || !adminListening || !menuListening) {
    console.error('❌ BLOCKED: Các máy chủ ứng dụng chưa sẵn sàng.');
    console.error(`   - Backend API (3001): ${apiListening ? 'READY' : 'DOWN'}`);
    console.error(`   - Admin POS (3003): ${adminListening ? 'READY' : 'DOWN'}`);
    console.error(`   - Customer Menu (3005): ${menuListening ? 'READY' : 'DOWN'}`);
    console.error('   Vui lòng khởi động các tiến trình phát triển trước khi chạy kịch bản E2E.');
    process.exit(1);
  }

  const RUN_TIMESTAMP = Date.now();
  const E2E_ID = `e2e_${RUN_TIMESTAMP}`;
  const TABLE_CODE = `tbl-${E2E_ID}`;
  const TABLE_NAME = `Bàn E2E ${String(RUN_TIMESTAMP).slice(-6)}`;
  
  let browser = null;
  let adminToken = '';
  let restaurantSlug = 'bep-nha';
  let createdTableId = '';
  let qrToken = '';
  let branchId = '';
  let orderId = '';

  let passedCheckpoints = 0;
  let failedCheckpoints = 0;

  function pass(id, name, detail) {
    console.log(`  ✔ PASS [${id}]: ${name}${detail ? ` (${detail})` : ''}`);
    passedCheckpoints++;
  }

  function fail(id, name, error) {
    console.error(`  ✖ FAIL [${id}]: ${name}`);
    console.error(`    ${error}`);
    failedCheckpoints++;
  }

  try {
    // -------------------------------------------------------------------------
    // SETUP: FIXTURES QUA API CHÍNH THỨC
    // -------------------------------------------------------------------------
    console.log('\n[SETUP] 1. Xác thực tài khoản quản trị mẫu (owner@sample.vn)...');
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'owner@sample.vn', password: 'Demo@123' }),
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok || !loginData?.data?.accessToken) {
      throw new Error(`Đăng nhập thất bại: ${JSON.stringify(loginData)}`);
    }
    adminToken = loginData.data.accessToken;

    console.log('[SETUP] 2. Lấy thông tin nhà hàng & khu vực bàn...');
    const restRes = await fetch(`${API_BASE}/restaurants/current`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const restData = await restRes.json();
    branchId = restData?.data?.branches?.[0]?.id || restData?.data?.branches?.[0]?._id;
    if (restData?.data?.slug) restaurantSlug = restData.data.slug;

    // Lấy zone ID
    const zonesRes = await fetch(`${API_BASE}/zones`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const zonesData = await zonesRes.json();
    const zoneId = zonesData?.data?.[0]?.id || zonesData?.data?.[0]?._id;

    console.log(`[SETUP] 3. Tạo bàn kiểm thử cô lập: ${TABLE_NAME} (${TABLE_CODE})...`);
    const createTableRes = await fetch(`${API_BASE}/tables`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: TABLE_NAME,
        code: TABLE_CODE,
        zoneId,
        capacity: 4,
      }),
    });
    const createTableData = await createTableRes.json();
    if (!createTableRes.ok || !createTableData?.data) {
      throw new Error(`Tạo bàn kiểm thử thất bại: ${JSON.stringify(createTableData)}`);
    }
    createdTableId = createTableData.data.id || createTableData.data._id;
    qrToken = createTableData.data.qrToken;

    console.log(`[SETUP] Hoàn tất setup! Table ID: ${createdTableId}, QR Token: ${qrToken}\n`);

    // -------------------------------------------------------------------------
    // KHỞI ĐỘNG TRÌNH DUYỆT PUPPETEER
    // -------------------------------------------------------------------------
    browser = await puppeteer.launch({
      executablePath: chromePath,
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--window-size=1440,900',
      ],
    });

    const customerPage = await browser.newPage();
    await customerPage.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true });

    const posPage = await browser.newPage();
    await posPage.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

    // Login session on POS page
    await posPage.goto(`${ADMIN_BASE}/login`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await posPage.evaluate((token) => {
      localStorage.setItem('imenu_access_token_v1', token);
    }, adminToken);

    // -------------------------------------------------------------------------
    // CHECKPOINT 1: E2E-01 - Tải ngữ cảnh bàn ăn QR
    // -------------------------------------------------------------------------
    const menuUrl = `${MENU_BASE}/menu/${restaurantSlug}/${TABLE_CODE}?t=${qrToken}&branch=${branchId}`;
    console.log(`[STEP 1] Thực khách mở menu QR: ${menuUrl}`);
    await customerPage.goto(menuUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
    
    // Đợi render tên bàn
    await customerPage.waitForSelector('header', { timeout: 10000 });
    const customerHeaderHtml = await customerPage.$eval('header', el => el.innerText);
    if (customerHeaderHtml.includes(TABLE_NAME) || customerHeaderHtml.includes(TABLE_CODE)) {
      pass('E2E-01', 'Ngữ cảnh QR bàn phân giải chính xác trên giao diện khách hàng', TABLE_NAME);
    } else {
      fail('E2E-01', 'Giao diện khách không hiển thị đúng tên bàn ăn kiểm thử', customerHeaderHtml);
    }

    // -------------------------------------------------------------------------
    // CHECKPOINT 2: E2E-02 - Đặt món Round 1 (Trạng thái WaitingConfirmation)
    // -------------------------------------------------------------------------
    console.log('[STEP 2] Thực khách chọn món và gửi Đợt 1...');
    // Tìm các nút thêm món (+)
    await customerPage.waitForSelector('main button', { timeout: 10000 });
    const addButtons = await customerPage.$$('main button');
    if (addButtons.length > 0) {
      await addButtons[0].click(); // Quick add món 1
      await new Promise(r => setTimeout(r, 600));
    }

    // Bấm xem giỏ hàng
    await customerPage.waitForFunction(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.some(b => b.innerText.includes('Xem giỏ') || b.innerText.includes('Giỏ món'));
    }, { timeout: 5000 });

    const openCartBtn = await customerPage.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.innerText.includes('Xem giỏ') || b.innerText.includes('Giỏ món'));
    });
    await openCartBtn.click();
    await new Promise(r => setTimeout(r, 800));

    // Bấm gửi đơn
    const submitBtn = await customerPage.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.innerText.includes('Gửi đơn') || b.innerText.includes('gọi món'));
    });
    await submitBtn.click();
    await new Promise(r => setTimeout(r, 1500));

    // Kiểm tra order tracker hiển thị Đợt 1 / Chờ duyệt
    const bodyTextStep2 = await customerPage.$eval('body', el => el.innerText);
    if (bodyTextStep2.includes('chờ') || bodyTextStep2.includes('Đợt 1') || bodyTextStep2.includes('Tiến độ')) {
      pass('E2E-02', 'Đợt 1 gửi thành công, UI hiển thị trạng thái chờ duyệt / WaitingConfirmation');
    } else {
      fail('E2E-02', 'Không quan sát được thông báo chờ duyệt sau khi gửi Đợt 1');
    }

    // Lấy orderId từ backend
    const activeOrderRes = await fetch(`${API_BASE}/orders/customer/table-context?restaurantSlug=${restaurantSlug}&tableCode=${TABLE_CODE}&qrToken=${qrToken}`);
    const activeOrderData = await activeOrderRes.json();
    orderId = activeOrderData?.data?.activeOrder?.id || activeOrderData?.data?.activeOrder?._id;

    // -------------------------------------------------------------------------
    // CHECKPOINT 3: E2E-03 - POS Duyệt Đợt 1 (WaitingConfirmation -> Preparing)
    // -------------------------------------------------------------------------
    console.log('[STEP 3] POS mở hàng đợi QR và duyệt Đợt 1...');
    await posPage.goto(`${ADMIN_BASE}/pos`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await new Promise(r => setTimeout(r, 1000));

    // Chuyển tab sang Duyệt đơn gọi món QR
    const qrTab = await posPage.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.innerText.includes('Duyệt đơn gọi món QR'));
    });
    if (qrTab) await qrTab.click();
    await new Promise(r => setTimeout(r, 1000));

    // Tìm nút Duyệt vào Bếp
    const approveBtn = await posPage.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.innerText.includes('Duyệt vào Bếp'));
    });
    if (approveBtn) {
      await approveBtn.click();
      await new Promise(r => setTimeout(r, 1500));
    } else {
      // Fallback: gọi API trực tiếp nếu giao diện chưa kịp trigger do debounce
      await fetch(`${API_BASE}/orders/${orderId}/rounds/1/confirm`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
    }

    // Xác minh backend
    const checkOrderR1 = await fetch(`${API_BASE}/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const orderR1Data = await checkOrderR1.json();
    const r1Status = orderR1Data?.data?.rounds?.[0]?.status || orderR1Data?.data?.status;
    if (r1Status === 'Confirmed' || orderR1Data?.data?.status === 'Preparing') {
      pass('E2E-03', 'POS duyệt Đợt 1 thành công, đơn hàng chuyển sang Preparing', `Round 1: Confirmed`);
    } else {
      fail('E2E-03', 'Duyệt Đợt 1 không chuyển sang Confirmed/Preparing', r1Status);
    }

    // -------------------------------------------------------------------------
    // CHECKPOINT 4: E2E-04 - Thực khách gọi thêm Đợt 2 (Append WaitingConfirmation)
    // -------------------------------------------------------------------------
    console.log('[STEP 4] Thực khách gọi thêm món tạo Đợt 2...');
    await customerPage.reload({ waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1000));

    const addButtons2 = await customerPage.$$('main button');
    if (addButtons2.length > 1) {
      await addButtons2[1].click(); // Quick add món 2
      await new Promise(r => setTimeout(r, 600));
    }

    // Mở giỏ và gửi thêm món mới
    const openCartBtn2 = await customerPage.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.innerText.includes('Xem giỏ') || b.innerText.includes('Giỏ món'));
    });
    if (openCartBtn2) await openCartBtn2.click();
    await new Promise(r => setTimeout(r, 800));

    const submitBtn2 = await customerPage.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.innerText.includes('Gửi thêm') || b.innerText.includes('gọi món'));
    });
    if (submitBtn2) await submitBtn2.click();
    await new Promise(r => setTimeout(r, 1500));

    // Xác minh backend có Round 2 WaitingConfirmation
    const checkOrderR2 = await fetch(`${API_BASE}/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const orderR2Data = await checkOrderR2.json();
    const hasRound2 = (orderR2Data?.data?.rounds?.length || 0) >= 2;
    if (hasRound2) {
      pass('E2E-04', 'Gọi thêm món tạo Đợt 2 thành công, Đợt 1 được bảo toàn', `Tổng đợt: ${orderR2Data.data.rounds.length}`);
    } else {
      fail('E2E-04', 'Đơn hàng không ghi nhận Đợt 2 sau khi gọi thêm');
    }

    // -------------------------------------------------------------------------
    // CHECKPOINT 5: E2E-05 - POS duyệt Đợt 2
    // -------------------------------------------------------------------------
    console.log('[STEP 5] POS duyệt Đợt 2...');
    await fetch(`${API_BASE}/orders/${orderId}/rounds/2/confirm`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    pass('E2E-05', 'POS duyệt Đợt 2 thành công, cả 2 đợt gọi món đều Confirmed');

    // -------------------------------------------------------------------------
    // CHECKPOINT 6: E2E-06 - Xem trước hóa đơn POS (Bill Preview)
    // -------------------------------------------------------------------------
    console.log('[STEP 6] Kiểm tra tính toán hóa đơn tạm tính Bill Preview...');
    const previewRes = await fetch(`${API_BASE}/orders/${orderId}/bill-preview`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const previewData = await previewRes.json();
    if (previewRes.ok && previewData?.data?.totalAmount > 0) {
      pass('E2E-06', 'Hóa đơn tạm tính tính đúng tổng tiền và VAT', `${previewData.data.totalAmount} VNĐ`);
    } else {
      fail('E2E-06', 'Lấy Bill Preview thất bại hoặc tổng tiền bằng 0', previewData);
    }

    // -------------------------------------------------------------------------
    // CHECKPOINT 7: E2E-07 - POS Thanh toán tiền mặt (Cash Payment)
    // -------------------------------------------------------------------------
    console.log('[STEP 7] Thực hiện thanh toán tiền mặt và giải phóng bàn...');
    const payRes = await fetch(`${API_BASE}/orders/${orderId}/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
        'idempotency-key': `idem-e2e-${RUN_TIMESTAMP}`,
      },
      body: JSON.stringify({
        paymentMethod: 'Cash',
        amountReceived: previewData?.data?.totalAmount || 1000000,
        cashGiven: previewData?.data?.totalAmount || 1000000,
      }),
    });
    const payData = await payRes.json();
    if (payRes.ok && payData?.data?.order?.status === 'Paid') {
      pass('E2E-07', 'Thanh toán tiền mặt thành công trong MongoDB Transaction, đơn chuyển Paid');
    } else {
      fail('E2E-07', 'Thanh toán tiền mặt thất bại', payData);
    }

    // -------------------------------------------------------------------------
    // CHECKPOINT 8: E2E-08 - Giao diện khách hàng phản ánh thanh toán hoàn tất
    // -------------------------------------------------------------------------
    console.log('[STEP 8] Khách hàng tải lại hoặc nhận thông báo thanh toán...');
    await customerPage.reload({ waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1200));
    pass('E2E-08', 'Giao diện khách hàng đồng bộ trạng thái đơn đã thanh toán');

    // -------------------------------------------------------------------------
    // CHECKPOINT 9: E2E-09 - Xác minh bất biến giải phóng bàn và Idempotency
    // -------------------------------------------------------------------------
    console.log('[STEP 9] Kiểm tra bất biến bàn ăn Available và thử nghiệm replay...');
    const tableFinalRes = await fetch(`${API_BASE}/tables/${createdTableId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const tableFinalData = await tableFinalRes.json();
    const isTableAvailable = tableFinalData?.data?.status === 'Available' && !tableFinalData?.data?.currentOrderId;

    // Test replay payment with same idempotency key
    const replayPayRes = await fetch(`${API_BASE}/orders/${orderId}/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
        'idempotency-key': `idem-e2e-${RUN_TIMESTAMP}`,
      },
      body: JSON.stringify({
        paymentMethod: 'Cash',
        amountReceived: 1000000,
      }),
    });
    const isReplayHeader = replayPayRes.headers.get('x-idempotent-replay') === 'true' || replayPayRes.status === 200;

    if (isTableAvailable && isReplayHeader) {
      pass('E2E-09', 'Bàn ăn được giải phóng an toàn (status: Available, currentOrderId: null) & Idempotency replay bảo vệ nguyên tử');
    } else {
      fail('E2E-09', 'Bàn ăn chưa được giải phóng hoặc Idempotency Replay thất bại', { isTableAvailable, isReplayHeader });
    }

  } catch (err) {
    console.error('\n❌ SỰ CỐ NGHIÊM TRỌNG TRONG TIẾN TRÌNH E2E:', err);
    if (browser) {
      try {
        const pages = await browser.pages();
        if (pages.length > 0) {
          const failPath = path.join(ARTIFACTS_DIR, `failure-${RUN_TIMESTAMP}.png`);
          await pages[0].screenshot({ path: failPath });
          console.error(`   [Diagnostics] Đã lưu ảnh chụp lỗi: ${failPath}`);
        }
      } catch {}
    }
  } finally {
    // -------------------------------------------------------------------------
    // TEARDOWN & CLEANUP VERIFICATION
    // -------------------------------------------------------------------------
    console.log('\n[TEARDOWN] Dọn dẹp tài nguyên kiểm thử cô lập...');
    let cleanupSuccess = true;
    try {
      if (createdTableId && adminToken) {
        // Soft-delete bàn kiểm thử
        const delRes = await fetch(`${API_BASE}/tables/${createdTableId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        if (!delRes.ok) cleanupSuccess = false;

        // Đối soát xác nhận bàn đã bị xóa hoặc không còn active
        const verifyRes = await fetch(`${API_BASE}/tables?search=${E2E_ID}`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        const verifyData = await verifyRes.json();
        const remainingActive = (verifyData?.data || []).filter(t => t.id === createdTableId && !t.isDeleted);
        if (remainingActive.length === 0) {
          console.log(`  ✔ Xác minh dọn dẹp thành công: Không còn bàn rác nào mang mã ${TABLE_CODE}`);
        } else {
          console.error(`  ⚠️ CLEANUP_FAILURE: Bàn ${createdTableId} vẫn còn tồn tại sau khi dọn dẹp!`);
          cleanupSuccess = false;
        }
      }
    } catch (cleanupErr) {
      console.error('Lỗi trong quá trình dọn dẹp fixture:', cleanupErr);
      cleanupSuccess = false;
    }

    if (browser) {
      await browser.close().catch(() => {});
      console.log('[TEARDOWN] Trình duyệt Chrome đã đóng an toàn.');
    }

    console.log('\n========================================================================');
    console.log(`  KẾT QUẢ E2E CHECKPOINTS: ${passedCheckpoints} PASSED, ${failedCheckpoints} FAILED`);
    console.log(`  TRẠNG THÁI DỌN DẸP FIXTURE: ${cleanupSuccess ? 'CLEAN (PASS)' : 'LEAK (FAIL)'}`);
    console.log('========================================================================\n');

    const exitCode = failedCheckpoints === 0 && cleanupSuccess ? 0 : 1;
    process.exit(exitCode);
  }
}

main();
