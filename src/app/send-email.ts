import { SendEmailCommand } from '@aws-sdk/client-ses';
import fs from 'fs/promises';
import { compile } from 'handlebars';

import { Context } from '../types';

type Template = 'welcome' | 'welcome-trial' | 'magic-link' | 'duplicate-subscription';

export default async function sendEmail(
	ctx: Context,
	subject: string,
	toAddress: string,
	template: Template,
	templateContext: Record<string, string> = {},
) {
	const [html, text] = await Promise.all([
		fs.readFile(`./data/email-templates/${template}.html`, 'utf-8'),
		fs.readFile(`./data/email-templates/${template}.txt`, 'utf-8'),
	]);

	const htmlTemplate = compile(html);
	const textTemplate = compile(text);

	return await ctx.app.sesClient.send(new SendEmailCommand({
		Destination: {
			ToAddresses: [toAddress],
		},
		Source: 'Beak App <no-reply@getbeak.app>',
		Message: {
			Body: {
				Html: {
					Charset: 'UTF-8',
					Data: htmlTemplate(templateContext),
				},
				Text: {
					Charset: 'UTF-8',
					Data: textTemplate(templateContext),
				},
			},
			Subject: {
				Charset: 'UTF-8',
				Data: subject,
			},
		},
	}));
}
