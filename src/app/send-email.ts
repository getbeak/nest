import { SendEmailCommand } from '@aws-sdk/client-ses';

import { Context } from '../types';

export default async function sendEmail(
	ctx: Context,
	subject: string,
	toAddress: string,
	textBody: string,
	htmlBody: string,
) {
	return await ctx.app.sesClient.send(new SendEmailCommand({
		Destination: {
			ToAddresses: [toAddress],
		},
		Source: 'Beak App <no-reply@getbeak.app>',
		Message: {
			Body: {
				Text: {
					Charset: 'UTF-8',
					Data: textBody,
				},
				Html: {
					Charset: 'UTF-8',
					Data: htmlBody,
				},
			},
			Subject: {
				Charset: 'UTF-8',
				Data: subject,
			},
		},
	}));
}
