# Nest

Serverless API powering releases, user management, auth, etc. Have a poke around! :)

Base URL: `https://nest.getbeak.app/1/`

## Versions

- `2020-12-14`: Initial version

## Methods

### `send_magic_link`

Sends a magic link enabling a user to authenticate!

#### Request

```json
{
	"client_id": "client_000000C2kdCzNlbL1BqR5FeMatItU",
	"redirect_uri": "https://magic.getbeak.app/",
	"state": "lx/rAzKFsThZ+pqne+uCQZ2OamjZtpW_GtdtUwvEaAg7t",
	"code_challenge_method": "S256",
	"code_challenge": "ec088e759677e0f799ccbe2b3a667c16037af08b0e3dff8732edbe1f42f6ef1c",
	"identifier_type": "email",
	"identifier_value": "example@getbeak.app"
}
```

- `client_id`: The ID of the client requesting the magic link.
- `redirect_uri`: The redirect URI to return too, whitelisted against the client.
- `state`: A web/url safe nonce generated and stored against the challenge for each requested.
- `code_challenge_method`: Always `S256`.
- `code_challenge`: A SHA256 digest of the code verifier, which is send in `authenticate_user`. Websafe base64 encoded.
- `identifier_type`: Always `email`.
- `identifier_value`: The email address to send the magic link too.

### `authenticate_user`

Authenticates a user upon receiving the magic link from above.

#### Request (`authorization_code`)

```json
{
	"client_id": "client_000000C2kdCzNlbL1BqR5FeMatItU",
	"grant_type": "authorization_code",
	"redirect_uri": "https://magic.getbeak.app/",
	"code": "authzcode_000000BRxPaWGu0xDiHFOktPnBtKA.e2d09621646f6c104d7d6def9d1243e5fc22b0df765f8351495906c0ff2d0677",
	"code_verifier": "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"
}
```

- `client_id`: The ID of the client requesting the magic link.
- `grant_type`: Must be `authorization_code` for authenticating.
- `redirect_uri`: The redirect URI whitelisted against the client.
- `code`: The authorization code that we got from the magic link.
- `code_verifier`: The plaintext string that was hashed in the previous step and submitted as `code_challenge`.

#### Request (`refresh_token`)

```json
{
	"client_id": "client_000000C2kdCzNlbL1BqR5FeMatItU",
	"grant_type": "refresh_token",
	"refresh_token": "01.reftok_000000C2kfdVv573A4YW7noYi2Ts8.7af10c1eb4d0c6aec372e2ea7682348b9c1d975ee6891d247117378a9e5ab4ad"
}
```

- `client_id`: The ID of the client requesting the magic link.
- `grant_type`: Must be `authorization_code` for authenticating.
- `refresh_token`: The token used to refresh the auth chain.

#### Response

```json
{
	"access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
	"token_type": "bearer",
	"expires_in": 3600,
	"expires_at": "2020-22-01T00:00:00Z",
	"refresh_token": "01.reftok_000000C2kfdVv573A4YW7noYi2Ts8.7af10c1eb4d0c6aec372e2ea7682348b9c1d975ee6891d247117378a9e5ab4ad",
	"user_id": "user_000000C2kg4d9HyP1Bg09HBF4Bm40",
	"client_id": "client_000000C2kdCzNlbL1BqR5FeMatItU"
}
```

### `get_subscription_status`

Effectively a heartbeat request to check the status of the user's subscription etc.

#### Request

```json
{
	"user_id": "user_000000C2kg4d9HyP1Bg09HBF4Bm40"
}
```

#### Response

```json
{
	"subscription": "beak_alpha"
}
```

### `enroll_alpha_user`

Creates and enrolls a user in the Alpha.

#### Request

```json
{
	"email": "taylor.swift@gmail.com"
}
```

### `list_news_items`

Lists the currently available news items for a client.

#### Request

```json
{
	"client_id": "client_000"
}
```

#### Response

```json
[{
	"id": "newsitem_000",
	"primary": {
		"code": "generic_banner",
		"payload": {
			"emoji": "💃",
			"title": "Very important message",
			"body": "You just know how important it is, you know",
			"action": {
				"cta": "Click me",
				"url": "https://meatspin.com/"
			}
		}
	},
	"fallback": null
}]
```

## Note

To create a bundle that can be deployed, run the following

```bash
yarn
yarn build
rm -rf ./node_modules
yarn package
yarn
```
