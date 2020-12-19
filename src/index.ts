import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import snakeCaseKeys from 'snakecase-keys';
import { Logger } from 'tslog';

import createApp from './app';
import sendMagicLinkEvent from './events/send_magic_link.json';
import router from './rpc/router';
import Squawk from './utils/squawk';

function getConfig() {
	return {
		redisUri: process.env.REDIS_URI ?? 'redis://localhost:6379/0',
	};
}

const events = {
	sendMagicLink: sendMagicLinkEvent,
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
	return {
		statusCode,
		body: JSON.stringify(body),
		headers: {
			'content-type': 'application/json',
			'beak-time': (new Date()).toISOString(),
		},
	};
}

export const run = async () => {
	await handler(events.sendMagicLink as APIGatewayProxyEventV2);
};
