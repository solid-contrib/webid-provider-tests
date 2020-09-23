import fetch from "node-fetch";

const SERVER_ROOT = process.env.SERVER_ROOT || "https://server";
const LOGIN_URL = `${SERVER_ROOT}/login`;
const USERNAME = process.env.USERHAME || "alice";
const PASSWORD = process.env.PASSWORD || "alice123";

export async function getCookie(): Promise<string> {
  if (process.env.COOKIE) {
    return process.env.COOKIE;
  }
  const loginForm = await fetch(LOGIN_URL);
  const text = await loginForm.text();
  const parts = text.split('data-requesttoken="');
  let requestToken;
  if (parts.length > 1) {
    requestToken = parts[1].split('"')[0];
    console.log("found request token", requestToken);
    console.log("cookies from login page", loginForm.headers.get("set-cookie"));
  } else {
    console.log("no data-requesttoken element found");
  }

  const result = await fetch(LOGIN_URL, {
    headers: {
      accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
      "accept-language":
        "nl-NL,nl;q=0.9,en-US;q=0.8,en;q=0.7,fr-FR;q=0.6,fr;q=0.5,de-DE;q=0.4,de;q=0.3,es-ES;q=0.2,es;q=0.1,id-ID;q=0.1,id;q=0.1",
      "cache-control": "max-age=0",
      "content-type": "application/x-www-form-urlencoded",
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "same-origin",
      "sec-fetch-user": "?1",
      "upgrade-insecure-requests": "1",
      cookie: loginForm.headers.get("set-cookie"),
    },
    // referrerPolicy: "no-referrer",
    // "mode": "cors",
    body: [
      // `username=${USERNAME}`,
      `user=${USERNAME}`,
      `password=${PASSWORD}`,
      // "timezone=Europe%2FAmsterdam",
      // "timezone_offset=2",
      // `requesttoken=${requestToken}`,
    ].join("&"),
    method: "POST",
    redirect: "manual",
  });
  console.log(
    "Login result",
    result.status,
    result.headers.get("location"),
    result.headers.get("set-cookie")
  );
  console.log("response header values:");
  for (const value of result.headers.values()) {
    console.log(value);
  }
  return result.headers.get("set-cookie");
}
