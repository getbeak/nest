import { Context } from '../types';
import Squawk from '../utils/squawk';

export default async function handleSubscriptionUpdate(ctx: Context, stpSubscriptionId: string) {
	const stpSubscription = await ctx.app.stripeClient.subscriptions.retrieve(stpSubscriptionId);
	const subscription = await ctx.app.dbClient.subscriptions.findByStripeId(stpSubscription.id);

	if (!subscription)
		throw new Squawk('subscription_not_ready');

	// Update end date/status
	await ctx.app.dbClient.subscriptions.updateSubscription(
		subscription.id,
		{
			startsAt: new Date(stpSubscription.current_period_start * 1000).toISOString(),
			endsAt: new Date(stpSubscription.current_period_end * 1000).toISOString(),
			status: stpSubscription.status,
		},
	);

	// Send email if subscription has ended?
	// await sendEmail(ctx, 'Welcome to Beak!', customer.email, textBody, htmlBody);
}
