import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { Logger } from 'tslog';

import { App, Context } from '../../types';
import Squawk from '../../utils/squawk';
import { handleStripeWebhook } from './stripe';

const urlRegex = /^\/(\d)\/webhook\/(.+)$/;
const qualifierRegex = /^\/\d\/webhook\//;

export function qualifier(_logger: Logger, _app: App, event: APIGatewayProxyEventV2): boolean {
	return qualifierRegex.test(event.requestContext.http.path);
}

export const runner = async (
	logger: Logger,
	app: App,
	event: APIGatewayProxyEventV2,
): Promise<Record<string, unknown> | null> => {
	const { webhookProvider } = parsePath(event.rawPath);
	const ctx: Context = {
		app,
		logger,
		auth: null,
		request: {
			awsRequestId: event.requestContext.requestId,
			clientIp: event.requestContext.http.sourceIp,
			userAgent: event.requestContext.http.userAgent,
		},
	};

	switch (webhookProvider) {
		case 'stripe':
			return await handleStripeWebhook(ctx, event);

		default:
			throw new Squawk('unknown_webhook_provider');
	}
};

function parsePath(path: string) {
	const matches = urlRegex.exec(path);

	if (!matches)
		throw new Squawk('malformed_url', { path });

	const [, baseVersion, webhookProvider] = matches;

	if (baseVersion !== '1')
		throw new Squawk('unknown_version', { supportedVersion: '1' });

	return { webhookProvider };
}
