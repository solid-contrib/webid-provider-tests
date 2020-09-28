import { decode, verify } from "jsonwebtoken";
import Debug from "debug";
import fetch from "node-fetch";

import { subtle } from "isomorphic-webcrypto";
import base64url from "base64url";
import * as RSA from "node-rsa";
const debug = Debug("token tests");

const ALICE_WEBID = process.env.ALICE_WEBID;
const SERVER_ROOT = process.env.SERVER_ROOT || "https://server";

function hashClaim(value, hashLength) {
  if (value) {
    const alg = { name: `SHA-${hashLength}` };
    const octets = Buffer.from(value, "ascii");

    return subtle.digest(alg, new Uint8Array(octets)).then((digest) => {
      const hash = Buffer.from(digest);
      const half = hash.slice(0, hash.byteLength / 2);
      return base64url(half);
    });
  }
}

jest.setTimeout(10000);

async function getCookie() {
  const result = await fetch(`${SERVER_ROOT}/login/password`, {
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body: "username=alice&password=123",
    method: "POST",
    redirect: "manual",
  });
  return result.headers.get("set-cookie");
}

describe("The IODC token", () => {
  let code;
  let idTokenJwt;
  let idTokenObj;
  let jwks;
  beforeAll(async () => {
    const configFetchResult = await fetch(
      `${SERVER_ROOT}/.well-known/openid-configuration`
    );
    const body = await configFetchResult.text();
    const configObj = JSON.parse(body);
    const jwksResponse = await fetch(configObj.jwks_uri);
    jwks = await jwksResponse.json();
    debug("jwks", jwks);

    const authorizationEndpoint = configObj.authorization_endpoint;

    let cookie;
    if (process.env.COOKIE) {
      console.log("Using cookie from env var");
      cookie = process.env.COOKIE;
      await new Promise((resolve) => setTimeout(resolve, 100));
    } else {
      console.log("Obtaining cookie");
      cookie = await getCookie();
    }
    console.log({ cookie });
    let authorizeFetchResult = await fetch(
      `${authorizationEndpoint}?response_type=id_token%20code&display=&scope=openid%20profile%20offline_access&client_id=coolApp2&redirect_uri=http%3A%2F%2Flocalhost%3A3002%2Fredirect&state=84ae2b48-eb1b-4000-8782-ac1cd748aeb0&nonce=12345&request=`,
      {
        headers: {
          cookie,
        },
        redirect: "manual",
      }
    );
    expect(authorizeFetchResult.status).toEqual(302);
    const redirectUri = "http://localhost:3002/redirect?";
    while (
      authorizeFetchResult.headers
        .get("location")
        .substring(0, redirectUri.length) !== redirectUri
    ) {
      console.log(
        "Not redirected back yet",
        authorizeFetchResult.headers.get("location")
      );
      authorizeFetchResult = await fetch(
        authorizeFetchResult.headers.get("location"),
        {
          headers: {
            cookie,
          },
          redirect: "manual",
        }
      );
    }
    const callbackParams = authorizeFetchResult.headers
      .get("location")
      .substring(redirectUri.length)
      .split("&");
    console.log("Redirected back now", callbackParams);
    code = callbackParams[0].substring("code=".length);
    idTokenJwt = callbackParams[1].substring("id_token=".length);
    idTokenObj = decode(idTokenJwt);
  });

  test("Callback redirect receives a code", async () => {
    console.log({ code });
    expect(code.length > 0).toEqual(true);
  });

  test("Callback redirect receives an id token", async () => {
    console.log({ idTokenJwt });
    expect(idTokenJwt.length > 0).toEqual(true);
  });

  test("id token has the right issuer", async () => {
    expect(idTokenObj.iss).toEqual(SERVER_ROOT);
  });

  test.skip("id token has the right audience", async () => {
    expect(idTokenObj.aud).toEqual("coolApp2");
  });
  test.skip("id token has the right authorized party", async () => {
    expect(idTokenObj.azp).toEqual("coolApp2");
  });
  test("id token has the right subject", async () => {
    expect(idTokenObj.sub).toEqual(ALICE_WEBID);
  });
  test("id token has an expiry time a few weeks in the future", async () => {
    const futureWeeks =
      (idTokenObj.exp * 1000 - new Date().getTime()) / (7 * 24 * 3600 * 1000);
    expect(futureWeeks).toBeGreaterThan(1);
    expect(futureWeeks).toBeLessThan(5);
  });
  test("id token has an issued-at time a few seconds in the past", async () => {
    const pastMilliSeconds = new Date().getTime() - idTokenObj.iat * 1000;
    expect(pastMilliSeconds).toBeLessThan(60 * 1000);
    expect(pastMilliSeconds).toBeGreaterThan(0);
  });
  test("id token has a JWT ID", async () => {
    expect(typeof idTokenObj.jti).toEqual("string");
  });
  test("id token has the correct c_hash", async () => {
    expect(idTokenObj.c_hash).toEqual(await hashClaim(code, 256));
  });
  test("id token was signed by issuer", async () => {
    // console.log(jwks.keys.map(key => key.kid));
    let found = false;
    jwks.keys.forEach((key) => {
      if (found) {
        return;
      }
      const pubKeyComponents = {
        e: Buffer.from(key.e, "base64"),
        n: Buffer.from(key.n, "base64"),
      };
      debug("pubKeyComponents", pubKeyComponents);
      const rsaPubKey: RSA = new RSA();
      rsaPubKey.importKey(pubKeyComponents, "components-public");
      const publicPem: string = rsaPubKey.exportKey("pkcs1-public-pem");
      debug("publicPem", publicPem);
      try {
        verify(idTokenJwt, publicPem, {
          algorithms: ["RS256"],
        });
        // console.log(result, key.kid, 'yes');
        found = true;
      } catch (e) {
        // console.log('no', key.kid, e.message);
        // ignore, probably this wasn't the right kid.
      }
    });
    // console.log({ found });
    expect(found).toEqual(true);
  });
});
