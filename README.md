# Nest

Serverless API powering releases, user management, auth, etc. Have a poke around! :)

Prod URL: `https://nest.getbeak.app/1/`
Nonprod URL: `https://nest.nonprod-getbeak.app/1/`

## API methods

The API has no prefix, it goes straight to the version information.

**Versions**:

- `2020-12-14`: Initial version
- `2021-10-06`: Updated `get_subscription_status` to support new subscription states

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
	"identifier_value": "example@getbeak.app",
	"device": {
		"platform": "mac",
		"beak_id": "c3f163f8-b9da-41fb-b8e5-59af2ff848cb",
		"fingerprint": "c601897118286408c19bb71db2cf1087975214cfcc6dd261a552b2779c8a5ec662b9808adfb98dabb7f14e5b0ea1b2c3149be2ffef2f5929758ebec68036bdee"
	}
}
```

- `client_id`: The ID of the client requesting the magic link.
- `redirect_uri`: The redirect URI to return too, whitelisted against the client.
- `state`: A web/url safe nonce generated and stored against the challenge for each requested.
- `code_challenge_method`: Always `S256`.
- `code_challenge`: A SHA256 digest of the code verifier, which is send in `authenticate_user`. Websafe base64 encoded.
- `identifier_type`: Always `email`.
- `identifier_value`: The email address to send the magic link too.
- `device`: Optional field containing device information
	- `platform`: The platform Beak is running on.
	- `beak_id`: The beak specific unique session id.
	- `fingerprint`: The physical hardware id.

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

Get's the current state of a user's subscription.

#### Request

```json
{
	"user_id": "user_000000C2kg4d9HyP1Bg09HBF4Bm40"
}
```

#### Response

```json
{
	"status": "active",
	"billing_portal_url": "https://billing.stripe.com/xxx",
	"start_date": "2021-10-06T17:52:44.192Z",
	"end_date": "2022-10-06T17:52:44.192Z"
}
```

`billing_portal_url` can be `null` if there are issues connecting to Stripe.

### `get_user`

Get's information about the user.

#### Request

```json
{
	"user_id": "user_000000C2kg4d9HyP1Bg09HBF4Bm40"
}
```

#### Response

```json
{
	"id": "user_000000C2kg4d9HyP1Bg09HBF4Bm40",
	"created_at": "2021-10-09T16:00:15.844Z",
	"identifiers": [{
		"id": "userident_000000C2kg4d9HyP1Bg09HBF4Bm42",
		"identifier_type": "email",
		"identifier_value": "taylor.swift@getbeak.app",
		"created_at": "2021-10-10T15:49:58.931Z",
		"updated_at": "2021-10-10T15:49:58.931Z",
		"verified_at": "2021-10-10T15:49:58.931Z",
		"removed_at": null
	}]
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
		"dismissible": false,
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

### `create_trial_and_magic_link`

Creates a new user and subscription trial. The magic link sent to the user is trial specific, so it will open the relevant trial onboarding flow when followed.

#### Request

```json
{
	"client_id": "client_000000C2kdCzNlbL1BqR5FeMatItU",
	"redirect_uri": "https://magic.getbeak.app/",
	"state": "lx/rAzKFsThZ+pqne+uCQZ2OamjZtpW_GtdtUwvEaAg7t",
	"code_challenge_method": "S256",
	"code_challenge": "ec088e759677e0f799ccbe2b3a667c16037af08b0e3dff8732edbe1f42f6ef1c",
	"identifier_type": "email",
	"identifier_value": "example@getbeak.app",
	"device": {
		"platform": "mac",
		"beak_id": "c3f163f8-b9da-41fb-b8e5-59af2ff848cb",
		"fingerprint": "c601897118286408c19bb71db2cf1087975214cfcc6dd261a552b2779c8a5ec662b9808adfb98dabb7f14e5b0ea1b2c3149be2ffef2f5929758ebec68036bdee"
	}
}
```

- `client_id`: The ID of the client requesting the magic link.
- `redirect_uri`: The redirect URI to return too, whitelisted against the client.
- `state`: A web/url safe nonce generated and stored against the challenge for each requested.
- `code_challenge_method`: Always `S256`.
- `code_challenge`: A SHA256 digest of the code verifier, which is send in `authenticate_user`. Websafe base64 encoded.
- `identifier_type`: Always `email`.
- `identifier_value`: The email address to send the magic link too.
- `device`: Optional field containing device information
	- `platform`: The platform Beak is running on.
	- `beak_id`: The beak specific unique session id.
	- `fingerprint`: The physical hardware id.


### `get_marketing_consent`

Returns the selected marketing consent level for a user. An error with the code `awaiting_consent` will be returned if the user hasn't set a consent level yet.

#### Request

```json
{
	"user_id": "user_000000C2kdCzNlbL1BqR5FeMatItU"
}
```

#### Response

```json
{
	"level": "general"
}
```

- `level`: The consent level selected. Either `general` or `none`.

### `set_marketing_consent`

Returns the selected marketing consent level for a user. An error with the code `awaiting_consent` will be returned if the user hasn't set a consent level yet.

#### Request

```json
{
	"user_id": "user_000000C2kdCzNlbL1BqR5FeMatItU",
	"level": "general"
}
```

## Webhooks

Webhooks URL's comprise of two parts; the webhook indicator, followed by the provider value. Each provider has an example below.

### `stripe`

Full path: `1/webhook/stripe`

Stripe webhooks are used to invoke internal logic based on changing states of a users subscription, payment, or god forbid, dispute.

#### Supported events

- `charge.dispute.closed`
- `charge.dispute.created`
- `customer.subscription.created`
- `customer.subscription.deleted`
- `customer.subscription.trial_will_end`
- `customer.subscription.updated`
- `payment_intent.canceled`
- `payment_intent.created`
- `payment_intent.payment_failed`
- `payment_intent.processing`
- `payment_intent.succeeded`

## Internal data

All internal data is stored in MongoDB. All schema definitions are using TypeScript definitions.

### `access_tokens`

```ts
interface AccessToken {
	id: string;
	clientId: string;
	userId: string;
	grant: Grant;
	rootGrant: Grant;
	cidrBlocks: string[];
	createdAt: string;
	expiresAt: string;
	revokedAt: string | null;
}
```

### `authorizations`

```ts
interface Authorizations {
	id: string;
	key: string;
	clientId: string;
	state: string;
	codeChallengeMethod: 'S256';
	codeChallenge: string;
	redirectUri: string;
	identifierType: 'email';
	identifierValue: string;
	createdAt: string;
	expiresAt: string;
	usedAt: string | null;
	revokedAt: string | null;
}
```

### `identifiers`

```ts
interface Identifiers {
	id: string;
	userId: string;
	identifierType: 'email';
	identifierValue: string;
	createdAt: string;
	updatedAt: string | null;
	verifiedAt: string;
	removedAt: string | null;
}
```

### `marketing-consent`

```ts
interface MarketingConsent {
	id: string;
	userId: string;
	level: 'none' | 'general';
	createdAt: string;
	updatedAt: string | null;
}
```

### `provider-mappings`

```ts
interface ExternalMappings {
	id: string;
	userId: string;
	providerType: 'stripe';
	providerValue: string;
	createdAt: string;
	removedAt: string | null;
}
```

### `refresh-tokens`

```ts
interface RefreshTokens {
	id: string;
	key: string;
	clientId: string;
	userId: string;
	grant: Grant;
	rootGrant: Grant;
	cidrBlocks: string[];
	createdAt: string;
	expiresAt: string;
	usedAt: string | null;
	revokedAt: string | null;
}
```

### `subscriptions`

```ts
interface Subscriptions {
	id: string;
	userId: string;
	stpProductId: string;
	stpSubscriptionId: string;
	stpCustomerId: string;
	startsAt: string;
	endsAt: string;
	createdAt: string;
	updatedAt: string | null;
}
```

### `users`

```ts
interface Users {
	id: string;
	createdAt: string;
}
```
