import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const TARGET_DIR = path.resolve('d:/01_HOME/005_VIBE_AI/05_imenu/imenu-menudientu/apps/imenu-client-web/public/images/guide');

if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

async function capture() {
  console.log('Launching browser from:', EDGE_PATH);
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  // Capture 02: Add dish modal
  {
    console.log('Capturing 02-them-mon-moi.png with modal open...');
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 850, deviceScaleFactor: 2 });
    await page.goto('http://localhost:3003/menu', { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1000));
    // Click Add Dish button
    await page.click('#btn-add-new-item');
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(TARGET_DIR, '02-them-mon-moi.png'), type: 'png' });
    console.log('Saved 02-them-mon-moi.png');
    await page.close();
  }

  // Capture 05: POS with items in cart
  {
    console.log('Capturing 05-nhan-vien-order.png with cart items...');
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 850, deviceScaleFactor: 2 });
    await page.goto('http://localhost:3003/pos', { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1000));
    // Click some add item buttons
    const buttons = await page.$$('button');
    let added = 0;
    for (const b of buttons) {
      const text = await page.evaluate(el => el.textContent, b);
      if (text && text.includes('Thêm món')) {
        await b.click();
        added++;
        if (added >= 2) break;
      }
    }
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(TARGET_DIR, '05-nhan-vien-order.png'), type: 'png' });
    console.log('Saved 05-nhan-vien-order.png');
    await page.close();
  }

  // Capture 07: Thermal receipt modal
  {
    console.log('Capturing 07-tam-tinh-thanh-toan.png with thermal bill modal open...');
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 850, deviceScaleFactor: 2 });
    await page.goto('http://localhost:3003/bills', { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1000));
    // Click first "Xem & In Bill 80mm"
    const buttons = await page.$$('button');
    for (const b of buttons) {
      const text = await page.evaluate(el => el.textContent, b);
      if (text && text.includes('Xem & In Bill')) {
        await b.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(TARGET_DIR, '07-tam-tinh-thanh-toan.png'), type: 'png' });
    console.log('Saved 07-tam-tinh-thanh-toan.png');
    await page.close();
  }

  await browser.close();
  console.log('Recapture completed!');
}

capture().catch(console.error);
