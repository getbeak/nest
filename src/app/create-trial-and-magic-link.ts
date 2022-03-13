import { User } from '../db/users';
import { Context, Device, SendMagicLinkRequest } from '../types';
import { unixToIso } from '../utils/dates';
import Squawk from '../utils/squawk';
import { getOrCreateUser } from './auth-authorization-code';
import sendMagicLink from './send-magic-link';

export default async function createTrialAndMagicLink(ctx: Context, request: SendMagicLinkRequest) {
	const user = await findExistingUser(ctx, request.identifierValue.toLocaleLowerCase());

	if (user) {
		// Check if user has a subscription (trialing or not)
		const activeSub = await ctx.app.dbClient.subscriptions.findActiveSubscription(user.id);

		if (activeSub)
			throw new Squawk('already_subscribed');

		// Check if user/fingerprint/beak_id has had a trial before
		await ctx.app.dbClient.trials.ensureUserFreshTrial(request.device!, user.id);
	} else {
		// Check if fingerprint/beak_id has had a trial before
		await ctx.app.dbClient.trials.ensureAnonymousFreshTrial(request.device!);
	}

	// Create trial
	await createTrial(ctx, user, request.identifierValue.toLocaleLowerCase(), request.device!);

	// Send trial magic link
	return await sendMagicLink(ctx, request);
}

async function findExistingUser(ctx: Context, email: string) {
	try {
		const identifier = await ctx.app.dbClient.identifiers.findActiveEmailIdentifier(email);

		return ctx.app.dbClient.users.findById(identifier.userId);
	} catch (error) {
		const squawk = Squawk.coerce(error);

		if (squawk.code === 'not_found')
			return null;

		throw squawk;
	}
}

async function createTrial(ctx: Context, user: User | null, email: string, device: Device) {
	// Get or Create Beak User
	const userId = user ? user.id : await getOrCreateUser(ctx, email);

	// Create Stripe Customer
	const stpCustomer = await ctx.app.stripeClient.customers.create({
		email,
		metadata: {
			user_id: userId,
		},
	});

	// Ensure mapping exists
	await ctx.app.dbClient.providerMappings.createOrUpdateMapping(userId, 'stripe', stpCustomer.id);

	// Create Stripe Trial Subscription
	// We'll let the webhooks ingest the subscription data
	const stpSubscription = await ctx.app.stripeClient.subscriptions.create({
		customer: stpCustomer.id,
		items: [{ price: ctx.app.config.stpSubscriptionPriceId }],
		trial_period_days: 14,
	});

	// Create Trial data
	await ctx.app.dbClient.trials.createTrial(
		userId,
		stpSubscription.items.data[0].plan.product as string,
		stpSubscription.id,
		stpCustomer.id,
		unixToIso(stpSubscription.trial_start!),
		unixToIso(stpSubscription.trial_end!),
		device.fingerprint,
		device.beakId,
	);
}
