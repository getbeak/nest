import { Context, GetSubscriptionStatusRequest } from '../types';
import Squawk from '../utils/squawk';

export default async function getSubscriptionStatus(ctx: Context, request: GetSubscriptionStatusRequest) {
	const subscription = await ctx.app.dbClient.subscriptions.findActiveSubscription(request.userId);

	if (!subscription)
		throw new Squawk('no_active_subscription');

	const billingPortalUrl = await getBillingPortalUrlSafe(ctx, subscription.stpCustomerId);

	return {
		startDate: subscription.startsAt,
		endDate: subscription.endsAt,
		status: subscription.status,
		billingPortalUrl,
	};
}

async function getBillingPortalUrlSafe(ctx: Context, stpCustomerId: string) {
	try {
		const bp = await ctx.app.stripeClient.billingPortal.sessions.create({
			customer: stpCustomerId,
		});

		return bp.url;
	} catch (error) {
		ctx.logger.warn('unable to fetch billing portal link', error);

		return null;
	}
}
