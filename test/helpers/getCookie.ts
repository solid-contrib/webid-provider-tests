import fetch from "node-fetch";

export async function getCookie(loginUrl): Promise<string> {
  const loginForm = await fetch(loginUrl);
  const text = await loginForm.text();
  const parts = text.split('data-requesttoken="');
  let requestToken;
  if (parts.length > 1) {
    requestToken = parts[1].split('"')[0];
    console.log("found request token", requestToken);
  } else {
    console.log("no data-requesttoken element found");
  }
  const result = await fetch(loginUrl, {
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body: [
      "username=alice",
      "user=alice",
      "password=alice123",
      `requesttoken=${requestToken}`,
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
  return result.headers.get("set-cookie");
}
