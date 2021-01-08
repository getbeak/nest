import { Context } from '../types';
import { getCustomerEmail } from './stripe-users';

interface RevokeOptions {
	accessTokens: boolean;
	refreshTokens: boolean;
	authorizations: boolean;
}

export default async function revokeTokens(
	ctx: Context,
	userId: string,
	clientId: string,
	opts: Partial<RevokeOptions>,
) {
	const options: RevokeOptions = {
		accessTokens: true,
		refreshTokens: true,
		authorizations: true,
		...opts,
	};

	const promises = [];

	if (options.accessTokens)
		promises.push(revokeAccessTokens(ctx, userId, clientId));

	if (options.refreshTokens)
		promises.push(ctx.app.dbClient.refreshTokens.setManyAsRevoked(userId, clientId));

	if (options.authorizations)
		promises.push(revokeAuthorizations(ctx, userId, clientId));

	await Promise.all(promises);
}

async function revokeAccessTokens(ctx: Context, userId: string, clientId: string) {
	const activeAccessTokens = await ctx.app.dbClient.accessTokens.findAllActive(userId, clientId);

	await ctx.app.dbClient.accessTokens.setManyAsRevoked(activeAccessTokens.map(a => a.id));
}

async function revokeAuthorizations(ctx: Context, userId: string, clientId: string) {
	const user = await ctx.app.dbClient.users.findById(userId);
	const email = await getCustomerEmail(ctx, user.stpUserId);

	if (email === null)
		return;

	await ctx.app.dbClient.authorizations.setManyAsRevoked('email', email, clientId);
}
