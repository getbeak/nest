import ksuid from '@cuvva/ksuid';
import crypto from 'crypto';

import { Context, SendMagicLinkRequest } from '../types';
import Squawk from '../utils/squawk';
import { getClient } from './clients';
import sendEmail from './send-email';

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
		device: request.device,
	});

	const code = `${authCode}.${authKey}`;
	const magicLinkUrl = `${client.redirectUri}?code=${code}&state=${encodeURIComponent(request.state)}`;

	await sendEmail(ctx, '🐦 Your Beak Magic Link!', request.identifierValue, 'magic-link', {
		magicLinkUrl,
	});

	return null;
}
