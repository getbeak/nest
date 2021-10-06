import { APIGatewayProxyEventV2 } from 'aws-lambda';
import Stripe from 'stripe';

import handleNewSubscription from '../../app/handle-new-subscription';
import { Context } from '../../types';
import Squawk from '../../utils/squawk';

export async function handleStripeWebhook(
	ctx: Context,
	event: APIGatewayProxyEventV2,
): Promise<Record<string, unknown> | null> {
	if (!event.body)
		throw new Squawk('missing_webhook_body');

	const signature = event.headers['stripe-signature'];
	let stpEvent: Stripe.Event;

	try {
		stpEvent = ctx.app.stripeClient.webhooks.constructEvent(event.body, signature, ctx.app.config.stpWebhookSecret);
	} catch (error) {
		throw new Squawk('invalid_webhook_payload', null, [Squawk.coerce(error)]);
	}

	switch (stpEvent.type) {
		case 'customer.subscription.created': {
			const subscription = stpEvent.data.object as Record<string, string>;

			await handleNewSubscription(ctx, subscription.id);
			break;
		}

		case 'customer.subscription.updated':
		case 'customer.subscription.deleted':
			break;

		// May be useful in the future
		case 'charge.dispute.closed':
		case 'charge.dispute.created':
		case 'customer.subscription.trial_will_end':
		case 'payment_intent.canceled':
		case 'payment_intent.created':
		case 'payment_intent.payment_failed':
		case 'payment_intent.processing':
		case 'payment_intent.succeeded':

			break;

		default:
			break;
	}

	return { received: true };
}
