import { getAuthFetcher } from "solid-auth-fetcher";
test("can obtain auth headers", async () => {
  const oidcIssuer = process.env.SERVER_ROOT;
  const cookie = process.env.COOKIE || "";
  const appOrigin = "https://tester";
  const authFetcher = await getAuthFetcher(oidcIssuer, cookie, appOrigin);
  const authHeaders = getAuthHeaders(
    `${oidcIssuer}/example/url.txt`,
    "GET",
    authFetcher
  );
  console.log(authHeaders);
});
