import { APIGatewayProxyEventV2 } from 'aws-lambda';
import jwt from 'jsonwebtoken';

import { App, AuthInternal, AuthUser, JWT } from '../../../types';
import Squawk from '../../../utils/squawk';

export default async function handleAuth(app: App, event: APIGatewayProxyEventV2) {
	// ofc it's fucking case sensitive
	const headerIndex = Object.keys(event.headers)
		.map(k => k.toLowerCase())
		.findIndex(k => k === 'authorization');

	if (headerIndex < 0)
		return null;

	const header = Object.values(event.headers)[headerIndex];
	const [type, token, ...spare] = header.split(' ');

	if (!token || spare.length > 0)
		throw new Squawk('unauthorized', null, [new Squawk('malformed_token')]);

	switch (type) {
		case 'bearer': {
			try {
				return await handleBearer(app, token);
			} catch (error) {
				throw new Squawk('unauthorized', null, [Squawk.coerce(error)]);
			}
		}
		case 'internal':
			return handleInternal(app, token);

		default:
			throw new Squawk('unauthorized', null, [new Squawk('unknown_token_type')]);
	}
}

async function handleBearer(app: App, token: string): Promise<AuthUser> {
	let decoded: JWT;

	try {
		decoded = jwt.verify(token, app.config.jwtPublicKey, { algorithms: ['ES512'] }) as JWT;
	} catch (error) {
		if (error instanceof Error && error.message === 'jwt expired')
			throw new Squawk('token_expired');

		throw new Squawk('invalid_token', null, [Squawk.coerce(error)]);
	}

	if (decoded.v !== '1')
		throw new Squawk('invalid_token_version');

	const ascTkn = await app.dbClient.accessTokens.findById(decoded.jti);

	if (ascTkn.revokedAt)
		throw new Squawk('token_revoked');

	if (ascTkn.expiresAt < (new Date()).toISOString())
		throw new Squawk('token_expired');

	return {
		type: 'user',
		userId: decoded.sub,
	};
}

function handleInternal(app: App, token: string): AuthInternal {
	if (token !== app.config.internalKey)
		throw new Squawk('access_denied');

	return { type: 'internal' };
}
