import Squawk from '../utils/squawk';

import { Context, GetSubscriptionStatusRequest } from '../types';

export default async function getSubscriptionStatus(ctx: Context, request: GetSubscriptionStatusRequest) {
	const user = await ctx.app.dbClient.users.getById(request.userId);
	const customer = await ctx.app.stripeClient.customers.retrieve(user.stpUserId);

	if (customer.deleted)
		throw new Squawk('customer_deleted');

	return { subscription: customer.metadata['testing_product_name'] ?? 'none' };
}
