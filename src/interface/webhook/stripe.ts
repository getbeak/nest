import { APIGatewayProxyEventV2 } from 'aws-lambda';
import Stripe from 'stripe';
import { Logger } from 'tslog';
import { App } from '../../types';
import Squawk from '../../utils/squawk';

export async function handleStripeWebhook(
	logger: Logger,
	app: App,
	event: APIGatewayProxyEventV2
): Promise<Record<string, unknown> | null> {
	if (!event.body)
		throw new Squawk('missing_webhook_body');

	const signature = event.headers['stripe-signature'];
	let stpEvent: Stripe.Event;

	try {
		stpEvent = app.stripeClient.webhooks.constructEvent(event.body, signature, app.config.stpWebhookSecret);
	} catch (error) {
		throw new Squawk('invalid_webhook_payload', null, [Squawk.coerce(error)]);
	}

	switch (stpEvent.type) {
		case 'charge.dispute.closed':
		case 'charge.dispute.created':
		case 'customer.subscription.created':
		case 'customer.subscription.deleted':
		case 'customer.subscription.trial_will_end':
		case 'customer.subscription.updated':
		case 'payment_intent.canceled':
		case 'payment_intent.created':
		case 'payment_intent.payment_failed':
		case 'payment_intent.processing':
		case 'payment_intent.succeeded':

		default:
			return null;
	}
}
