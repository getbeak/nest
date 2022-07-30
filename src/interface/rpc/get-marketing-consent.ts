import getMarketingConsentImpl from '../../app/get-marketing-consent';
import { Context, GetMarketingConsentRequest } from '../../types';
import Squawk from '../../utils/squawk';
import getMarketingConsentSchema from './get-marketing-consent.json';

export default async function getMarketingConsent(ctx: Context, request: GetMarketingConsentRequest) {
	if (!ctx.auth)
		throw new Squawk('access_denied');

	if (ctx.auth.type !== 'internal' && ctx.auth.userId !== request.userId)
		throw new Squawk('access_denied');

	return await getMarketingConsentImpl(ctx, request);
}

export { getMarketingConsentSchema };
