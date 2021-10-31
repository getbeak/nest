import type { Stripe } from 'stripe';

import { Context } from '../types';
import Squawk from '../utils/squawk';
import { getOrCreateUser } from './auth-authorization-code';
import sendEmail from './send-email';

export default async function handleSubscriptionCreated(ctx: Context, stpSubscriptionId: string) {
	const subscription = await ctx.app.stripeClient.subscriptions.retrieve(stpSubscriptionId);
	const customer = await ctx.app.stripeClient.customers.retrieve(subscription.customer as string) as Stripe.Response<Stripe.Customer>;

	if (!['active', 'incomplete'].includes(subscription.status)) {
		// throw new Squawk('subscription_not_valid', { status: subscription.status });
		return;
	}

	// If we're not on prod, ensure that the correct coupon was used to create the subscription
	if (!notEligibleOrPassedCouponRequirement(ctx, subscription))
		return;

	if (!customer.email)
		throw new Squawk('customer_email_missing');

	const userId = await getOrCreateUser(ctx, customer.email);

	// Create stripe mapping
	await ctx.app.dbClient.providerMappings.createOrUpdateMapping(userId, 'stripe', customer.id);

	// Check if they already have a subscription
	// If they do, cancel, refund, and inform
	if (await ctx.app.dbClient.subscriptions.findActiveSubscription(userId)) {
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

	const textBody = '';
	const htmlBody = '';

	// Send welcome email
	await sendEmail(ctx, 'Welcome to Beak!', customer.email, textBody, htmlBody);
}

function notEligibleOrPassedCouponRequirement(ctx: Context, subscription: Stripe.Response<Stripe.Subscription>) {
	if (ctx.app.config.env === 'prod')
		return true;

	if (!subscription.discount || !ctx.app.config.requiredCoupon)
		return true;

	return subscription.discount.coupon.id === ctx.app.config.requiredCoupon;
}

async function rejectSubscription(ctx: Context, emailAddress: string, subscriptionId: string) {
	await Promise.all([
		ctx.app.stripeClient.subscriptions.del(subscriptionId, { prorate: true, invoice_now: true }),
	]);

	const textBody = '';
	const htmlBody = '';

	await sendEmail(ctx, 'Refund tings!', emailAddress, textBody, htmlBody);
}
