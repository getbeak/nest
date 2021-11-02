import type { Stripe } from 'stripe';

import { Context } from '../types';
import Squawk from '../utils/squawk';
import { getOrCreateUser } from './auth-authorization-code';
import sendEmail from './send-email';

type StpResponse<T> = Stripe.Response<T>;
type StpCustomer = Stripe.Customer;
type StpSubscription = Stripe.Subscription;

export default async function handleSubscriptionCreated(ctx: Context, stpSubscriptionId: string) {
	const stpClient = ctx.app.stripeClient;
	const subscription = await stpClient.subscriptions.retrieve(stpSubscriptionId);
	const customer = await stpClient.customers.retrieve(subscription.customer as string) as StpResponse<StpCustomer>;

	if (!['active', 'incomplete'].includes(subscription.status))
		throw new Squawk('subscription_not_valid', { status: subscription.status });

	// If we're not on prod, ensure that the correct coupon was used to create the subscription
	if (!notEligibleOrPassedCouponRequirement(ctx, subscription)) {
		// Cancel the subscription
		await ctx.app.stripeClient.subscriptions.del(subscription.id, { invoice_now: true });

		return;
	}

	if (!customer.email)
		throw new Squawk('customer_email_missing');

	const userId = await getOrCreateUser(ctx, customer.email);

	// Create stripe mapping
	await ctx.app.dbClient.providerMappings.createOrUpdateMapping(userId, 'stripe', customer.id);

	const activeSubscription = await ctx.app.dbClient.subscriptions.findActiveSubscription(userId);

	// Check if they already have a subscription. if they do, cancel, refund, and inform
	if (activeSubscription) {
		// Do nothing if it's the same subscription id
		if (activeSubscription.stpSubscriptionId === subscription.id)
			return;

		await rejectSubscription(ctx, customer.email, subscription.id);

		return;
	}

	// Set subscription information
	await ctx.app.dbClient.subscriptions.createSubscription(
		userId,
		subscription.items.data[0].plan.product as string,
		subscription.id,
		customer.id,
		new Date(subscription.current_period_start * 1000).toISOString(),
		new Date(subscription.current_period_end * 1000).toISOString(),
		subscription.status,
	);

	// Send welcome email
	await sendEmail(ctx, 'Welcome to Beak!', customer.email, 'welcome');
}

function notEligibleOrPassedCouponRequirement(ctx: Context, subscription: StpResponse<StpSubscription>) {
	if (ctx.app.config.env === 'prod')
		return true;

	if (!subscription.discount || !ctx.app.config.requiredCoupon)
		return true;

	return subscription.discount.promotion_code === ctx.app.config.requiredCoupon;
}

async function rejectSubscription(ctx: Context, emailAddress: string, subscriptionId: string) {
	await ctx.app.stripeClient.subscriptions.del(subscriptionId, {
		prorate: true,
		invoice_now: true,
	});

	await sendEmail(ctx, 'Duplicate Beak Subscription', emailAddress, 'duplicate-subscription');
}
