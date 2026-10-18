import { apiClient } from '../src/api-client';
import { buildReceiptData, renderReceiptToPngDataUrl, downloadReceiptAsPng } from '../src/receipt';
import { EscPosEncoder, stripAccents, thermalPrinterService } from '../src/escpos';
import { generateVietQRMemo, maskBankAccount } from '../src/vietqr';
import http from 'http';

interface CapturedRequest {
  method?: string;
  url?: string;
  headers: http.IncomingHttpHeaders;
  body: string;
}

async function runSdkContractTests() {
  console.log('========================================================================');
  console.log('  iMenu Frontend - Phase 8: SDK Contract & ESC/POS Route Verification   ');
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

    // =========================================================================
    // PHASE 8: PAYMENT, BILL & HARDWARE THERMAL PRINTER TESTS
    // =========================================================================

    // -------------------------------------------------------------------------
    // TEST 13: orders.completePayment route & idempotency-key header
    // -------------------------------------------------------------------------
    capturedRequests = [];
    await apiClient.orders.completePayment(
      'order-complete-001',
      { paymentMethod: 'VietQR', amountReceived: 350000 },
      { idempotencyKey: 'idem-complete-key-999' },
    );

    const reqComplete = capturedRequests[0];
    if (
      reqComplete?.method === 'POST' &&
      reqComplete?.url === '/api/orders/order-complete-001/complete-payment' &&
      reqComplete?.headers['idempotency-key'] === 'idem-complete-key-999'
    ) {
      pass('SDK-13: orders.completePayment map chính xác POST /api/orders/:id/complete-payment và truyền header idempotency-key');
      passed++;
    } else {
      fail('SDK-13: orders.completePayment sai route hoặc thiếu header', reqComplete);
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 14: orders.getReceipt route & query params
    // -------------------------------------------------------------------------
    capturedRequests = [];
    await apiClient.orders.getReceipt('order-receipt-001', {
      discountAmount: 20000,
      vatPercent: 8,
    });

    const reqReceipt = capturedRequests[0];
    if (
      reqReceipt?.method === 'GET' &&
      reqReceipt?.url?.startsWith('/api/orders/order-receipt-001/receipt') &&
      reqReceipt?.url?.includes('discountAmount=20000') &&
      reqReceipt?.url?.includes('vatPercent=8')
    ) {
      pass('SDK-14: orders.getReceipt map chính xác GET /api/orders/:id/receipt kèm query parameters');
      passed++;
    } else {
      fail('SDK-14: orders.getReceipt sai route', reqReceipt);
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 15: orders.getVietQr route
    // -------------------------------------------------------------------------
    capturedRequests = [];
    await apiClient.orders.getVietQr('order-vietqr-001');

    const reqVietQr = capturedRequests[0];
    if (
      reqVietQr?.method === 'GET' &&
      reqVietQr?.url === '/api/orders/order-vietqr-001/vietqr'
    ) {
      pass('SDK-15: orders.getVietQr map chính xác GET /api/orders/:id/vietqr');
      passed++;
    } else {
      fail('SDK-15: orders.getVietQr sai route', reqVietQr);
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 16: customerOrders.requestPayment route & body
    // -------------------------------------------------------------------------
    capturedRequests = [];
    await apiClient.customerOrders.requestPayment('order-cust-001', {
      restaurantSlug: 'pho-viet',
      tableCode: 'ban-05',
      qrToken: 'token-xyz-789',
      paymentMethod: 'VietQR',
    });

    const reqCustPayReq = capturedRequests[0];
    const bodyCustPayReq = JSON.parse(reqCustPayReq?.body || '{}');
    if (
      reqCustPayReq?.method === 'POST' &&
      reqCustPayReq?.url === '/api/orders/customer/order-cust-001/request-payment' &&
      bodyCustPayReq.paymentMethod === 'VietQR' &&
      bodyCustPayReq.tableCode === 'ban-05'
    ) {
      pass('SDK-16: customerOrders.requestPayment map chính xác POST /api/orders/customer/:id/request-payment kèm body');
      passed++;
    } else {
      fail('SDK-16: customerOrders.requestPayment sai route hoặc body', reqCustPayReq);
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 17: customerOrders.getVietQr route & params
    // -------------------------------------------------------------------------
    capturedRequests = [];
    await apiClient.customerOrders.getVietQr('order-cust-002', {
      restaurantSlug: 'pho-viet',
      tableCode: 'ban-05',
      qrToken: 'token-xyz-789',
    });

    const reqCustQr = capturedRequests[0];
    if (
      reqCustQr?.method === 'GET' &&
      reqCustQr?.url?.startsWith('/api/orders/customer/order-cust-002/vietqr') &&
      reqCustQr?.url?.includes('restaurantSlug=pho-viet') &&
      reqCustQr?.url?.includes('tableCode=ban-05')
    ) {
      pass('SDK-17: customerOrders.getVietQr map chính xác GET /api/orders/customer/:id/vietqr kèm query credentials');
      passed++;
    } else {
      fail('SDK-17: customerOrders.getVietQr sai route', reqCustQr);
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 18: customerOrders.getReceipt route & params
    // -------------------------------------------------------------------------
    capturedRequests = [];
    await apiClient.customerOrders.getReceipt('order-cust-003', {
      restaurantSlug: 'pho-viet',
      tableCode: 'ban-05',
      qrToken: 'token-xyz-789',
    });

    const reqCustReceipt = capturedRequests[0];
    if (
      reqCustReceipt?.method === 'GET' &&
      reqCustReceipt?.url?.startsWith('/api/orders/customer/order-cust-003/receipt') &&
      reqCustReceipt?.url?.includes('restaurantSlug=pho-viet') &&
      reqCustReceipt?.url?.includes('tableCode=ban-05')
    ) {
      pass('SDK-18: customerOrders.getReceipt map chính xác GET /api/orders/customer/:id/receipt kèm query credentials');
      passed++;
    } else {
      fail('SDK-18: customerOrders.getReceipt sai route', reqCustReceipt);
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 19: bills.list route & filter parameters
    // -------------------------------------------------------------------------
    capturedRequests = [];
    await apiClient.bills.list({
      branchId: 'branch-01',
      paymentMethod: 'VietQR',
      paymentStatus: 'PAID',
      search: 'BILL-261015',
      page: 1,
      limit: 20,
    });

    const reqBillsList = capturedRequests[0];
    if (
      reqBillsList?.method === 'GET' &&
      reqBillsList?.url?.startsWith('/api/bills') &&
      reqBillsList?.url?.includes('branchId=branch-01') &&
      reqBillsList?.url?.includes('paymentMethod=VietQR') &&
      reqBillsList?.url?.includes('paymentStatus=PAID') &&
      reqBillsList?.url?.includes('search=BILL-261015')
    ) {
      pass('SDK-19: bills.list map chính xác GET /api/bills kèm các bộ lọc phân trang và điều kiện');
      passed++;
    } else {
      fail('SDK-19: bills.list sai route', reqBillsList);
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 20: bills.get & bills.getByOrder routes
    // -------------------------------------------------------------------------
    capturedRequests = [];
    await apiClient.bills.get('bill-001');
    await apiClient.bills.getByOrder('order-001');

    const [reqBillGet, reqBillByOrder] = capturedRequests;
    if (
      reqBillGet?.method === 'GET' &&
      reqBillGet?.url === '/api/bills/bill-001' &&
      reqBillByOrder?.method === 'GET' &&
      reqBillByOrder?.url === '/api/bills/by-order/order-001'
    ) {
      pass('SDK-20: bills.get & bills.getByOrder map chính xác GET /api/bills/:id và GET /api/bills/by-order/:orderId');
      passed++;
    } else {
      fail('SDK-20: bills.get / byOrder sai route', { reqBillGet, reqBillByOrder });
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 21: bills.logPrint route & POST method
    // -------------------------------------------------------------------------
    capturedRequests = [];
    await apiClient.bills.logPrint('bill-001');

    const reqBillPrint = capturedRequests[0];
    if (
      reqBillPrint?.method === 'POST' &&
      reqBillPrint?.url === '/api/bills/bill-001/print'
    ) {
      pass('SDK-21: bills.logPrint map chính xác POST /api/bills/:id/print');
      passed++;
    } else {
      fail('SDK-21: bills.logPrint sai route', reqBillPrint);
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 22: activityLogs.list route & filter query params
    // -------------------------------------------------------------------------
    capturedRequests = [];
    await apiClient.activityLogs.list({
      module: 'PAYMENT',
      action: 'PAYMENT_COMPLETED',
      branchId: 'branch-01',
      page: 1,
      limit: 10,
    });

    const reqActList = capturedRequests[0];
    if (
      reqActList?.method === 'GET' &&
      reqActList?.url?.startsWith('/api/activity-logs') &&
      reqActList?.url?.includes('module=PAYMENT') &&
      reqActList?.url?.includes('action=PAYMENT_COMPLETED') &&
      reqActList?.url?.includes('branchId=branch-01')
    ) {
      pass('SDK-22: activityLogs.list map chính xác GET /api/activity-logs kèm bộ lọc kiểm toán tài chính');
      passed++;
    } else {
      fail('SDK-22: activityLogs.list sai route', reqActList);
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 23: buildReceiptData Unit Tests (Cancelled Items, Option Notes, Bank Hierarchy)
    // -------------------------------------------------------------------------
    const mockOrder: any = {
      orderCode: 'ORD-20261015-088',
      tableName: 'Ban 08',
      branchId: 'branch-hb',
      items: [
        {
          id: 'item-1',
          name: 'Phở bò tái nạm',
          price: 65000,
          quantity: 2,
          itemTotal: 130000,
          status: 'Served',
          selectedOptions: [
            { groupId: 'size', groupName: 'Size', valueId: 'l', valueName: 'Tô lớn', priceDelta: 15000 },
            { groupId: 'spice', groupName: 'Độ cay', valueId: 'hot', valueName: 'Cay nhiều', priceDelta: 0 },
          ],
        },
        {
          id: 'item-2',
          name: 'Nước ngọt có gas',
          price: 20000,
          quantity: 1,
          itemTotal: 20000,
          status: 'Cancelled', // PHẢI BỊ LOẠI TRỪ KHỎI RECEIPT
        },
      ],
      subTotal: 130000,
      discountAmount: 10000,
      vatAmount: 9600,
      vatPercent: 8,
      totalAmount: 129600,
      paymentMethod: 'Cash',
      amountReceived: 150000,
      changeAmount: 20400,
      status: 'Paid',
      isPaid: true,
    };

    const mockRestaurant: any = {
      name: 'Nhà Hàng Phở Việt',
      tagline: 'Vị Phở Truyền Thống Hà Nội',
      address: '123 Hoàng Mai, Hà Nội',
      phone: '0901234567',
      bankAccount: {
        bankId: 'VCB',
        bankName: 'Vietcombank',
        accountNo: '001100223344',
        accountName: 'CONG TY PHO VIET',
      },
      branches: [
        {
          id: 'branch-hb',
          name: 'Chi Nhánh Hai Bà Trưng',
          address: '456 Phố Huế, Hai Bà Trưng',
          phone: '0988776655',
          bankAccount: {
            bankId: 'MB',
            bankName: 'MBBank',
            accountNo: '999988887777',
            accountName: 'PHO VIET HAI BA TRUNG',
          },
        },
      ],
    };

    const receiptData = buildReceiptData(mockOrder, mockRestaurant);

    const hasCancelledItem = receiptData.items.some((i) => i.name === 'Nước ngọt có gas');
    const optionNoteCorrect = receiptData.items[0]?.selectedOptionsNote === 'Tô lớn (+15.000đ), Cay nhiều';
    const bankResolvedToBranch =
      receiptData.paymentQr?.bankName === 'MBBank' &&
      receiptData.paymentQr?.accountNo === '999988887777';

    if (!hasCancelledItem && optionNoteCorrect && bankResolvedToBranch && receiptData.metadata.receiptType === 'FINAL_BILL') {
      pass('SDK-23: buildReceiptData lọc bỏ 100% món Cancelled, tổng hợp option note và phân giải đúng ngân hàng chi nhánh');
      passed++;
    } else {
      fail('SDK-23: buildReceiptData trả về dữ liệu chưa chính xác', {
        hasCancelledItem,
        optionNoteCorrect,
        bankResolvedToBranch,
        receiptData,
      });
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 24: EscPosEncoder Unit Tests (ASCII Strip, Cash Drawer, Cut, QR)
    // -------------------------------------------------------------------------
    const strippedStr = stripAccents('Phở Bò Tái Nạm, Trà Sữa Đào 100% Đường 50% Đá!');
    const encoder = new EscPosEncoder('80mm');
    const encodedBuffer = encoder.encodeReceipt(receiptData, { kickDrawerOnCash: true });

    // Kiểm tra các opcode ESC/POS quan trọng:
    // 1. Kick Drawer: 1B 70 00 19 FA (27, 112, 0, 25, 250)
    // 2. Cut: 1D 56 42 00 (29, 86, 66, 0)
    let hasKickDrawer = false;
    let hasCutPaper = false;

    for (let i = 0; i <= encodedBuffer.length - 4; i++) {
      if (
        encodedBuffer[i] === 0x1b &&
        encodedBuffer[i + 1] === 0x70 &&
        encodedBuffer[i + 2] === 0x00 &&
        encodedBuffer[i + 3] === 0x19 &&
        encodedBuffer[i + 4] === 0xfa
      ) {
        hasKickDrawer = true;
      }
      if (
        encodedBuffer[i] === 0x1d &&
        encodedBuffer[i + 1] === 0x56 &&
        encodedBuffer[i + 2] === 0x42 &&
        encodedBuffer[i + 3] === 0x00
      ) {
        hasCutPaper = true;
      }
    }

    if (
      strippedStr === 'Pho Bo Tai Nam, Tra Sua Dao 100% Duong 50% Da!' &&
      hasKickDrawer &&
      hasCutPaper &&
      encodedBuffer.length > 500
    ) {
      pass('SDK-24: EscPosEncoder mã hóa chuẩn xác đặc tả 80mm ESC/POS (tẩy dấu tiếng Việt, kick drawer khi thanh toán Cash, cắt giấy partial cut)');
      passed++;
    } else {
      fail('SDK-24: EscPosEncoder thiếu opcode hoặc tẩy dấu sai', {
        strippedStr,
        hasKickDrawer,
        hasCutPaper,
        bufferLength: encodedBuffer.length,
      });
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 25: thermalPrinterService.generatePrintPayload Unit Test
    // -------------------------------------------------------------------------
    const printPayload = thermalPrinterService.generatePrintPayload(receiptData);
    if (
      printPayload.buffer instanceof Uint8Array &&
      typeof printPayload.base64 === 'string' &&
      printPayload.base64.length > 0 &&
      typeof printPayload.hex === 'string' &&
      printPayload.hex.includes('1B 40') &&
      typeof printPayload.textPreview === 'string' &&
      printPayload.textPreview.includes('HOA DON THANH TOAN')
    ) {
      pass('SDK-25: thermalPrinterService.generatePrintPayload sinh đầy đủ buffer Uint8Array, base64, hex và textPreview');
      passed++;
    } else {
      fail('SDK-25: thermalPrinterService.generatePrintPayload trả về thiếu trường', printPayload);
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 26: Phase 9 - dashboard.getOverview route & query params
    // -------------------------------------------------------------------------
    capturedRequests = [];
    await apiClient.dashboard.getOverview({ branchId: 'branch-01', date: '2026-10-16' });

    const reqDash = capturedRequests[0];
    if (
      reqDash?.method === 'GET' &&
      reqDash?.url?.startsWith('/api/dashboard/overview') &&
      reqDash?.url?.includes('branchId=branch-01') &&
      reqDash?.url?.includes('date=2026-10-16')
    ) {
      pass('SDK-26: dashboard.getOverview map chính xác GET /api/dashboard/overview?branchId=...&date=...');
      passed++;
    } else {
      fail('SDK-26: dashboard.getOverview sai route hoặc query params', reqDash);
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 27: Phase 9 - reports.getRevenue route & query params
    // -------------------------------------------------------------------------
    capturedRequests = [];
    await apiClient.reports.getRevenue({
      startDate: '2026-10-01',
      endDate: '2026-10-16',
      period: 'daily',
      groupBy: 'day',
      branchId: 'branch-01',
    });

    const reqRepRev = capturedRequests[0];
    if (
      reqRepRev?.method === 'GET' &&
      reqRepRev?.url?.startsWith('/api/reports/revenue') &&
      reqRepRev?.url?.includes('startDate=2026-10-01') &&
      reqRepRev?.url?.includes('endDate=2026-10-16') &&
      reqRepRev?.url?.includes('groupBy=day') &&
      reqRepRev?.url?.includes('branchId=branch-01')
    ) {
      pass('SDK-27: reports.getRevenue map chính xác GET /api/reports/revenue với đầy đủ filters');
      passed++;
    } else {
      fail('SDK-27: reports.getRevenue sai route hoặc filters', reqRepRev);
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 28: Phase 9 - reports.getTopItems route & query params
    // -------------------------------------------------------------------------
    capturedRequests = [];
    await apiClient.reports.getTopItems({
      startDate: '2026-10-01',
      endDate: '2026-10-16',
      branchId: 'branch-01',
      limit: 10,
    });

    const reqRepTop = capturedRequests[0];
    if (
      reqRepTop?.method === 'GET' &&
      reqRepTop?.url?.startsWith('/api/reports/top-items') &&
      reqRepTop?.url?.includes('startDate=2026-10-01') &&
      reqRepTop?.url?.includes('endDate=2026-10-16') &&
      reqRepTop?.url?.includes('branchId=branch-01') &&
      reqRepTop?.url?.includes('limit=10')
    ) {
      pass('SDK-28: reports.getTopItems map chính xác GET /api/reports/top-items với đầy đủ filters');
      passed++;
    } else {
      fail('SDK-28: reports.getTopItems sai route hoặc query params', reqRepTop);
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 29: Phase 9 - tables.listPublicBySlug route
    // -------------------------------------------------------------------------
    capturedRequests = [];
    await apiClient.tables.listPublicBySlug('nha-hang-phuong-nam');

    const reqPublicTables = capturedRequests[0];
    if (
      reqPublicTables?.method === 'GET' &&
      reqPublicTables?.url === '/api/tables/public/by-restaurant/nha-hang-phuong-nam'
    ) {
      pass('SDK-29: tables.listPublicBySlug map chính xác GET /api/tables/public/by-restaurant/:restaurantSlug');
      passed++;
    } else {
      fail('SDK-29: tables.listPublicBySlug sai route', reqPublicTables);
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 30: Phase 10 - tables.callStaff route & payload
    // -------------------------------------------------------------------------
    capturedRequests = [];
    await apiClient.tables.callStaff('table-123', {
      reason: 'Xin thêm đá lạnh',
      note: '2 ly đá to',
      qrToken: 'token-abc',
      restaurantSlug: 'quan-ngon',
    });

    const reqCallStaff = capturedRequests[0];
    if (
      reqCallStaff?.method === 'POST' &&
      reqCallStaff?.url === '/api/tables/table-123/call-staff' &&
      JSON.parse(reqCallStaff.body)?.reason === 'Xin thêm đá lạnh' &&
      JSON.parse(reqCallStaff.body)?.qrToken === 'token-abc'
    ) {
      pass('SDK-30: tables.callStaff map chính xác POST /api/tables/:tableId/call-staff với payload');
      passed++;
    } else {
      fail('SDK-30: tables.callStaff sai route hoặc payload', reqCallStaff);
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 31: Phase 10 - tables.acknowledgeCall route
    // -------------------------------------------------------------------------
    capturedRequests = [];
    await apiClient.tables.acknowledgeCall('table-123');

    const reqAckCall = capturedRequests[0];
    if (
      reqAckCall?.method === 'POST' &&
      reqAckCall?.url === '/api/tables/table-123/acknowledge-call'
    ) {
      pass('SDK-31: tables.acknowledgeCall map chính xác POST /api/tables/:tableId/acknowledge-call');
      passed++;
    } else {
      fail('SDK-31: tables.acknowledgeCall sai route', reqAckCall);
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 32: Phase 10 - customerOrders.callStaff route & payload
    // -------------------------------------------------------------------------
    capturedRequests = [];
    await apiClient.customerOrders.callStaff('table-123', {
      reason: 'Xin thêm chén dĩa',
      restaurantSlug: 'quan-ngon',
    });

    const reqCustCall = capturedRequests[0];
    if (
      reqCustCall?.method === 'POST' &&
      reqCustCall?.url === '/api/tables/table-123/call-staff' &&
      JSON.parse(reqCustCall.body)?.reason === 'Xin thêm chén dĩa'
    ) {
      pass('SDK-32: customerOrders.callStaff map chính xác POST /api/tables/:tableId/call-staff');
      passed++;
    } else {
      fail('SDK-32: customerOrders.callStaff sai route hoặc payload', reqCustCall);
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 33: Phase 11 - customerOrders.downloadBill route & query params
    // -------------------------------------------------------------------------
    capturedRequests = [];
    await apiClient.customerOrders.downloadBill('order-789', {
      restaurantSlug: 'quan-ngon',
      tableCode: 'ban-02',
      qrToken: 'qr-secret-123',
      receiptAccessToken: 'token-abc-999',
    });

    const reqDownloadBill = capturedRequests[0];
    if (
      reqDownloadBill?.method === 'GET' &&
      reqDownloadBill?.url?.includes('/api/orders/customer/order-789/download-bill') &&
      reqDownloadBill?.url?.includes('receiptAccessToken=token-abc-999') &&
      reqDownloadBill?.url?.includes('restaurantSlug=quan-ngon')
    ) {
      pass('SDK-33: customerOrders.downloadBill map chính xác GET /api/orders/customer/:id/download-bill với credentials');
      passed++;
    } else {
      fail('SDK-33: customerOrders.downloadBill sai route hoặc query params', reqDownloadBill);
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 34: Phase 11 - reviews.createCustomerReview route & payload
    // -------------------------------------------------------------------------
    capturedRequests = [];
    await apiClient.reviews.createCustomerReview({
      orderId: 'order-789',
      overallRating: 5,
      foodRating: 5,
      serviceRating: 5,
      ambianceRating: 4,
      quickTags: ['Món ăn ngon', 'Phục vụ nhiệt tình'],
      comment: 'Trải nghiệm tuyệt vời, món ra rất nhanh!',
      restaurantSlug: 'quan-ngon',
      tableCode: 'ban-02',
      qrToken: 'qr-secret-123',
    });

    const reqCreateReview = capturedRequests[0];
    const parsedReviewBody = reqCreateReview ? JSON.parse(reqCreateReview.body) : {};
    if (
      reqCreateReview?.method === 'POST' &&
      reqCreateReview?.url === '/api/reviews/customer' &&
      parsedReviewBody.overallRating === 5 &&
      parsedReviewBody.orderId === 'order-789' &&
      Array.isArray(parsedReviewBody.quickTags) &&
      parsedReviewBody.quickTags.includes('Món ăn ngon')
    ) {
      pass('SDK-34: reviews.createCustomerReview map chính xác POST /api/reviews/customer');
      passed++;
    } else {
      fail('SDK-34: reviews.createCustomerReview sai route hoặc payload', reqCreateReview);
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 35: Phase 11 - reviews.getCustomerReviewByOrder route & query
    // -------------------------------------------------------------------------
    capturedRequests = [];
    await apiClient.reviews.getCustomerReviewByOrder('order-789', {
      receiptAccessToken: 'token-abc-999',
    });

    const reqGetReviewByOrder = capturedRequests[0];
    if (
      reqGetReviewByOrder?.method === 'GET' &&
      reqGetReviewByOrder?.url?.includes('/api/reviews/customer/by-order/order-789') &&
      reqGetReviewByOrder?.url?.includes('receiptAccessToken=token-abc-999')
    ) {
      pass('SDK-35: reviews.getCustomerReviewByOrder map chính xác GET /api/reviews/customer/by-order/:orderId');
      passed++;
    } else {
      fail('SDK-35: reviews.getCustomerReviewByOrder sai route', reqGetReviewByOrder);
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 36: Phase 11 - reviews.list route & filter query
    // -------------------------------------------------------------------------
    capturedRequests = [];
    await apiClient.reviews.list({
      branchId: 'branch-1',
      rating: 5,
      hasReply: false,
      search: 'ORD-123',
      page: 1,
      limit: 10,
    });

    const reqListReviews = capturedRequests[0];
    if (
      reqListReviews?.method === 'GET' &&
      reqListReviews?.url?.includes('/api/reviews?') &&
      reqListReviews?.url?.includes('branchId=branch-1') &&
      reqListReviews?.url?.includes('rating=5') &&
      reqListReviews?.url?.includes('hasReply=false') &&
      reqListReviews?.url?.includes('search=ORD-123')
    ) {
      pass('SDK-36: reviews.list map chính xác GET /api/reviews kèm đầy đủ query filters');
      passed++;
    } else {
      fail('SDK-36: reviews.list sai route hoặc query params', reqListReviews);
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 37: Phase 11 - reviews.getSummary & reviews.reply routes
    // -------------------------------------------------------------------------
    capturedRequests = [];
    await apiClient.reviews.getSummary({ branchId: 'branch-1' });
    await apiClient.reviews.reply('rev-001', { content: 'Cảm ơn bạn đã ghé thăm nhà hàng!' });

    const reqSummary = capturedRequests[0];
    const reqReply = capturedRequests[1];
    const parsedReply = reqReply ? JSON.parse(reqReply.body) : {};

    if (
      reqSummary?.method === 'GET' &&
      reqSummary?.url?.includes('/api/reviews/summary?branchId=branch-1') &&
      reqReply?.method === 'POST' &&
      reqReply?.url === '/api/reviews/rev-001/reply' &&
      parsedReply.content === 'Cảm ơn bạn đã ghé thăm nhà hàng!'
    ) {
      pass('SDK-37: reviews.getSummary & reviews.reply map chính xác backend routes');
      passed++;
    } else {
      fail('SDK-37: reviews summary/reply sai route hoặc body', { reqSummary, reqReply });
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 38: Phase 11 - renderReceiptToPngDataUrl & downloadReceiptAsPng
    // -------------------------------------------------------------------------
    const sampleReceiptData = buildReceiptData(
      {
        orderCode: 'ORD-261017-9999',
        tableName: 'Bàn VIP 01',
        branchId: 'branch-01',
        branchName: 'Chi nhánh Quận 1',
        subTotal: 300000,
        discountAmount: 30000,
        vatAmount: 27000,
        totalAmount: 297000,
        status: 'Paid',
        isPaid: true,
        items: [
          { name: 'Phở Đặc Biệt', quantity: 2, price: 100000, itemTotal: 200000 },
          { name: 'Trà Đá', quantity: 2, price: 10000, itemTotal: 20000 },
        ],
      },
      {
        name: 'Nhà Hàng Phở Việt',
        address: '123 Đồng Khởi, Q.1, TP.HCM',
        phone: '0909123456',
      },
    );

    const pngDataUrl = await renderReceiptToPngDataUrl(sampleReceiptData);
    if (
      typeof pngDataUrl === 'string' &&
      pngDataUrl.startsWith('data:image/') &&
      pngDataUrl.length > 50
    ) {
      pass('SDK-38: renderReceiptToPngDataUrl biên dịch thành công ảnh Data URL chuẩn cho hóa đơn nhiệt 80mm');
      passed++;
    } else {
      fail('SDK-38: renderReceiptToPngDataUrl trả về định dạng ảnh không hợp lệ', pngDataUrl);
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 39: Phase 12 - referrals.validateCode
    // -------------------------------------------------------------------------
    capturedRequests = [];
    await apiClient.referrals.validateCode('IMENU-DEMO88');
    const req39 = capturedRequests[0];
    if (
      req39?.method === 'GET' &&
      req39?.url === '/api/referrals/validate/IMENU-DEMO88'
    ) {
      pass('SDK-39: referrals.validateCode map chính xác GET /api/referrals/validate/:code');
      passed++;
    } else {
      fail('SDK-39: referrals.validateCode sai route', req39);
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 40: Phase 12 - referrals.submitApplication
    // -------------------------------------------------------------------------
    capturedRequests = [];
    await apiClient.referrals.submitApplication({
      fullName: 'Trần Văn CTV',
      phone: '0901234888',
      email: 'ctv@gmail.com',
      city: 'Hà Nội',
      note: 'Muốn làm CTV',
      parentReferralCode: 'IMENU-DEMO88',
    });
    const req40 = capturedRequests[0];
    const parsedBody40 = req40 ? JSON.parse(req40.body) : {};
    if (
      req40?.method === 'POST' &&
      req40?.url === '/api/referrals/apply' &&
      parsedBody40.fullName === 'Trần Văn CTV' &&
      parsedBody40.parentReferralCode === 'IMENU-DEMO88'
    ) {
      pass('SDK-40: referrals.submitApplication map chính xác POST /api/referrals/apply');
      passed++;
    } else {
      fail('SDK-40: referrals.submitApplication sai route hoặc body', { req40, parsedBody40 });
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 41: Phase 12 - sales.getDashboard
    // -------------------------------------------------------------------------
    capturedRequests = [];
    await apiClient.sales.getDashboard();
    const req41 = capturedRequests[0];
    if (
      req41?.method === 'GET' &&
      req41?.url === '/api/sales/dashboard'
    ) {
      pass('SDK-41: sales.getDashboard map chính xác GET /api/sales/dashboard');
      passed++;
    } else {
      fail('SDK-41: sales.getDashboard sai route', req41);
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 42: Phase 12 - sales.getRestaurants
    // -------------------------------------------------------------------------
    capturedRequests = [];
    await apiClient.sales.getRestaurants({
      search: 'Bếp Nhà',
      subscriptionStatus: 'ACTIVE_PAID',
      isActivationQualified: true,
      page: 1,
      limit: 10,
    });
    const req42 = capturedRequests[0];
    if (
      req42?.method === 'GET' &&
      req42?.url?.includes('/api/sales/restaurants?') &&
      req42?.url?.includes('search=B%E1%BA%BFp+Nh%C3%A0') &&
      req42?.url?.includes('subscriptionStatus=ACTIVE_PAID') &&
      req42?.url?.includes('isActivationQualified=true')
    ) {
      pass('SDK-42: sales.getRestaurants map chính xác GET /api/sales/restaurants kèm bộ lọc');
      passed++;
    } else {
      fail('SDK-42: sales.getRestaurants sai route hoặc query params', req42);
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 43: Phase 12 - sales.createRestaurant
    // -------------------------------------------------------------------------
    capturedRequests = [];
    await apiClient.sales.createRestaurant({
      restaurant: {
        name: 'Quán Ăn Hoàng Gia',
        phone: '0909999111',
        address: '88 Phố Huế, Q.Hai Bà Trưng, Hà Nội',
        tagline: 'Tinh hoa ẩm thực',
      },
      owner: {
        fullName: 'Lê Hoàng',
        phone: '0909999111',
        email: 'lehoang@nhahang.vn',
        password: 'Password@123',
      },
      seedDemoTables: true,
      seedDemoMenu: true,
    });
    const req43 = capturedRequests[0];
    const parsedBody43 = req43 ? JSON.parse(req43.body) : {};
    if (
      req43?.method === 'POST' &&
      req43?.url === '/api/sales/restaurants' &&
      parsedBody43.restaurant?.name === 'Quán Ăn Hoàng Gia' &&
      parsedBody43.owner?.email === 'lehoang@nhahang.vn'
    ) {
      pass('SDK-43: sales.createRestaurant map chính xác POST /api/sales/restaurants');
      passed++;
    } else {
      fail('SDK-43: sales.createRestaurant sai route hoặc body', { req43, parsedBody43 });
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 44: Phase 12 - sales.getCommissions
    // -------------------------------------------------------------------------
    capturedRequests = [];
    await apiClient.sales.getCommissions({
      commissionType: 'SETUP_COMMISSION',
      status: 'APPROVED',
      payoutPeriod: '2026-10-K1',
      page: 1,
      limit: 20,
    });
    const req44 = capturedRequests[0];
    if (
      req44?.method === 'GET' &&
      req44?.url?.includes('/api/sales/commissions?') &&
      req44?.url?.includes('commissionType=SETUP_COMMISSION') &&
      req44?.url?.includes('status=APPROVED') &&
      req44?.url?.includes('payoutPeriod=2026-10-K1')
    ) {
      pass('SDK-44: sales.getCommissions map chính xác GET /api/sales/commissions kèm bộ lọc');
      passed++;
    } else {
      fail('SDK-44: sales.getCommissions sai route hoặc query params', req44);
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 45: Phase 12 - sales.getSubTeam & sales.updatePayoutBank
    // -------------------------------------------------------------------------
    capturedRequests = [];
    await apiClient.sales.getSubTeam();
    await apiClient.sales.updatePayoutBank({
      bankId: 'MB',
      bankName: 'MBBank',
      accountNo: '0908888999',
      accountName: 'NGUYEN VAN SALES',
    });
    const reqTeam = capturedRequests[0];
    const reqBank = capturedRequests[1];
    const parsedBank = reqBank ? JSON.parse(reqBank.body) : {};
    if (
      reqTeam?.method === 'GET' &&
      reqTeam?.url === '/api/sales/sub-team' &&
      reqBank?.method === 'PUT' &&
      reqBank?.url === '/api/sales/profile/bank-account' &&
      parsedBank.accountNo === '0908888999'
    ) {
      pass('SDK-45: sales.getSubTeam & sales.updatePayoutBank map chính xác backend routes');
      passed++;
    } else {
      fail('SDK-45: sales subTeam/bankAccount sai route hoặc body', { reqTeam, reqBank });
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 46: Phase 13 - platform.getOverview
    // -------------------------------------------------------------------------
    capturedRequests = [];
    await apiClient.platform.getOverview();
    const req46 = capturedRequests[0];
    if (req46?.method === 'GET' && req46?.url === '/api/platform/overview') {
      pass('SDK-46: platform.getOverview map chính xác GET /api/platform/overview');
      passed++;
    } else {
      fail('SDK-46: platform.getOverview sai route', req46);
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 47: Phase 13 - platform.getRestaurants
    // -------------------------------------------------------------------------
    capturedRequests = [];
    await apiClient.platform.getRestaurants({
      plan: 'Pro',
      isSuspended: true,
      search: 'bep-nha',
      page: 1,
      limit: 10,
    });
    const req47 = capturedRequests[0];
    if (
      req47?.method === 'GET' &&
      req47?.url?.includes('/api/platform/restaurants?') &&
      req47?.url?.includes('plan=Pro') &&
      req47?.url?.includes('isSuspended=true') &&
      req47?.url?.includes('search=bep-nha')
    ) {
      pass('SDK-47: platform.getRestaurants map chính xác GET /api/platform/restaurants kèm query');
      passed++;
    } else {
      fail('SDK-47: platform.getRestaurants sai route hoặc query params', req47);
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 48: Phase 13 - platform.updateRestaurantStatus & updateRestaurantSubscription
    // -------------------------------------------------------------------------
    capturedRequests = [];
    await apiClient.platform.updateRestaurantStatus('rest-123', {
      isSuspended: true,
      suspendReason: 'Bảo trì hệ thống',
    });
    await apiClient.platform.updateRestaurantSubscription('rest-123', {
      plan: 'Pro',
      billingCycle: 'YEARLY',
      transactionType: 'INITIAL_SETUP',
      netAmount: 4800000,
    });
    const reqStatus = capturedRequests[0];
    const reqSub = capturedRequests[1];
    const parsedStatus = reqStatus ? JSON.parse(reqStatus.body) : {};
    const parsedSub = reqSub ? JSON.parse(reqSub.body) : {};
    if (
      reqStatus?.method === 'PATCH' &&
      reqStatus?.url === '/api/platform/restaurants/rest-123/status' &&
      parsedStatus.isSuspended === true &&
      reqSub?.method === 'PATCH' &&
      reqSub?.url === '/api/platform/restaurants/rest-123/subscription' &&
      parsedSub.plan === 'Pro' &&
      parsedSub.netAmount === 4800000
    ) {
      pass('SDK-48: platform.updateRestaurantStatus & updateRestaurantSubscription map chính xác PATCH endpoints');
      passed++;
    } else {
      fail('SDK-48: platform status/subscription sai route hoặc body', { reqStatus, reqSub });
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 49: Phase 13 - platform.getRestaurantRevenues & getSaaSRevenues
    // -------------------------------------------------------------------------
    capturedRequests = [];
    await apiClient.platform.getRestaurantRevenues({ timeRange: 'this_month' });
    await apiClient.platform.getSaaSRevenues({ timeRange: 'this_month' });
    const reqRestRev = capturedRequests[0];
    const reqSaaSRev = capturedRequests[1];
    if (
      reqRestRev?.method === 'GET' &&
      reqRestRev?.url === '/api/platform/revenues/restaurants?timeRange=this_month' &&
      reqSaaSRev?.method === 'GET' &&
      reqSaaSRev?.url === '/api/platform/revenues/saas?timeRange=this_month'
    ) {
      pass('SDK-49: platform.getRestaurantRevenues & getSaaSRevenues map chính xác dual revenue endpoints');
      passed++;
    } else {
      fail('SDK-49: platform revenue reports sai route', { reqRestRev, reqSaaSRev });
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 50: Phase 13 - platform.getSalesReps, createSalesRep & updateSalesRep
    // -------------------------------------------------------------------------
    capturedRequests = [];
    await apiClient.platform.getSalesReps();
    await apiClient.platform.createSalesRep({
      fullName: 'Trần Thị Sales',
      email: 'ttsales@imenu.vn',
      phone: '0911223344',
      referralCode: 'TTSALES',
    });
    await apiClient.platform.updateSalesRep('user-sales-1', {
      status: 'INACTIVE',
      setupCommissionRate: 55,
    });
    const reqRepGet = capturedRequests[0];
    const reqRepCreate = capturedRequests[1];
    const reqRepUpdate = capturedRequests[2];
    const parsedCreate = reqRepCreate ? JSON.parse(reqRepCreate.body) : {};
    const parsedUpdate = reqRepUpdate ? JSON.parse(reqRepUpdate.body) : {};
    if (
      reqRepGet?.method === 'GET' &&
      reqRepGet?.url === '/api/platform/sales-reps' &&
      reqRepCreate?.method === 'POST' &&
      reqRepCreate?.url === '/api/platform/sales-reps' &&
      parsedCreate.referralCode === 'TTSALES' &&
      reqRepUpdate?.method === 'PATCH' &&
      reqRepUpdate?.url === '/api/platform/sales-reps/user-sales-1' &&
      parsedUpdate.status === 'INACTIVE'
    ) {
      pass('SDK-50: platform sales reps CRUD endpoints map chính xác backend routes');
      passed++;
    } else {
      fail('SDK-50: platform sales reps sai route hoặc body', { reqRepGet, reqRepCreate, reqRepUpdate });
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 51: Phase 13 - platform.getSalesApplications & approveSalesApplication
    // -------------------------------------------------------------------------
    capturedRequests = [];
    await apiClient.platform.getSalesApplications();
    await apiClient.platform.approveSalesApplication('app-123');
    const reqAppList = capturedRequests[0];
    const reqApprove = capturedRequests[1];
    if (
      reqAppList?.method === 'GET' &&
      reqAppList?.url === '/api/platform/sales-applications' &&
      reqApprove?.method === 'POST' &&
      reqApprove?.url === '/api/platform/sales-applications/app-123/approve'
    ) {
      pass('SDK-51: platform.getSalesApplications & approveSalesApplication map chính xác backend routes');
      passed++;
    } else {
      fail('SDK-51: platform applications sai route', { reqAppList, reqApprove });
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 52: Phase 13 - platform.executePayoutBatch
    // -------------------------------------------------------------------------
    capturedRequests = [];
    await apiClient.platform.executePayoutBatch({
      ledgerIds: ['led-1', 'led-2'],
      action: 'PAY',
      payoutReference: 'MB_20261018_9988',
    });
    const reqPayout = capturedRequests[0];
    const parsedPayout = reqPayout ? JSON.parse(reqPayout.body) : {};
    if (
      reqPayout?.method === 'POST' &&
      reqPayout?.url === '/api/platform/commissions/payout-batch' &&
      parsedPayout.action === 'PAY' &&
      parsedPayout.payoutReference === 'MB_20261018_9988' &&
      parsedPayout.ledgerIds?.length === 2
    ) {
      pass('SDK-52: platform.executePayoutBatch map chính xác POST /api/platform/commissions/payout-batch');
      passed++;
    } else {
      fail('SDK-52: platform.executePayoutBatch sai route hoặc body', { reqPayout, parsedPayout });
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
