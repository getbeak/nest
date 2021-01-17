import { Context, EnrollAlphaUserRequest } from '../types';
import { getOrCreateUser } from './stripe-users';

export default async function enrollAlphaUser(ctx: Context, request: EnrollAlphaUserRequest) {
	const { stpUserId } = await getOrCreateUser(ctx, request.email);

	await ctx.app.stripeClient.customers.update(stpUserId, {
		metadata: {
			'testing_product_name': 'beak_alpha',
		}
	});
}
