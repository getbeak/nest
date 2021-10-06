import crypto from 'crypto';

import { AuthenticateUserAuthorizationCode, Context, Grant } from '../types';
import Squawk from '../utils/squawk';
import revokeTokens from './revoke-tokens';

export async function validateAuthorizationCode(ctx: Context, request: AuthenticateUserAuthorizationCode) {
	if (!request.code)
		throw new Squawk('code_missing');

	if (!request.codeVerifier)
		throw new Squawk('code_verifier_missing');

	if (!request.redirectUri)
		throw new Squawk('redirect_uri_missing');

	const [authCode, authKey, ...spare] = request.code.split('.');

	if (!authCode || !authKey || spare.length > 0)
		throw new Squawk('malformed_code');

	const record = await ctx.app.dbClient.authorizations.findById(authCode);

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

export async function handleAuthorizationCode(ctx: Context, request: AuthenticateUserAuthorizationCode) {
	const [authCode] = request.code.split('.');
	const record = await ctx.app.dbClient.authorizations.findById(authCode);

	const [userId] = await Promise.all([
		getOrCreateUser(ctx, record.identifierValue),
		ctx.app.dbClient.authorizations.setAsUsed(authCode),
	]);

	await revokeTokens(ctx, userId, request.clientId, { refreshTokens: false, accessTokens: false });

	const grant: Grant = {
		type: 'authorization_code',
		value: record.id,
	};

	return { userId, grant, rootGrant: grant };
}

export async function getOrCreateUser(ctx: Context, identifierValue: string) {
	try {
		const identifier = await ctx.app.dbClient.identifiers.findActiveEmailIdentifier(identifierValue);

		if (identifier.verifiedAt === null)
			await ctx.app.dbClient.identifiers.setIdentifierAsVerified(identifier.id);

		return identifier.userId;
	} catch (error) {
		const squawk = Squawk.coerce(error);

		if (squawk.code !== 'not_found')
			throw error;
	}

	const userId = await ctx.app.dbClient.users.createUser();

	await ctx.app.dbClient.identifiers.createIdentifier(identifierValue, 'email', userId, true);

	return userId;
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
