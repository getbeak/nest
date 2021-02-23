import { AuthenticateUserRefreshToken, Context, Grant } from '../types';
import Squawk from '../utils/squawk';
import revokeTokens from './revoke-tokens';

export async function validateRefreshToken(ctx: Context, request: AuthenticateUserRefreshToken) {
	if (!request.refreshToken)
		throw new Squawk('refresh_token_missing');

	const [version, refTokId, refTokKey, ...spare] = request.refreshToken.split('.');

	if (!version || !refTokId || !refTokKey || spare.length > 0)
		throw new Squawk('malformed_refresh_token');

	const refTok = await ctx.app.dbClient.refreshTokens.findById(refTokId);

	if (refTok.key !== refTokKey)
		throw new Squawk('token_not_found');

	if (refTok.usedAt)
		throw new Squawk('token_used');

	// NOTE(afr): Don't be too transparent with the client about revocations - dangeroux
	if (refTok.revokedAt)
		throw new Squawk('authorization_not_found');

	if (refTok.expiresAt <= (new Date()).toISOString())
		throw new Squawk('token_expired');

	if (refTok.clientId !== request.clientId)
		throw new Squawk('incorrect_client');
}

export async function handleRefreshToken(ctx: Context, request: AuthenticateUserRefreshToken) {
	const [, refTokId] = request.refreshToken.split('.');
	const refTok = await ctx.app.dbClient.refreshTokens.findById(refTokId);

	await ctx.app.dbClient.refreshTokens.setAsUsed(refTokId);
	await revokeTokens(ctx, refTok.userId, refTok.clientId, { authorizations: false });

	const grant: Grant = {
		type: 'refresh_token',
		value: refTok.id,
	};

	return { userId: refTok.userId, grant, rootGrant: refTok.rootGrant };
}
