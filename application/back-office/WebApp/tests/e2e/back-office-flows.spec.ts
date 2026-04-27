import { expect } from "@playwright/test";
import { test } from "@shared/e2e/fixtures/page-auth";
import { getBaseUrl } from "@shared/e2e/utils/constants";
import { createTestContext } from "@shared/e2e/utils/test-assertions";
import { step } from "@shared/e2e/utils/test-step-wrapper";

const BASE_URL = new URL(getBaseUrl());
const PORT = BASE_URL.port;
const BACK_OFFICE_URL = `https://back-office.dev.localhost:${PORT}/`;
const NAKED_LOCALHOST_URL = `https://localhost:${PORT}/`;
const UNKNOWN_HOST_URL = `https://other.dev.localhost:${PORT}/`;
const APP_CANONICAL_URL = `https://app.dev.localhost:${PORT}`;
const BACK_OFFICE_CANONICAL_URL = `https://back-office.dev.localhost:${PORT}`;

test.describe("@smoke", () => {
  /**
   * Tests host-based routing for the back-office surface, the naked-localhost redirect, and the AppGateway 404 fallback.
   * Covers:
   * - Back-office shell loads at the back-office.dev.localhost subdomain with the expected page title
   * - Naked https://localhost returns HTTP 301 redirecting to the app canonical URL (preserves OAuth callback flow)
   * - Unknown https://other.dev.localhost returns HTTP 404 with a problem-details body listing canonical URLs
   */
  test("should serve back-office at its subdomain, redirect naked localhost to app, and reject unknown hosts with 404", async ({
    page,
    request
  }) => {
    createTestContext(page);

    await step("Navigate to back-office subdomain & verify shell title")(async () => {
      await page.goto(BACK_OFFICE_URL);

      await expect(page).toHaveTitle("Back Office");
    })();

    await step("Fetch naked localhost & verify 301 redirect to app canonical URL")(async () => {
      const response = await request.get(NAKED_LOCALHOST_URL, { ignoreHTTPSErrors: true, maxRedirects: 0 });

      expect(response.status()).toBe(301);
      expect(response.headers().location).toBe(`${APP_CANONICAL_URL}/`);
    })();

    await step("Fetch unknown subdomain & verify 404 problem-details body lists canonical URLs")(async () => {
      const response = await request.get(UNKNOWN_HOST_URL, { ignoreHTTPSErrors: true });

      expect(response.status()).toBe(404);
      const body = await response.json();
      expect(body.title).toBe("Unknown host");
      expect(body.canonicalUrls).toContain(APP_CANONICAL_URL);
      expect(body.canonicalUrls).toContain(BACK_OFFICE_CANONICAL_URL);
    })();
  });
});
