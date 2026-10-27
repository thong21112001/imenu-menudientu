/**
 * test-credentials.mjs
 *
 * Helper providing dynamic test credentials for E2E scripts from environment variables.
 * Prevents committing static secrets or base64 encoded credentials to version control.
 */

export function getTestFixtureSecret() {
  return (
    process.env.DEMO_USER_PASSWORD ||
    process.env.DEMO_PASSWORD ||
    process.env.NEXT_PUBLIC_DEMO_PASSWORD ||
    ''
  );
}

export function getAltFixtureSecret() {
  return (
    process.env.ALT_TEST_PASSWORD ||
    process.env.DEMO_USER_PASSWORD ||
    process.env.DEMO_PASSWORD ||
    ''
  );
}

export function getDefaultSalesSecret() {
  return (
    process.env.DEFAULT_SALES_PASSWORD ||
    process.env.DEMO_USER_PASSWORD ||
    process.env.DEMO_PASSWORD ||
    ''
  );
}

