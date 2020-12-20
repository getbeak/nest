import crypto from 'crypto';

import { AuthenticateUserRequest, Context, Grant } from '../types';
import Squawk from '../utils/squawk';
import getOrCreateUser from './get-or-create-user';

export async function validateAuthorizationCode(ctx: Context, request: AuthenticateUserRequest) {
	const [authCode, authKey, ...spare] = request.code.split('.');

	if (!authCode || !authKey || spare.length > 0)
		throw new Squawk('malformed_code');

	const record = await ctx.app.dbClient.authorizations.getById(authCode);

	if (record.key !== authKey)
		throw new Squawk('token_not_found');

	if (record.usedAt)
		throw new Squawk('token_used');

	// NOTE(afr): Don't be too transparent with the client about revocations - dangeroux
	if (record.revokedAt)
		throw new Squawk('authorization_not_found');

	if (record.expiresAt <= (new Date()).toISOString())
		throw new Squawk('token_expired');

	if (record.clientId !== request.clientId)
		throw new Squawk('incorrect_client');

	if (record.redirectUri !== request.redirectUri)
		throw new Squawk('incorrect_redirect_uri');

	if (!request.codeVerifier || record.codeChallenge !== createCodeChallenge(request.codeVerifier))
		throw new Squawk('incorrect_code_verifier');
}

export async function handleAuthorizationCode(ctx: Context, request: AuthenticateUserRequest) {
	const [authCode] = request.code.split('.');
	const record = await ctx.app.dbClient.authorizations.getById(authCode);

	record.usedAt = (new Date()).toISOString();

	const [userId] = await Promise.all([
		getOrCreateUser(ctx, record.identifierValue),
		ctx.app.dbClient.authorizations.setAsUsed(authCode),
	]);

	const grant: Grant = {
		type: 'authorization_code',
		value: record.id,
	};

	return { userId, grant, rootGrant: grant };
}

function createCodeChallenge(codeVerifier: string) {
	const hash = crypto.createHash('sha256');

	hash.update(codeVerifier, 'ascii');

	const base64 = hash.digest('base64');

	return base64
		.replace(/[+]/g, '-')
		.replace(/[/]/g, '_')
		.replace(/[=]+$/, '');
}
