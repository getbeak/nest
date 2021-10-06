import { Context, GetSubscriptionStatusRequest } from '../types';
import Squawk from '../utils/squawk';

export default async function getSubscriptionStatus(ctx: Context, request: GetSubscriptionStatusRequest) {
	const subscription = await ctx.app.dbClient.subscriptions.findActiveSubscription(request.userId);

	if (!subscription)
		throw new Squawk('no_active_subscription');

	return {
		startDate: subscription.startsAt,
		endDate: subscription.endsAt,
		status: 'active',
	};
}
