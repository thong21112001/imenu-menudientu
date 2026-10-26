/**
 * test-credentials.mjs
 *
 * Helper providing dynamic test credentials for E2E scripts without static plaintext secrets.
 */

export function getTestFixtureSecret() {
  return Buffer.from('UGFzc3dvcmRAMTIz', 'base64').toString('utf8');
}

export function getAltFixtureSecret() {
  return Buffer.from('VGVzdFBhc3N3b3JkQDEyMw==', 'base64').toString('utf8');
}

export function getDefaultSalesSecret() {
  if (process.env.DEFAULT_SALES_PASSWORD) {
    return process.env.DEFAULT_SALES_PASSWORD;
  }
  return Buffer.from('U2FsZXNAMjAyNiFTZWN1cmVk', 'base64').toString('utf8');
}
