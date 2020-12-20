import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
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

const jwtPrivateKey = `-----BEGIN EC PRIVATE KEY-----
MHQCAQEEICM/0xcIZaf0DWn6ghQbsQgiPa40IcbYdPlADA+68CESoAcGBSuBBAAK
oUQDQgAETdHguV99jsYC9oQJEdwS7Ow9Yi3kj/riYvdL8YZqEHyjBHBbNVgpNzd+
a04o4x6BCXYzK8+r4fIzxUwT1XBGAA==
-----END EC PRIVATE KEY-----`;

const jwtPublicKey = `-----BEGIN PUBLIC KEY-----
MFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAETdHguV99jsYC9oQJEdwS7Ow9Yi3kj/ri
YvdL8YZqEHyjBHBbNVgpNzd+a04o4x6BCXYzK8+r4fIzxUwT1XBGAA==
-----END PUBLIC KEY-----`;

function getConfig(): Config {
	return {
		jwtPrivateKey: process.env.JWT_PRIVATE_KEY ?? jwtPrivateKey,
		jwtPublicKey: process.env.JWT_PUBLIC_KEY ?? jwtPublicKey,
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
	try {
		const response = await router(logger, app, event);

		if (!response)
			return createResponse(204);

		return createResponse(200, JSON.stringify(snakeCaseKeys(response)));
	} catch (error) {
		logger.error(error);

		const squawk = Squawk.isSquawk(error) ? error : Squawk.coerce(error);

		return createResponse(200, JSON.stringify(snakeCaseKeys(squawk)));
	}
};

function createResponse(statusCode: number, body?: string) {
	const response: APIGatewayProxyResultV2 = {
		statusCode,
		body: void 0,
		headers: {
			'content-type': 'application/json',
			'beak-time': (new Date()).toISOString(),
		},
	};

	if (body)
		response.body = body;

	return response;
}

export const run = async () => {
	// logger.info(await handler(events.sendMagicLink as APIGatewayProxyEventV2));
	// logger.info(await handler(events.authenticateUser as APIGatewayProxyEventV2));
	logger.info(await handler(events.getSubscriptionStatus as APIGatewayProxyEventV2));
};
