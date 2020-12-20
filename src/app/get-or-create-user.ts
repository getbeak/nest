import ksuid from '@cuvva/ksuid';

import { Context } from '../types';

export default async function getOrCreateUser(ctx: Context, emailAddress: string) {
	const existingUser = await ctx.app.stripeClient.customers.list({
		email: emailAddress,
	});

	if (existingUser.data.length === 1)
		return existingUser.data[0].metadata['user_id'];

	const userId = ksuid.generate('user').toString();

	await ctx.app.stripeClient.customers.create({
		email: emailAddress,
		metadata: {
			user_id: userId,
		},
	});

	return userId;
}
