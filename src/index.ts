import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { Logger } from 'tslog';
import Squawk from 'util/squawk';

import sendMagicLinkEvent from './events/send_magic_link.json';
import router from './rpc/router';

const events = {
	sendMagicLink: sendMagicLinkEvent,
};

const logger = new Logger();

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
	try {
		const response = await router(logger, event);

		if (!response)
			return { statusCode: 204 };

		return {
			statusCode: 200,
			body: JSON.stringify(response),
			headers: {
				'content-type': 'application/json',
			},
		};
	} catch (error) {
		logger.error(error);

		const squawk = Squawk.isSquawk(error) ? error : Squawk.coerce(error);

		return {
			statusCode: 500,
			body: JSON.stringify(squawk),
			headers: {
				'content-type': 'application/json',
			},
		};
	}
};

export const run = async () => {
	await handler(events.sendMagicLink as APIGatewayProxyEventV2);
};
