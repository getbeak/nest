import ksuid from '@cuvva/ksuid';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

import { AuthenticateUserRequest, AuthenticateUserResponse, Context, Grant } from '../types';
import Squawk from '../utils/squawk';
import { handleAuthorizationCode, validateAuthorizationCode } from './auth-authorization-code';
import { handleRefreshToken, validateRefreshToken } from './auth-refresh-token';
import { getClient } from './clients';

const accessTokenExpiry = 864000; // 24 hours
const refreshTokenExpiry = 31536000; // 365 days

export default async function authenticateUser(
	ctx: Context,
	request: AuthenticateUserRequest,
): Promise<AuthenticateUserResponse> {
	await validateGrant(ctx, request);

	const client = getClient(request.clientId);

	const { grant, rootGrant, userId } = await handleGrant(ctx, request);
	const authentication = await createAuthentication(ctx, client.id, userId, grant, rootGrant, [ctx.request.clientIp]);

	const { accessToken, expiresAt, expiresIn, refreshToken } = authentication;

	return {
		accessToken,
		tokenType: 'bearer',
		expiresIn,
		expiresAt,
		refreshToken,
		userId,
		clientId: client.id,
	};
}

async function validateGrant(ctx: Context, request: AuthenticateUserRequest) {
	const grantType = request.grantType;

	switch (request.grantType) {
		case 'authorization_code': return await validateAuthorizationCode(ctx, request);
		case 'refresh_token': return await validateRefreshToken(ctx, request);

		default: throw new Squawk('unsupported_grant_type', { grantType });
	}
}

async function handleGrant(ctx: Context, request: AuthenticateUserRequest) {
	const grantType = request.grantType;

	switch (request.grantType) {
		case 'authorization_code': return await handleAuthorizationCode(ctx, request);
		case 'refresh_token': return await handleRefreshToken(ctx, request);

		default: throw new Squawk('unsupported_grant_type', { grantType });
	}
}

async function createAuthentication(
	ctx: Context,
	clientId: string,
	userId: string,
	grant: Grant,
	rootGrant: Grant,
	cidrBlocks: string[],
) {
	const [accessTok, refreshTok] = await Promise.all([
		ctx.app.dbClient.accessTokens.createOne({
			id: ksuid.generate('acstok').toString(),
			createdAt: (new Date()).toISOString(),
			expiresAt: (new Date(Date.now() + (accessTokenExpiry * 1000))).toISOString(),
			revokedAt: null,
			clientId,
			userId,
			rootGrant,
			grant,
			cidrBlocks,
		}),
		ctx.app.dbClient.refreshTokens.createOne({
			id: ksuid.generate('reftok').toString(),
			createdAt: (new Date()).toISOString(),
			expiresAt: (new Date(Date.now() + (refreshTokenExpiry * 1000))).toISOString(),
			revokedAt: null,
			usedAt: null,
			clientId,
			userId,
			key: crypto.randomBytes(32).toString('hex'),
			rootGrant,
			grant,
			cidrBlocks,
		}),
	]);

	const accessToken = jwt.sign({
		v: '1',
		jti: accessTok.id,
		sub: userId,
		aud: clientId,
		iat: Math.floor(new Date(accessTok.createdAt).getTime() / 1000),
		exp: Math.floor(new Date(accessTok.expiresAt).getTime() / 1000),
	}, ctx.app.config.jwtPrivateKey, { algorithm: 'ES512' });

	return {
		expiresIn: accessTokenExpiry,
		expiresAt: accessTok.expiresAt,
		accessToken,
		refreshToken: `01.${refreshTok.id}.${refreshTok.key}`,
	};
}
