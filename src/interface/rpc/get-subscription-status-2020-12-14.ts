import { Context, GetSubscriptionStatusRequest } from '../../types';
import Squawk from '../../utils/squawk';
import getSubscriptionStatusSchema20201214 from './get-subscription-status-2020-12-14.json';

export default async function getSubscriptionStatus20201214(ctx: Context, request: GetSubscriptionStatusRequest) {
	if (!ctx.auth)
		throw new Squawk('access_denied');

	if (ctx.auth.type !== 'internal' && ctx.auth.userId !== request.userId)
		throw new Squawk('access_denied');

	throw new Squawk('not_supported');
}

export { getSubscriptionStatusSchema20201214 };
