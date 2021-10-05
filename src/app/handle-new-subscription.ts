import type { Stripe } from 'stripe';
import { Context } from '../types';
import Squawk from '../utils/squawk';
import { getOrCreateUser } from './auth-authorization-code';

export default async function handleNewSubscription(ctx: Context, stpSubscriptionId: string) {
	const subscription = await ctx.app.stripeClient.subscriptions.retrieve(stpSubscriptionId);

	const [customer, invoice] = await Promise.all([
		ctx.app.stripeClient.customers.retrieve(subscription.customer as string),
		ctx.app.stripeClient.invoices.retrieve(subscription.latest_invoice as string),
	]) as [Stripe.Response<Stripe.Customer>, Stripe.Response<Stripe.Invoice>];

	const payment: Stripe.Response<Stripe.PaymentIntent> = await ctx.app.stripeClient.paymentIntents.retrieve(
		invoice.payment_intent as string,
	);

	// if (!customer.email)
	// 	throw new Squawk('customer_email_missing');

	if (subscription.status !== 'active')
		throw new Squawk('subscription_not_active');

	const email = 'test@google.com';

	const userId = await getOrCreateUser(ctx, email);

	// Check if they already have a subscription
	const activeSubscription = await ctx.app.dbClient.subscriptions.findActiveSubscription(userId);

	// If they do, and have a subscription, handle and exit
	if (Boolean(activeSubscription)) {
		console.log('fuck');

		return;
	}

	// Create stripe mapping
	await ctx.app.dbClient.providerMappings.createMapping(userId, 'stripe', customer.id);

	// Create subscription
	await ctx.app.dbClient.subscriptions.createSubscription(
		userId,
		subscription.items.data[0].plan.product as string,
		subscription.id,
		new Date(subscription.current_period_start * 1000).toISOString(),
		new Date(subscription.current_period_end * 1000).toISOString(),
	);

	// Send welcome email
}
