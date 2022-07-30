import { Context, GetMarketingConsentRequest, GetMarketingConsentResponse } from '../types';
import Squawk from '../utils/squawk';

export default async function getMarketingConsent(
	ctx: Context,
	request: GetMarketingConsentRequest,
): Promise<GetMarketingConsentResponse> {
	const user = await ctx.app.dbClient.users.findUser(request.userId);

	try {
		const consent = await ctx.app.dbClient.marketingConsent.findUserMarketingConsent(user.id);

		return { level: consent.level };
	} catch (error) {
		if (!(error instanceof Squawk))
			throw error;

		if (error.code === 'not_found')
			throw new Squawk('awaiting_consent');

		throw error;
	}
}
