import fetch from "node-fetch";

const SERVER_ROOT = process.env.SERVER_ROOT || "https://server";
const LOGIN_URL = process.env.LOGIN_URL || `${SERVER_ROOT}/login/password`;
const query1 =
  "?response_type=id_token%20code&redirect_uri=http%3A%2F%2Flocalhost%3A3001%2Fredirect&scope=openid%20profile%20offline_access&client_id=coolApp1&code_challenge_method=S256&code_challenge=M3CBok-0kQFc0GUz2YD90cFee0XzTTru3Eaj0Ubm-oc&state=84ae2b48-eb1b-4000-8782-ac1cd748aeb0";
// const query2 =
//   "?response_type=id_token%20code&redirect_uri=http%3A%2F%2Flocalhost%3A3002%2Fredirect&scope=openid%20profile%20offline_access&client_id=coolApp2&code_challenge_method=S256&code_challenge=M3CBok-0kQFc0GUz2YD90cFee0XzTTru3Eaj0Ubm-oc&state=84ae2b48-eb1b-4000-8782-ac1cd748aeb0";

jest.setTimeout(10000);

describe("The server's authorize endpoint", () => {
  let authorizationEndpoint;
  let cookie;

  beforeAll(async () => {
    cookie = process.env.COOKIE;
    const configFetchResult = await fetch(
      `${SERVER_ROOT}/.well-known/openid-configuration`
    );
    const body = await configFetchResult.text();
    const configObj = JSON.parse(body);
    authorizationEndpoint = configObj.authorization_endpoint;
  });

  test("the authorize endpoint is within the system under test", async () => {
    expect(authorizationEndpoint.startsWith(SERVER_ROOT)).toEqual(true);
  });

  test("the authorize URL without cookie sends you to login", async () => {
    const fetchResult = await fetch(authorizationEndpoint + query1, {
      redirect: "manual",
      headers: {
        Accept: "text/html",
      },
    });
    expect(fetchResult.status).toBeGreaterThanOrEqual(300); // Nextcloud uses 303 to redirect
    expect(fetchResult.status).toBeLessThan(400);
    expect(fetchResult.headers.get("location").startsWith(`${LOGIN_URL}`));
  });

  test("when redirected to login, you see a html form", async () => {
    const fetchResult = await fetch(authorizationEndpoint + query1, {
      redirect: "follow",
      headers: {
        Accept: "text/html",
      },
    });
    expect(fetchResult.status).toEqual(200);
    const body = await fetchResult.text();

    // Nextcloud uses javascript to populate the form in later, so checking for form directly won't work
    // expect(body.indexOf("form")).not.toEqual(-1);
    expect(body.indexOf("login")).not.toEqual(-1);
  });

  // test.skip("the authorize URL with cookie sends you to consent", async () => {
  //   const fetchResult = await fetch(authorizationEndpoint + query1, {
  //     headers: {
  //       cookie,
  //     },
  //     redirect: "manual",
  //   });
  //   expect(fetchResult.status).toEqual(302);
  //   expect(fetchResult.headers.get("location")).toEqual(
  //     `${SERVER_ROOT}/sharing${query1}`
  //   );
  // });

  // test.skip("when redirected to consent, there is a html form", async () => {
  //   // This test uses the unconsented coolApp1
  //   const fetchResult = await fetch(authorizationEndpoint + query1, {
  //     headers: {
  //       cookie,
  //     },
  //     redirect: "follow",
  //   });
  //   expect(fetchResult.status).toEqual(200);
  //   const body = await fetchResult.text();
  //   expect(body.indexOf("form")).not.toEqual(-1);
  // });

  // test.skip("the authorize URL with cookie and consent still redirects you to consent", async () => {
  //   // This test uses the unconsented coolApp1
  //   const fetchResult = await fetch(authorizationEndpoint + query1, {
  //     headers: {
  //       cookie,
  //     },
  //     redirect: "manual",
  //   });
  //   expect(fetchResult.status).toEqual(302);
  //   expect(fetchResult.headers.get("location")).toEqual(
  //     `${SERVER_ROOT}/sharing?response_type=id_token%20code&redirect_uri=http%3A%2F%2Flocalhost%3A3001%2Fredirect&scope=openid%20profile%20offline_access&client_id=coolApp1&code_challenge_method=S256&code_challenge=M3CBok-0kQFc0GUz2YD90cFee0XzTTru3Eaj0Ubm-oc&state=84ae2b48-eb1b-4000-8782-ac1cd748aeb0`
  //   );
  // });

  // test.skip("Giving consent redirects you back to authorize", async () => {
  //   // This test uses the consented coolApp2
  //   const fetchResult = await fetch(`${SERVER_ROOT}/sharing`, {
  //     headers: {
  //       "content-type": "application/x-www-form-urlencoded",
  //       "upgrade-insecure-requests": "1",
  //       cookie,
  //     },
  //     body:
  //       "access_mode=Read&access_mode=Append&access_mode=Write&access_mode=Control&consent=true&response_type=id_token+code&display=&scope=openid+profile+offline_access&client_id=coolApp2&redirect_uri=http%3A%2F%2Flocalhost%3A3002%2Fredirect&state=84ae2b48-eb1b-4000-8782-ac1cd748aeb0&nonce=12345&request=",
  //     method: "POST",
  //     redirect: "manual",
  //   });
  //   expect(fetchResult.status).toEqual(302);
  //   expect(fetchResult.headers.get("location")).toEqual(
  //     `${authorizationEndpoint}?response_type=id_token%20code&display=&scope=openid%20profile%20offline_access&client_id=coolApp2&redirect_uri=http%3A%2F%2Flocalhost%3A3002%2Fredirect&state=84ae2b48-eb1b-4000-8782-ac1cd748aeb0&nonce=12345&request=`
  //   );
  // });

  // test.skip("Authorize with cookie after consent redirects you back to the app", async () => {
  //   // This test uses the consented coolApp2
  //   const fetchResult = await fetch(
  //     `${authorizationEndpoint}?response_type=id_token%20code&display=&scope=openid%20profile%20offline_access&client_id=coolApp2&redirect_uri=http%3A%2F%2Flocalhost%3A3002%2Fredirect&state=84ae2b48-eb1b-4000-8782-ac1cd748aeb0&nonce=12345&request=`,
  //     {
  //       headers: {
  //         cookie,
  //       },
  //       redirect: "manual",
  //     }
  //   );
  //   expect(fetchResult.status).toEqual(302);
  //   expect(
  //     fetchResult.headers
  //       .get("location")
  //       .startsWith("http://localhost:3002/redirect?code=")
  //   ).toEqual(true);
  // });
});
