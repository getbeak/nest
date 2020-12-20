
import Squawk from '../utils/squawk';
import getSubscriptionStatusImpl from '../app/get-subscription-status';
import { GetSubscriptionStatusRequest, Context } from '../types';
import getSubscriptionStatusSchema from './get-subscription-status.json';

export default async function getSubscriptionStatus(ctx: Context, request: GetSubscriptionStatusRequest) {
	if (!ctx.auth)
		throw new Squawk('access_denied');
	
	if (ctx.auth !== request.userId)
		throw new Squawk('access_denied');

	return await getSubscriptionStatusImpl(ctx, request);
}

export { getSubscriptionStatusSchema };
