import { apiClient } from '../src/api-client';
import http from 'http';

interface CapturedRequest {
  method?: string;
  url?: string;
  headers: http.IncomingHttpHeaders;
  body: string;
}

async function runSdkContractTests() {
  console.log('========================================================================');
  console.log('  iMenu Frontend - Sub-phase 6.8: SDK Contract & Route Verification     ');
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;

  function pass(name: string, detail?: string) {
    console.log(`  ✔ PASS: ${name}${detail ? ` (${detail})` : ''}`);
  }

  function fail(name: string, detail?: any) {
    console.log(`  ✖ FAIL: ${name}`);
    if (detail) console.log('   ', JSON.stringify(detail));
  }

  let capturedRequests: CapturedRequest[] = [];
  const mockServer = http.createServer((req, res) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      capturedRequests.push({
        method: req.method,
        url: req.url,
        headers: req.headers,
        body,
      });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, data: { ok: true } }));
    });
  });

  const MOCK_PORT = 3108;
  await new Promise<void>((resolve) => {
    mockServer.listen(MOCK_PORT, () => resolve());
  });

  process.env.NEXT_PUBLIC_API_URL = `http://localhost:${MOCK_PORT}/api`;

  try {
    // -------------------------------------------------------------------------
    // TEST 1: customerOrders.getTableContext route verification
    // -------------------------------------------------------------------------
    capturedRequests = [];
    await apiClient.customerOrders.getTableContext({
      restaurantSlug: 'quan-an-ngon',
      tableCode: 'ban-1',
      qrToken: 'token-abc-123',
    });

    const req1 = capturedRequests[0];
    if (
      req1 &&
      req1.method === 'GET' &&
      req1.url?.includes('/api/orders/public/table-context') &&
      req1.url?.includes('restaurantSlug=quan-an-ngon') &&
      req1.url?.includes('tableCode=ban-1') &&
      req1.url?.includes('qrToken=token-abc-123')
    ) {
      pass('SDK-01: customerOrders.getTableContext map chính xác GET /api/orders/public/table-context với query parameters', req1.url);
      passed++;
    } else {
      fail('SDK-01: customerOrders.getTableContext sai URL', req1);
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 2: customerOrders.create route and idempotency-key header
    // -------------------------------------------------------------------------
    capturedRequests = [];
    await apiClient.customerOrders.create(
      {
        restaurantSlug: 'quan-an-ngon',
        tableCode: 'ban-1',
        qrToken: 'token-abc-123',
        items: [{ menuItemId: 'item-1', quantity: 2 }],
      },
      { idempotencyKey: 'idem-customer-order-001' },
    );

    const req2 = capturedRequests[0];
    const hasIdemHeader2 = req2?.headers['idempotency-key'] === 'idem-customer-order-001';
    
    // BACKEND EXPECTATION: Customer public ordering should hit /api/orders/customer (or /api/orders/public/customer)
    // SỐ LIỆU THỰC TẾ TRONG CODE: Đang gọi /api/orders (Staff endpoint)
    if (req2?.url === '/api/orders/customer' || req2?.url === '/api/orders/public/customer') {
      pass('SDK-02: customerOrders.create map chính xác public endpoint /api/orders/customer');
      passed++;
    } else {
      fail('SDK-02: customerOrders.create đang gọi sai endpoint (/api/orders thay vì /api/orders/customer)', {
        actualUrl: req2?.url,
        expectedUrl: '/api/orders/customer',
        headers: req2?.headers,
      });
      failed++;
    }

    if (hasIdemHeader2) {
      pass('SDK-02b: customerOrders.create truyền đúng header idempotency-key');
      passed++;
    } else {
      fail('SDK-02b: Thiếu header idempotency-key trong customerOrders.create', req2?.headers);
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 3: customerOrders.addItems route and idempotency-key header
    // -------------------------------------------------------------------------
    capturedRequests = [];
    await apiClient.customerOrders.addItems(
      'order-123',
      {
        restaurantSlug: 'quan-an-ngon',
        tableCode: 'ban-1',
        qrToken: 'token-abc-123',
        orderId: 'order-123',
        items: [{ menuItemId: 'item-2', quantity: 1 }],
      },
      { idempotencyKey: 'idem-customer-add-001' },
    );

    const req3 = capturedRequests[0];
    const hasIdemHeader3 = req3?.headers['idempotency-key'] === 'idem-customer-add-001';

    // BACKEND EXPECTATION: Customer public add items should hit /api/orders/customer/items or /api/orders/customer/:id/items
    // SỐ LIỆU THỰC TẾ TRONG CODE: Đang gọi /api/orders/order-123/items (Staff endpoint)
    if (
      req3?.url === '/api/orders/customer/items' ||
      req3?.url === '/api/orders/customer/order-123/items' ||
      req3?.url === '/api/orders/public/customer/items'
    ) {
      pass('SDK-03: customerOrders.addItems map chính xác public endpoint /api/orders/customer/items');
      passed++;
    } else {
      fail('SDK-03: customerOrders.addItems đang gọi sai endpoint (/api/orders/order-123/items thay vì /api/orders/customer/items)', {
        actualUrl: req3?.url,
        expectedUrl: '/api/orders/customer/items',
      });
      failed++;
    }

    if (hasIdemHeader3) {
      pass('SDK-03b: customerOrders.addItems truyền đúng header idempotency-key');
      passed++;
    } else {
      fail('SDK-03b: Thiếu header idempotency-key trong customerOrders.addItems', req3?.headers);
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 4: orders.previewBill route verification
    // -------------------------------------------------------------------------
    capturedRequests = [];
    await apiClient.orders.previewBill('order-456', {
      discountAmount: 15000,
      serviceFee: 5000,
      vatPercent: 8,
    });

    const req4 = capturedRequests[0];
    // BACKEND EXPECTATION: GET /api/orders/:id/bill-preview
    // SỐ LIỆU THỰC TẾ TRONG CODE: Đang gọi /api/orders/order-456/preview-bill
    if (req4?.url?.startsWith('/api/orders/order-456/bill-preview')) {
      pass('SDK-04: orders.previewBill map chính xác backend route /api/orders/:id/bill-preview');
      passed++;
    } else {
      fail('SDK-04: orders.previewBill sai URL (/api/orders/order-456/preview-bill thay vì /api/orders/order-456/bill-preview)', {
        actualUrl: req4?.url,
        expectedUrl: '/api/orders/order-456/bill-preview?discountAmount=15000&serviceFee=5000&vatPercent=8',
      });
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 5: orders.pay route & idempotency-key header
    // -------------------------------------------------------------------------
    capturedRequests = [];
    await apiClient.orders.pay(
      'order-456',
      {
        paymentMethod: 'Cash',
        amountReceived: 200000,
        cashGiven: 200000,
      },
      { idempotencyKey: 'idem-pay-001' },
    );

    const req5 = capturedRequests[0];
    if (
      req5?.url === '/api/orders/order-456/pay' &&
      req5?.headers['idempotency-key'] === 'idem-pay-001'
    ) {
      pass('SDK-05: orders.pay map chính xác POST /api/orders/:id/pay và truyền header idempotency-key');
      passed++;
    } else {
      fail('SDK-05: orders.pay sai URL hoặc thiếu idempotency header', req5);
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 6: Table Operations route verification (transfer, merge, moveItems)
    // -------------------------------------------------------------------------
    capturedRequests = [];
    await apiClient.tables.transfer({ fromTableId: 't1', toTableId: 't2', reason: 'Dời chỗ' });
    await apiClient.tables.merge({ fromTableIds: ['t1'], targetTableId: 't2', note: 'Gộp đoàn' });
    await apiClient.tables.moveItems({
      fromTableId: 't1',
      toTableId: 't2',
      items: [{ itemId: 'item-1', quantity: 1 }],
    });

    const [reqTransfer, reqMerge, reqMove] = capturedRequests;
    if (
      reqTransfer?.url === '/api/tables/transfer' &&
      reqMerge?.url === '/api/tables/merge' &&
      reqMove?.url === '/api/tables/move-items'
    ) {
      pass('SDK-06: Table Operations (/tables/transfer, /tables/merge, /tables/move-items) map chính xác backend routes');
      passed++;
    } else {
      fail('SDK-06: Table Operations routes không khớp backend', { reqTransfer, reqMerge, reqMove });
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 7: Round Management route verification (confirmRound, cancelRound)
    // -------------------------------------------------------------------------
    capturedRequests = [];
    await apiClient.orders.confirmRound('order-789', 2);
    await apiClient.orders.cancelRound('order-789', 2, 'Hết món');

    const [reqConfirmRound, reqCancelRound] = capturedRequests;
    if (
      reqConfirmRound?.url === '/api/orders/order-789/rounds/2/confirm' &&
      reqCancelRound?.url === '/api/orders/order-789/rounds/2/cancel'
    ) {
      pass('SDK-07: Round Confirmation (/orders/:id/rounds/:roundNumber/confirm, cancel) map chính xác backend routes');
      passed++;
    } else {
      fail('SDK-07: Round routes không khớp backend', { reqConfirmRound, reqCancelRound });
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 8: kitchen.getOrders route and query parameters verification
    // -------------------------------------------------------------------------
    capturedRequests = [];
    await apiClient.kitchen.getOrders({
      branchId: 'b-1',
      status: 'Cooking',
      search: 'Phở',
    });

    const reqKOrders = capturedRequests[0];
    if (
      reqKOrders?.method === 'GET' &&
      reqKOrders?.url?.includes('/api/kitchen/orders') &&
      reqKOrders?.url?.includes('branchId=b-1') &&
      reqKOrders?.url?.includes('status=Cooking') &&
      reqKOrders?.url?.includes('search=')
    ) {
      pass('SDK-08: kitchen.getOrders map chính xác GET /api/kitchen/orders với query parameters (branchId, status, search)');
      passed++;
    } else {
      fail('SDK-08: kitchen.getOrders sai route hoặc query params', reqKOrders);
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 9: kitchen.getItemsSummary route verification
    // -------------------------------------------------------------------------
    capturedRequests = [];
    await apiClient.kitchen.getItemsSummary({ branchId: 'b-1' });

    const reqKSummary = capturedRequests[0];
    if (
      reqKSummary?.method === 'GET' &&
      reqKSummary?.url === '/api/kitchen/items-summary?branchId=b-1'
    ) {
      pass('SDK-09: kitchen.getItemsSummary map chính xác GET /api/kitchen/items-summary?branchId=b-1');
      passed++;
    } else {
      fail('SDK-09: kitchen.getItemsSummary sai route', reqKSummary);
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 10: kitchen.startCookingItem dual routes (flat & nested)
    // -------------------------------------------------------------------------
    capturedRequests = [];
    await apiClient.kitchen.startCookingItem('item-101');
    await apiClient.kitchen.startCookingItem('item-101', 'order-202');

    const [reqCookFlat, reqCookNested] = capturedRequests;
    if (
      reqCookFlat?.method === 'POST' &&
      reqCookFlat?.url === '/api/order-items/item-101/start-cooking' &&
      reqCookNested?.method === 'POST' &&
      reqCookNested?.url === '/api/kitchen/orders/order-202/items/item-101/start-cooking'
    ) {
      pass('SDK-10: kitchen.startCookingItem hỗ trợ cả Flat route (/order-items/:id/start-cooking) và Nested route');
      passed++;
    } else {
      fail('SDK-10: kitchen.startCookingItem sai route', { reqCookFlat, reqCookNested });
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 11: kitchen.markItemReady & markItemServed routes
    // -------------------------------------------------------------------------
    capturedRequests = [];
    await apiClient.kitchen.markItemReady('item-101');
    await apiClient.kitchen.markItemServed('item-101');

    const [reqReady, reqServed] = capturedRequests;
    if (
      reqReady?.method === 'POST' &&
      reqReady?.url === '/api/order-items/item-101/mark-ready' &&
      reqServed?.method === 'POST' &&
      reqServed?.url === '/api/order-items/item-101/mark-served'
    ) {
      pass('SDK-11: kitchen.markItemReady & markItemServed map chính xác POST /api/order-items/:id/mark-ready và mark-served');
      passed++;
    } else {
      fail('SDK-11: kitchen markItemReady/Served sai route', { reqReady, reqServed });
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 12: kitchen.startCookingAll, markReadyAll & toggleItemAvailability
    // -------------------------------------------------------------------------
    capturedRequests = [];
    await apiClient.kitchen.startCookingAll('order-303', 2);
    await apiClient.kitchen.markReadyAll('order-303');
    await apiClient.kitchen.toggleItemAvailability('item-505', false, 'branch-999');

    const [reqBatchCook, reqBatchReady, reqToggleAvail] = capturedRequests;
    const bodyBatchCook = JSON.parse(reqBatchCook?.body || '{}');
    const bodyToggle = JSON.parse(reqToggleAvail?.body || '{}');

    if (
      reqBatchCook?.method === 'POST' &&
      reqBatchCook?.url === '/api/kitchen/orders/order-303/start-cooking-all' &&
      bodyBatchCook.roundNumber === 2 &&
      reqBatchReady?.method === 'POST' &&
      reqBatchReady?.url === '/api/kitchen/orders/order-303/mark-ready-all' &&
      reqToggleAvail?.method === 'PATCH' &&
      reqToggleAvail?.url === '/api/kitchen/menu-items/item-505/availability' &&
      bodyToggle.isAvailable === false &&
      bodyToggle.branchId === 'branch-999'
    ) {
      pass('SDK-12: kitchen.startCookingAll, markReadyAll & toggleItemAvailability map chính xác POST batch và PATCH availability với branchId');
      passed++;
    } else {
      fail('SDK-12: batch / availability methods sai route hoặc body', { reqBatchCook, reqBatchReady, reqToggleAvail });
      failed++;
    }

  } finally {
    await new Promise<void>((resolve) => mockServer.close(() => resolve()));
  }

  console.log('\n----------------------------------------------------------------');
  console.log(`Kết quả kiểm thử Frontend SDK Contract: ${passed} passed, ${failed} failed`);
  console.log('----------------------------------------------------------------\n');

  process.exitCode = failed > 0 ? 1 : 0;
}

runSdkContractTests();
