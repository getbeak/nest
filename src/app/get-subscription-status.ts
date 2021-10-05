import { Context, GetSubscriptionStatusRequest } from '../types';
import Squawk from '../utils/squawk';

export default async function getSubscriptionStatus(_ctx: Context, _request: GetSubscriptionStatusRequest) {
	throw new Squawk('deprecated');
}
