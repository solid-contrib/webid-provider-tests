import { getAuthFetcher, getAuthHeaders } from "solid-auth-fetcher";
test("can obtain auth headers", async () => {
  const oidcIssuer = process.env.SERVER_ROOT;
  const cookie = process.env.COOKIE || "";
  const appOrigin = "https://tester";
  const authFetcher = await getAuthFetcher(oidcIssuer, cookie, appOrigin);
  const authHeaders = await getAuthHeaders(
    `${oidcIssuer}/example/url.txt`,
    "GET",
    authFetcher
  );
  expect(authHeaders.Authorization).toBeGreaterThan(20);
  expect(authHeaders.DPop).toBeGreaterThan(20);
});
