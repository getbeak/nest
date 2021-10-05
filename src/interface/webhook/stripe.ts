import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { Logger } from 'tslog';
import { App } from '../../types';

export async function handleStripeWebhook(
	logger: Logger,
	app: App,
	event: APIGatewayProxyEventV2
): Promise<Record<string, unknown> | null> {
	return null;
}
