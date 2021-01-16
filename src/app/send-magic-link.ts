import { SendEmailCommand } from '@aws-sdk/client-ses';
import ksuid from '@cuvva/ksuid';
import crypto from 'crypto';

import { Context, SendMagicLinkRequest } from '../types';
import Squawk from '../utils/squawk';
import { getClient } from './clients';

const expiry = 1200; // 20 minutes

export default async function sendMagicLink(ctx: Context, request: SendMagicLinkRequest) {
	const client = getClient(request.clientId);

	if (!client.redirectUri.includes(request.redirectUri))
		throw new Squawk('invalid_redirect_uri');

	const authCode = ksuid.generate('authzcode').toString();
	const authKey = crypto.randomBytes(32).toString('hex');

	await ctx.app.dbClient.authorizations.createOne({
		id: authCode,
		createdAt: (new Date()).toISOString(),
		expiresAt: (new Date(Date.now() + (expiry * 1000))).toISOString(),
		usedAt: null,
		revokedAt: null,
		clientId: client.id,
		key: authKey,
		state: request.state,
		codeChallengeMethod: 'S256',
		codeChallenge: request.codeChallenge,
		redirectUri: request.redirectUri,
		identifierType: 'email',
		identifierValue: request.identifierValue,
	});

	const code = `${authCode}.${authKey}`;
	const emailUrl = `${client.redirectUri}?code=${code}&state=${encodeURIComponent(request.state)}`;

	const emailText = [
		'Your Beak magic link is below. Enter it into your browser to get going!',
		'',
		emailUrl,
		'',
		'',
		'If you didn\'t request this email you can just ignore it, or reach out to security@getbeak.app',
	].join('\n');

	const emailHtml = [
		'Your requested <a href="https://getbeak.app">Beak</a> login',
		'',
		`<a href="${emailUrl}">Get going!</a>`,
		'',
		'Enjoy Beak!',
		'The Beak Team 🐦',
		'',
		'',
		[
			'If you didn\'t request this email you can just ignore it, or reach out to ',
			'<a href="mailto:security@getbeak.app">security@getbeak.app</a>.',
		].join(''),
		`If the link above doesn't work try this: ${emailUrl}.`,
	].join('<br />');

	await ctx.app.sesClient.send(new SendEmailCommand({
		Destination: {
			ToAddresses: [request.identifierValue],
		},
		Source: 'no-reply@getbeak.app',
		Message: {
			Body: {
				Text: {
					Charset: 'UTF-8',
					Data: emailText,
				},
				Html: {
					Charset: 'UTF-8',
					Data: emailHtml,
				},
			},
			Subject: {
				Charset: 'UTF-8',
				Data: '🐦 Your Beak Magic Link!',
			},
		},
	}));

	return null;
}
