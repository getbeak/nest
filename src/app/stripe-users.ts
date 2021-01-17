import ksuid from '@cuvva/ksuid';

import { Context } from '../types';
import Squawk from '../utils/squawk';

export async function getOrCreateUser(ctx: Context, emailAddress: string) {
	const existingUser = await ctx.app.stripeClient.customers.list({
		email: emailAddress,
	});

	if (existingUser.data.length === 1)
		return { userId: existingUser.data[0].metadata['user_id'], stpUserId: existingUser.data[0].id };

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

	return { userId, stpUserId: customer.id };
}

export async function getCustomerEmail(ctx: Context, customerId: string) {
	const customer = await ctx.app.stripeClient.customers.retrieve(customerId);

	if (customer.deleted)
		throw new Squawk('customer_deleted');

	return customer.email;
}
