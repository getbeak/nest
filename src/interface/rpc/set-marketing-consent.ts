import setMarketingConsentImpl from '../../app/set-marketing-consent';
import { Context, SetMarketingConsentRequest } from '../../types';
import Squawk from '../../utils/squawk';
import setMarketingConsentSchema from './set-marketing-consent.json';

export default async function setMarketingConsent(ctx: Context, request: SetMarketingConsentRequest) {
	if (!ctx.auth)
		throw new Squawk('access_denied');

	if (ctx.auth.type !== 'internal' && ctx.auth.userId !== request.userId)
		throw new Squawk('access_denied');

	return await setMarketingConsentImpl(ctx, request);
}

export { setMarketingConsentSchema };
