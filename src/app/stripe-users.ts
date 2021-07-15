import ksuid from '@cuvva/ksuid';

import { Context } from '../types';
import Squawk from '../utils/squawk';

export async function getOrCreateUser(ctx: Context, emailAddress: string) {
	const existingUser = await ctx.app.stripeClient.customers.list({
		email: emailAddress,
	});

	if (existingUser.data.length === 1) {
		const existingStripeUser = existingUser.data[0];

		return { userId: existingStripeUser.metadata['user_id'], stripeUser: existingStripeUser };
	}

	const userId = ksuid.generate('user').toString();
	const customer = await ctx.app.stripeClient.customers.create({
		email: emailAddress,
		metadata: {
			user_id: userId,
		},
	});

	await ctx.app.dbClient.users.createOne({
		id: userId,
		stpUserId: customer.id,
	});

	return { userId, stripeUser: customer };
}

export async function getCustomerEmail(ctx: Context, customerId: string) {
	const customer = await ctx.app.stripeClient.customers.retrieve(customerId);

	if (customer.deleted)
		throw new Squawk('customer_deleted');

	return customer.email;
}
