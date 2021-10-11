# webid-provider-tests
A test suite with some basic happy-path checks against a [DPop-based WebID-OIDC](https://github.com/solid/authentication-panel/blob/master/oidc-authentication.md) provider.

See also [this manual solid-oidc IDP tester page](https://people.apache.org/~acoburn/solid/).

## Usage
Make sure you have `git` and `node`, in a terminal run:
```sh
git clone https://github.com/solid/webid-provider-tests
cd webid-provider-tests
npm install
```
And then ...

### In development
Start your server with a self-signed cert on port 443 of localhost and run:
```sh
NODE_TLS_REJECT_UNAUTHORIZED=0 SERVER_ROOT=https://localhost ALICE_WEBID=https://localhost/profile/card#me npm run jest
```

### Against production
Using a POST to `{SERVER}/login` to exchange a user/password for a cookie:
```sh
SERVER_ROOT=https://solid.community ALICE_WEBID=https://alice.solid.community/profile/card#me COOKIE=... npm run jest
```
Or specifying the cookie directly:
```sh
export NODE_TLS_REJECT_UNAUTHORIZED=0
export SERVER_ROOT="https://localhost"
export ALICE_WEBID="https://localhost/apps/solid/@alice/turtle#me"
export COOKIE="ocwz72epe95s=366f700021bef2b4c9788e841c92959b; oc_sessionPassphrase=QbOq65GfHgCSvTW8pZRPU%2FPRwdgt5Bp9VRFJMYqRdpqCAGuc74mKc1ot1EXB10FCbWA8DbNmU7FN21iojpTyEa8BMPlgFeTc4JwAx4FbpVUnEKd5nrdGkbj1UTnX6SGl; __Host-nc_sameSiteCookielax=true; __Host-nc_sameSiteCookiestrict=true; nc_username=alice; nc_token=va79N4xcZhBeEOYHbHHMPUgF57Gc83Ks; nc_session_id=366f700021bef2b4c9788e841c92959b"
npm run jest
```

To obtain a cookie for a server you can use the helper images from https://github.com/pdsinterop/test-suites/tree/master/servers.
