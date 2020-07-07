# webid-provider-tests
A test suite with some basic happy-path checks against a DPop-based WebID-OIDC provider.

## Usage
### In development
Start your server with a self-signed cert on port 443 of localhost and run:
```sh
NODE_TLS_REJECT_UNAUTHORIZED=0 SERVER_ROOT=https://localhost ALICE_WEBID=https://localhost/profile/card#me npm run jest
```

### Against production
```sh
SERVER_ROOT=https://solid.community ALICE_WEBID=https://michielbdejong.solid.community/profile/card#me npm run jest
```