import { CancelType } from 'db/subscriptions';
import Stripe from 'stripe';

import { Context } from '../types';
import Squawk from '../utils/squawk';

export default async function handleSubscriptionUpdate(ctx: Context, stpEventType: string, stpSubscriptionId: string) {
	const stpSubscription = await ctx.app.stripeClient.subscriptions.retrieve(stpSubscriptionId);
	const subscription = await ctx.app.dbClient.subscriptions.findByStripeId(stpSubscription.id);

	if (!subscription) {
		// If the subscription has been deleted, don't worry about this failing
		if (stpEventType === 'customer.subscription.deleted')
			return;

		throw new Squawk('subscription_not_ready');
	}

	// Update end date/status
	await ctx.app.dbClient.subscriptions.updateSubscription(
		subscription.id,
		{
			startsAt: stpDateToIso(stpSubscription.current_period_start)!,
			endsAt: stpDateToIso(stpSubscription.current_period_end)!,
			status: stpSubscription.status,
			cancelledAt: stpDateToIso(stpSubscription.canceled_at),
			cancelAt: stpDateToIso(stpSubscription.cancel_at),
			cancelType: getCancelType(stpSubscription),
		},
	);

	// Send email if subscription has ended?
}

function stpDateToIso(date: number | null) {
	if (date === null)
		return null;

	return new Date(date * 1000).toISOString();
}

function getCancelType(sub: Stripe.Response<Stripe.Subscription>): CancelType | null {
	if (!sub.canceled_at)
		return null;

	if (sub.cancel_at_period_end)
		return 'period_end';

	return 'immediate';
}
