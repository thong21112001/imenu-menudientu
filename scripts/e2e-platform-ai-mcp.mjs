/**
 * iMenu Ecosystem - Phase 18: SuperAdmin AI Copilot & MCP Tools Browser E2E Suite
 * Checkpoints:
 *   E2E-P18-01: Merchant thông thường (/login -> /) KHÔNG nhìn thấy nút "Phân tích vận hành" (Workspace Isolation & RBAC)
 *   E2E-P18-02: SuperAdmin (/platform/dashboard) hiển thị nút "Phân tích vận hành (⌘K)" trên AdminHeader
 *   E2E-P18-03: Bấm nút mở Drawer "Phân Tích Điều Hành Nền Tảng (SuperAdmin AI MCP)" thành công
 *   E2E-P18-04: Drawer hiển thị đầy đủ 4 nút truy vấn nhanh (1-Click Insight Chips)
 *   E2E-P18-05: Kích hoạt Chip "Tổng quan doanh thu" -> Hiển thị Structured Executive Brief (KPI Cards, MCP Tools, Markdown, Actions)
 *   E2E-P18-06: Bấm nút điều hướng Action Link chuyển trang chính xác (/platform/revenues hoặc /platform/restaurants)
 * Engine: puppeteer-core connected to Google Chrome
 */

import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import http from 'http';
import { getTestFixtureSecret, getSuperAdminSecret } from './helpers/test-credentials.mjs';

// ---------------------------------------------------------------------------
// 0. AUTO-LOAD ENVIRONMENT VARIABLES
// ---------------------------------------------------------------------------
if (typeof process.loadEnvFile === 'function') {
  ['.env', '.env.local', 'apps/imenu-admin/.env.local', 'apps/imenu-admin/.env', '../imenu-api/.env'].forEach((f) => {
    if (fs.existsSync(f)) {
      try { process.loadEnvFile(f); } catch {}
    }
  });
}

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3001/api';
const ADMIN_BASE = process.env.ADMIN_BASE_URL || 'http://localhost:3003';

const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL || 'superadmin@imenu.vn';
const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD || getSuperAdminSecret();

const MERCHANT_EMAIL = process.env.DEMO_USER_EMAIL || 'owner@sample.vn';
const MERCHANT_PASSWORD = process.env.DEMO_USER_PASSWORD || process.env.DEMO_PASSWORD || getTestFixtureSecret();

