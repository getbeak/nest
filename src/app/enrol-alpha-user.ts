import { SendEmailCommand } from '@aws-sdk/client-ses';
import { promises as fs } from 'fs';

import { Context, EnrolAlphaUserRequest } from '../types';
import Squawk from '../utils/squawk';
import { getOrCreateUser } from './stripe-users';

export default async function enrolAlphaUser(ctx: Context, request: EnrolAlphaUserRequest) {
	const { stripeUser } = await getOrCreateUser(ctx, request.email);

	if (stripeUser.metadata.testing_product_name === 'beak_alpha')
		throw new Squawk('user_already_enrolled');

	const emailTemplateHtml = await fs.readFile('./data/email-templates/beta-enrolment.html', 'utf8');

	await Promise.all([
		ctx.app.stripeClient.customers.update(stripeUser.id, {
			metadata: { testing_product_name: 'beak_alpha' },
		}),
		await ctx.app.sesClient.send(new SendEmailCommand({
			Destination: {
				ToAddresses: [request.email],
			},
			Source: 'Beak App <no-reply@getbeak.app>',
			Message: {
				Body: {
					Html: {
						Charset: 'UTF-8',
						Data: emailTemplateHtml,
					},
				},
				Subject: {
					Charset: 'UTF-8',
					Data: '🐦 Welcome to the Beak Beta!',
				},
			},
		})),
	]);
}
