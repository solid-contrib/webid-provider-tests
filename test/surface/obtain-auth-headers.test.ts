import { getAuthFetcher, getAuthHeaders } from "solid-auth-fetcher";
import { oidcIssuer, cookie, appOrigin } from "../helpers/env";

test("can obtain auth headers", async () => {
  const authFetcher = await getAuthFetcher(oidcIssuer, cookie, appOrigin);
  const authHeaders = await getAuthHeaders(
    `${oidcIssuer}/example/url.txt`,
    "GET",
    authFetcher
  );
  expect(authHeaders.Authorization.length).toBeGreaterThan(20);
  expect(authHeaders.DPop.length).toBeGreaterThan(20);
});