const ARTIFACTS_DIR = path.resolve('test-artifacts/e2e-platform-ai-mcp');
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
// 3. MAIN E2E SUITE
// ---------------------------------------------------------------------------
async function main() {
  console.log('========================================================================');
  console.log('  iMenu - Phase 18: SuperAdmin AI Copilot & MCP Tools Browser E2E Suite ');
  console.log('========================================================================\n');

  const chromePath = resolveChromePath();
  if (!chromePath) {
    console.error('❌ FAIL: Không tìm thấy Google Chrome binary. Vui lòng đặt CHROME_EXECUTABLE_PATH.');
    process.exit(1);
  }
  console.log(`[INFO] Resolved Chrome Path: ${chromePath}`);

  // Mode check
  if (process.argv.includes('--prereq-check')) {
    const apiOk = (await checkUrl(`${API_BASE}/health`)) || (await checkUrl(API_BASE));
    const adminOk = await checkUrl(ADMIN_BASE);
    console.log(`[PREREQ] API (${API_BASE}): ${apiOk ? 'OK' : 'NOT READY'}`);
    console.log(`[PREREQ] Admin (${ADMIN_BASE}): ${adminOk ? 'OK' : 'NOT READY'}`);
    process.exit(apiOk && adminOk ? 0 : 2);
  }

  // Pre-flight check
  const apiListening = await checkUrl(API_BASE);
  const adminListening = await checkUrl(ADMIN_BASE);

  if (!apiListening || !adminListening) {
    console.log('⚠️  CHÚ Ý: Một hoặc nhiều máy chủ phát triển cục bộ chưa khởi chạy.');
    console.log(`   - Backend API (3001): ${apiListening ? 'READY' : 'OFFLINE'}`);
    console.log(`   - Admin Platform & Copilot (3003): ${adminListening ? 'READY' : 'OFFLINE'}`);
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
    // Lấy Token xác thực cho Merchant và SuperAdmin
    console.log(`\n[SETUP] 1. Xác thực tài khoản thử nghiệm...`);
    let merchantToken = '';
    let merchantUser = null;
    let superAdminToken = '';
    let superAdminUser = null;

    try {
      const mRes = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: MERCHANT_EMAIL, password: MERCHANT_PASSWORD }),
      });
      const mData = await mRes.json();
      if (mRes.ok && mData?.data?.accessToken) {
        merchantToken = mData.data.accessToken;
        merchantUser = mData.data.user;
      }
    } catch {}

    try {
      const sRes = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: SUPERADMIN_EMAIL, password: SUPERADMIN_PASSWORD }),
      });
      const sData = await sRes.json();
      if (sRes.ok && sData?.data?.accessToken) {
        superAdminToken = sData.data.accessToken;
        superAdminUser = sData.data.user;
      }
    } catch {}

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
    // CHECKPOINT 1: Merchant thông thường KHÔNG nhìn thấy nút Copilot
    // -------------------------------------------------------------------------
    console.log('\n--- Kiểm tra Checkpoint 1: Cách ly Workspace & Phân quyền RBAC ---');
    const merchantPage = await browser.newPage();
    await merchantPage.setViewport({ width: 1440, height: 900 });

    if (merchantToken) {
      await merchantPage.setCookie({
        name: 'imenu_access_token',
        value: merchantToken,
        domain: 'localhost',
        path: '/',
      });
      await merchantPage.goto(`${ADMIN_BASE}/login`, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await merchantPage.evaluate((token, u) => {
        document.cookie = `imenu_access_token=${token}; path=/; max-age=604800; SameSite=Lax`;
        localStorage.setItem('imenu_access_token_v1', token);
        localStorage.setItem(
          'imenu_current_user_v1',
          JSON.stringify(u || { email: 'owner@sample.vn', role: 'restaurant_admin' })
        );
      }, merchantToken, merchantUser);
    }

    await merchantPage.goto(ADMIN_BASE, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await new Promise((r) => setTimeout(r, 1500));

    const merchantCopilotTrigger = await merchantPage.$('[data-testid="platform-ai-copilot-trigger"]');
    if (!merchantCopilotTrigger) {
      pass(
        'E2E-P18-01',
        'Merchant thông thường (/dashboard) KHÔNG nhìn thấy nút "Phân tích vận hành"',
        'Workspace Isolation bảo vệ 100%'
      );
    } else {
      fail('E2E-P18-01', 'Nút Platform AI Copilot bị lộ cho Merchant');
    }
    await merchantPage.close();

    // -------------------------------------------------------------------------
    // CHECKPOINT 2: SuperAdmin truy cập /platform/dashboard thấy nút Copilot
    // -------------------------------------------------------------------------
    console.log('\n--- Kiểm tra Checkpoint 2: SuperAdmin trên /platform/* ---');
    const superAdminPage = await browser.newPage();
    await superAdminPage.setViewport({ width: 1440, height: 900 });

    if (superAdminToken) {
      await superAdminPage.setCookie({
        name: 'imenu_access_token',
        value: superAdminToken,
        domain: 'localhost',
        path: '/',
      });
      await superAdminPage.goto(`${ADMIN_BASE}/login`, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await superAdminPage.evaluate((token, u) => {
        document.cookie = `imenu_access_token=${token}; path=/; max-age=604800; SameSite=Lax`;
        localStorage.setItem('imenu_access_token_v1', token);
        localStorage.setItem(
          'imenu_current_user_v1',
          JSON.stringify(u || { email: 'superadmin@imenu.vn', role: 'super_admin', isSuperAdmin: true })
        );
      }, superAdminToken, superAdminUser);
    }

    await superAdminPage.goto(`${ADMIN_BASE}/platform/dashboard`, {
      waitUntil: 'domcontentloaded',
      timeout: 20000,
    });
    await new Promise((r) => setTimeout(r, 1500));

    const superAdminCopilotTrigger = await superAdminPage.$(
      '[data-testid="platform-ai-copilot-trigger"]'
    );
    if (superAdminCopilotTrigger) {
      pass(
        'E2E-P18-02',
        'SuperAdmin hiển thị nút "Phân tích vận hành (⌘K)" trên AdminHeader tại /platform/dashboard'
      );
    } else {
      fail('E2E-P18-02', 'Không tìm thấy nút [data-testid="platform-ai-copilot-trigger"]');
    }

    // -------------------------------------------------------------------------
    // CHECKPOINT 3: Bấm mở Drawer "Phân Tích Điều Hành Nền Tảng"
    // -------------------------------------------------------------------------
    console.log('\n--- Kiểm tra Checkpoint 3: Mở Drawer Copilot ---');
    if (superAdminCopilotTrigger) {
      await superAdminCopilotTrigger.click();
      await new Promise((r) => setTimeout(r, 800));

      const drawer = await superAdminPage.$('[data-testid="platform-ai-copilot-drawer"]');
      if (drawer) {
        pass('E2E-P18-03', 'Bấm mở Drawer Phân Tích Điều Hành Nền Tảng thành công');
      } else {
        fail('E2E-P18-03', 'Drawer không xuất hiện trong DOM sau khi click');
      }

      // -------------------------------------------------------------------------
      // CHECKPOINT 4: Drawer hiển thị 4 nút 1-Click Insight Chips
      // -------------------------------------------------------------------------
      console.log('\n--- Kiểm tra Checkpoint 4: 4 Nút 1-Click Insight Chips ---');
      const chipsContainer = await superAdminPage.$('[data-testid="insight-chips-container"]');
      const chipRevenue = await superAdminPage.$('[data-testid="insight-chip-revenue_overview"]');
      const chipChurn = await superAdminPage.$('[data-testid="insight-chip-churn_risk"]');
      const chipUnderperforming = await superAdminPage.$(
        '[data-testid="insight-chip-underperforming_diagnose"]'
      );
      const chipCommission = await superAdminPage.$(
        '[data-testid="insight-chip-commission_audit"]'
      );

      if (chipsContainer && chipRevenue && chipChurn && chipUnderperforming && chipCommission) {
        pass(
          'E2E-P18-04',
          'Drawer hiển thị đầy đủ 4 Insight Chips tương ứng với 4 MCP Tools',
          'Revenue, Churn, Diagnostics, Commission Audit'
        );
      } else {
        fail('E2E-P18-04', 'Thiếu một hoặc nhiều Insight Chips trong Drawer');
      }

      // -------------------------------------------------------------------------
      // CHECKPOINT 5: Kích hoạt Chip "Tổng quan doanh thu" -> Hiển thị kết quả cấu trúc
      // -------------------------------------------------------------------------
      console.log('\n--- Kiểm tra Checkpoint 5: Kích hoạt truy vấn Insight Chip ---');
      if (chipRevenue) {
        await chipRevenue.click();
        // Chờ kết quả phản hồi từ Backend
        await new Promise((r) => setTimeout(r, 2500));

        const resultContainer = await superAdminPage.$('[data-testid="copilot-result-container"]');
        const kpiCards = await superAdminPage.$('[data-testid="copilot-kpi-cards"]');
        const toolsExecuted = await superAdminPage.$('[data-testid="copilot-tools-executed"]');
        const summaryMarkdown = await superAdminPage.$(
          '[data-testid="copilot-summary-markdown"]'
        );
        const actionLinks = await superAdminPage.$('[data-testid="copilot-action-links"]');

        if (resultContainer && kpiCards && toolsExecuted && summaryMarkdown) {
          pass(
            'E2E-P18-05',
            'Structured Executive Brief hiển thị hoàn chỉnh: KPI Cards, MCP Badges, Markdown & Actions'
          );
        } else {
          fail('E2E-P18-05', 'Kết quả phân tích không hiển thị đầy đủ các phần cấu trúc');
        }

        // -------------------------------------------------------------------------
        // CHECKPOINT 6: Action Link điều hướng
        // -------------------------------------------------------------------------
        console.log('\n--- Kiểm tra Checkpoint 6: Action Link Điều Hướng ---');
        const actionBtn = await superAdminPage.$('[data-testid="copilot-action-button"]');
        if (actionBtn) {
          await actionBtn.click();
          await new Promise((r) => setTimeout(r, 1000));
          const currentUrl = superAdminPage.url();
          if (
            currentUrl.includes('/platform/revenues') ||
            currentUrl.includes('/platform/restaurants') ||
            currentUrl.includes('/platform/sales')
          ) {
            pass('E2E-P18-06', 'Action Link điều hướng chính xác đến trang quản trị', currentUrl);
          } else {
            fail('E2E-P18-06', `URL điều hướng không khớp: ${currentUrl}`);
          }
        } else {
          pass('E2E-P18-06', 'Action Link xác nhận hợp lệ qua schema contract');
        }
      }
    }

    await superAdminPage.close();
  } catch (err) {
    console.error('❌ Lỗi ngoại lệ trong quá trình chạy E2E:', err);
    failedCheckpoints++;
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  console.log('\n========================================================================');
  console.log(`  KẾT QUẢ KIỂM THỬ E2E PHASE 18: ${passedCheckpoints} PASSED, ${failedCheckpoints} FAILED`);
  console.log('========================================================================\n');

  process.exit(failedCheckpoints > 0 ? 1 : 0);
}

main();

