import mailchimpMarketing from '@mailchimp/mailchimp_marketing';
import crypto from 'crypto';
import Squawk from 'utils/squawk';

import { ConsentLevel } from '../db/marketing-consent';
import { Context, SetMarketingConsentRequest } from '../types';

export default async function setMarketingConsent(ctx: Context, request: SetMarketingConsentRequest): Promise<void> {
	const user = await ctx.app.dbClient.users.findUser(request.userId);
	const identifiers = await ctx.app.dbClient.identifiers.listUserIdentifiers(user.id);
	const emails = identifiers.filter(i => i.identifierType === 'email' && !i.removedAt);

	// For each email, set consent
	await Promise.all(emails.map(async e => {
		const digest = crypto.createHash('md5')
			.update(e.identifierValue)
			.digest('hex');

		await setMailchimpMarketingLevel(ctx, e.identifierValue, digest, request.level);
	}));

	await ctx.app.dbClient.marketingConsent.upsertMarketingConsent(user.id, request.level);
}

async function setMailchimpMarketingLevel(ctx: Context, email: string, hash: string, level: ConsentLevel) {
	const mailchimpStatus = level === 'none' ? 'unsubscribed' : 'subscribed';

	try {
		await mailchimpMarketing.lists.setListMember('e580e6811f', hash, {
			email_address: email,
			status_if_new: mailchimpStatus,
			status: mailchimpStatus,
		});
	} catch (error) {
		ctx.logger.error('mailchimp set list member failure', error);

		throw new Squawk('mailchimp_set_failure');
	}
}
