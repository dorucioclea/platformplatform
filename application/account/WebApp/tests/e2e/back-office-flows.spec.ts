import { expect, request } from "@playwright/test";
import { test } from "@shared/e2e/fixtures/page-auth";
import { getBackOfficeBaseUrl, getBaseUrl } from "@shared/e2e/utils/constants";
import { createTestContext } from "@shared/e2e/utils/test-assertions";
import { step } from "@shared/e2e/utils/test-step-wrapper";

const BACK_OFFICE_BASE_URL = getBackOfficeBaseUrl();
const BASE_URL = getBaseUrl();

test.describe("@smoke", () => {
  /**
   * Verifies the local-dev back-office authentication round trip:
   * an unauthenticated browser request to a back-office API endpoint
   * triggers a redirect to the MockEasyAuth impersonation page; selecting an
   * identity sets the DevEasyAuth cookie; and a follow-up request to
   * `/api/back-office/me` returns the impersonated identity's claims. Also
   * verifies that the back-office host serves the BackOfficeWebApp SPA shell.
   * Production validation (real Easy Auth) is a manual deploy-time check, not
   * covered by this CI suite.
   */
  test("should redirect unauthenticated user to mock easy auth and return identity claims after impersonation", async ({
    browser
  }) => {
    const browserContext = await browser.newContext({ baseURL: BACK_OFFICE_BASE_URL, ignoreHTTPSErrors: true });
    const page = await browserContext.newPage();
    createTestContext(page);

    await step("Navigate to authenticated back-office endpoint & verify redirect to mock easy auth login")(async () => {
      await page.goto("/api/back-office/me");

      await expect(page).toHaveURL(
        `${BACK_OFFICE_BASE_URL}/.auth/login/aad?post_login_redirect_uri=%2Fapi%2Fback-office%2Fme`
      );
      await expect(page.getByRole("heading", { name: "Mock Easy Auth - pick an identity" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Admin User Groups: BackOfficeAdmins" })).toBeVisible();
    })();

    await step("Pick the Admin identity & verify callback redirects back to the protected endpoint")(async () => {
      await page.getByRole("link", { name: "Admin User Groups: BackOfficeAdmins" }).click();

      await expect(page).toHaveURL(`${BACK_OFFICE_BASE_URL}/api/back-office/me`);
    })();

    await step("Call /api/back-office/me with DevEasyAuth cookie & verify identity payload")(async () => {
      const response = await page.request.get(`${BACK_OFFICE_BASE_URL}/api/back-office/me`, {
        headers: { Accept: "application/json" }
      });

      expect(response.status()).toBe(200);
      const payload = await response.json();
      expect(payload.displayName).toBe("Admin User");
      expect(payload.groups).toContain("BackOfficeAdmins");
    })();

    await step("Visit back-office root & verify the BackOfficeWebApp SPA shell is served")(async () => {
      const response = await page.request.get(`${BACK_OFFICE_BASE_URL}/`, {
        headers: { Accept: "text/html" }
      });

      expect(response.status()).toBe(200);
      const body = await response.text();
      expect(body).toContain('id="back-office"');
      expect(body).toContain("<title>Back Office</title>");
    })();

    await browserContext.close();
  });
});

test.describe("@smoke", () => {
  /**
   * Verifies host-scoped isolation: back-office endpoints are only served on
   * the back-office host (RequireHost predicate produces 404 elsewhere), and
   * an authenticated account session does not authorize back-office requests.
   * BackOfficeIdentity is a separate authentication scheme and ignores the
   * account session cookie even if present. The user-facing host continues to
   * serve account endpoints with normal 401 behavior when unauthenticated.
   */
  test("should isolate back-office endpoints to the back-office host and reject account-authenticated requests", async ({
    ownerPage
  }) => {
    createTestContext(ownerPage);

    const accountStorageState = await ownerPage.context().storageState();
    const accountAuthenticatedContext = await request.newContext({
      storageState: accountStorageState,
      ignoreHTTPSErrors: true
    });
    const anonymousApiContext = await request.newContext({ ignoreHTTPSErrors: true });

    await step("GET /api/back-office/me on user-facing host with account session & verify 404 from RequireHost")(
      async () => {
        const response = await accountAuthenticatedContext.get(`${BASE_URL}/api/back-office/me`, {
          headers: { Accept: "application/json" },
          maxRedirects: 0
        });

        expect(response.status()).toBe(404);
      }
    )();

    await step(
      "GET /api/back-office/me on back-office host with account session and JSON Accept & verify 401 (BackOfficeIdentity ignores account cookies, and subdomain scoping prevents cross-host attachment)"
    )(async () => {
      const response = await accountAuthenticatedContext.get(`${BACK_OFFICE_BASE_URL}/api/back-office/me`, {
        headers: { Accept: "application/json" },
        maxRedirects: 0
      });

      expect(response.status()).toBe(401);
    })();

    await step(
      "GET /api/back-office/me on back-office host with account session and HTML Accept & verify redirect to mock easy auth login"
    )(async () => {
      const response = await accountAuthenticatedContext.get(`${BACK_OFFICE_BASE_URL}/api/back-office/me`, {
        headers: { Accept: "text/html" },
        maxRedirects: 0
      });

      expect(response.status()).toBe(302);
      expect(response.headers().location).toBe("/.auth/login/aad?post_login_redirect_uri=%2Fapi%2Fback-office%2Fme");
    })();

    await step("GET /api/account/users on user-facing host with no cookie & verify 401 regression")(async () => {
      const response = await anonymousApiContext.get(`${BASE_URL}/api/account/users`, {
        headers: { Accept: "application/json" },
        maxRedirects: 0
      });

      expect(response.status()).toBe(401);
    })();

    await accountAuthenticatedContext.dispose();
    await anonymousApiContext.dispose();
  });
});
