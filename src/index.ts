import {
	APIGatewayProxyEventHeaders,
	APIGatewayProxyEventV2,
	APIGatewayProxyResultV2,
} from 'aws-lambda';
import snakeCaseKeys from 'snakecase-keys';
import { Logger } from 'tslog';

import createApp from './app';
import authenticateUserEvent from './events/authenticate_user.json';
import getSubscriptionStatusEvent from './events/get_subscription_status.json';
import sendMagicLinkEvent from './events/send_magic_link.json';
import router from './rpc/router';
import { Config } from './types';
import Squawk from './utils/squawk';

// These are local testing keys, nice try ;)

const jwtPrivateKeyTest = `-----BEGIN EC PRIVATE KEY-----
MIHcAgEBBEIB5gqMiYlWqZI/yJec3oCljbAn6SH4RyRIhjG6eJEHpFGFuRbiYyk8
XFz+FWdqDUQnQqhluSU3b0cCEqOwhoZ9M9qgBwYFK4EEACOhgYkDgYYABAAm3osJ
/vGKbnoRqeXa3eRgASoCCJ6JHv3O0wxyGM161X5W+G2zHaSn9QmnrJ0Ba39T+Hsu
e7+J7BEYhkGMlWg3EAGpMHYf7GLuCUT25TN+iZiIlXNtDK8vwLCi6ozbGl+jCkh2
shark0UnFEsQ45alBErdtdb88iSyzZkQrrlfwiM1Sg==
-----END EC PRIVATE KEY-----`;

const jwtPublicKeyTest = `-----BEGIN PUBLIC KEY-----
MIGbMBAGByqGSM49AgEGBSuBBAAjA4GGAAQAJt6LCf7xim56Eanl2t3kYAEqAgie
iR79ztMMchjNetV+Vvhtsx2kp/UJp6ydAWt/U/h7Lnu/iewRGIZBjJVoNxABqTB2
H+xi7glE9uUzfomYiJVzbQyvL8CwouqM2xpfowpIdrIWq5NFJxRLEOOWpQRK3bXW
/PIkss2ZEK65X8IjNUo=
-----END PUBLIC KEY-----`;

function getConfig(): Config {
	const env = process.env.APP_ENV ?? 'test';

	const [jwtPrivateKey, jwtPublicKey] = (function readJwtEnv() {
		const jwtKeys = process.env.JWT_KEYS;

		if (!jwtKeys && env !== 'prod')
			return [jwtPrivateKeyTest, jwtPublicKeyTest];

		if (!jwtKeys)
			throw new Squawk('jwt_keys_not_set');

		const { privateKey, publicKey } = JSON.parse(jwtKeys);

		return [privateKey, publicKey];
	}());

	return {
		env,
		jwtPrivateKey,
		jwtPublicKey,
		mongoUri: process.env.MONGO_URI ?? 'mongodb+srv://localhost/nest',
		stpSecretKey: process.env.STRIPE_SECRET_KEY ?? '',
	};
}

const events = {
	sendMagicLink: sendMagicLinkEvent,
	authenticateUser: authenticateUserEvent,
	getSubscriptionStatus: getSubscriptionStatusEvent,
};

const logger = new Logger();
const app = createApp(getConfig());

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
	await app.dbClient.connect();

	const isOrigin = Boolean(getHeader(event.headers, 'origin'));

	try {
		const response = await router(logger, app, event);

		if (!response)
			return createResponse(204, isOrigin);

		return createResponse(200, isOrigin, JSON.stringify(snakeCaseKeys(response)));
	} catch (error) {
		logger.error(error);

		const squawk = Squawk.isSquawk(error) ? error : Squawk.coerce(error);

		return createResponse(500, isOrigin, JSON.stringify(snakeCaseKeys(squawk)));
	}
};

function createResponse(statusCode: number, isOrigin: boolean, body?: string) {
	const response: APIGatewayProxyResultV2 = {
		statusCode,
		body: void 0,
		headers: {
			'content-type': 'application/json',
			'beak-time': (new Date()).toISOString(),
		},
	};

	if (isOrigin) {
		response.headers!['access-control-allow-origin'] = '*';
		response.headers!['access-control-allow-methods'] = 'HEAD, OPTIONS, POST';
		response.headers!['access-control-allow-headers'] = 'content-type';
		response.headers!['access-control-expose-headers'] = 'beak-time';
		response.headers!['access-control-max-age'] = '86400';
	}

	if (body)
		response.body = body;

	return response;
}

function getHeader(headers: APIGatewayProxyEventHeaders, key: string) {
	const header = Object.keys(headers).find(k => k.toLowerCase() === key.toLowerCase());

	if (!header)
		return null;

	return headers[header];
}

export const run = async () => {
	// logger.info(await handler(events.sendMagicLink as APIGatewayProxyEventV2));
	// logger.info(await handler(events.authenticateUser as APIGatewayProxyEventV2));
	// logger.info(await handler(events.getSubscriptionStatus as APIGatewayProxyEventV2));
};
