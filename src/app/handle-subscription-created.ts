import type { Stripe } from 'stripe';

import { Context } from '../types';
import Squawk from '../utils/squawk';
import { getOrCreateUser } from './auth-authorization-code';
import sendEmail from './send-email';

export default async function handleSubscriptionCreated(ctx: Context, stpSubscriptionId: string) {
	const subscription = await ctx.app.stripeClient.subscriptions.retrieve(stpSubscriptionId);

	const [customer, invoice] = await Promise.all([
		ctx.app.stripeClient.customers.retrieve(subscription.customer as string),
		ctx.app.stripeClient.invoices.retrieve(subscription.latest_invoice as string),
	]) as [Stripe.Response<Stripe.Customer>, Stripe.Response<Stripe.Invoice>];

	const payment: Stripe.Response<Stripe.PaymentIntent> = await ctx.app.stripeClient.paymentIntents.retrieve(
		invoice.payment_intent as string,
	);

	if (['active', 'incomplete'].includes(subscription.status)) {
		// throw new Squawk('subscription_not_valid', { status: subscription.status });
		return;
	}

	if (!customer.email)
		throw new Squawk('customer_email_missing');

	const userId = await getOrCreateUser(ctx, customer.email);

	// Create stripe mapping
	await ctx.app.dbClient.providerMappings.createOrUpdateMapping(userId, 'stripe', customer.id);

	// Check if they already have a subscription
	const activeSubscription = await ctx.app.dbClient.subscriptions.findActiveSubscription(userId);

	// If they do, and have a subscription, handle and exit
	if (activeSubscription) {
		await rejectSubscription(ctx, customer.email, subscription.id, payment);

		return;
	}

	// Set subscription information
	await ctx.app.dbClient.subscriptions.createSubscription(
		userId,
		subscription.items.data[0].plan.product as string,
		subscription.id,
		new Date(subscription.current_period_start * 1000).toISOString(),
		new Date(subscription.current_period_end * 1000).toISOString(),
		subscription.status,
	);

	const textBody = '';
	const htmlBody = '';

	// Send welcome email
	await sendEmail(ctx, 'Welcome to Beak!', customer.email, textBody, htmlBody);
}

async function rejectSubscription(
	ctx: Context,
	emailAddress: string,
	subscriptionId: string,
	payment: Stripe.Response<Stripe.PaymentIntent>,
) {
	await Promise.all([
		ctx.app.stripeClient.refunds.create({ payment_intent: payment.id, reason: 'duplicate' }),
		ctx.app.stripeClient.subscriptions.del(subscriptionId, { invoice_now: false }),
	]);

	const textBody = '';
	const htmlBody = '';

	await sendEmail(ctx, 'Refund tings!', emailAddress, textBody, htmlBody);
}
