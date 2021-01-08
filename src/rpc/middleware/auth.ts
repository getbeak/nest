import { APIGatewayProxyEventV2 } from 'aws-lambda';
import jwt from 'jsonwebtoken';

import { App, JWT } from '../../types';
import Squawk from '../../utils/squawk';

export default async function handleAuth(app: App, event: APIGatewayProxyEventV2) {
	// ofc it's fucking case sensitive
	const headerIndex = Object.keys(event.headers)
		.map(k => k.toLowerCase())
		.findIndex(k => k === 'authorization');

	if (headerIndex < 0)
		return null;

	const header = Object.values(event.headers)[headerIndex];
	const [type, token, ...spare] = header.split(' ');

	if (type !== 'bearer')
		throw new Squawk('invalid_token');

	if (!type || !token || spare.length > 0)
		throw new Squawk('malformed_token');

	let decoded: JWT;
	
	try {
		decoded = jwt.verify(token, app.config.jwtPublicKey, { algorithms: ['ES512'] }) as JWT;
	} catch (error) {
		if (error.message === 'jwt expired')
			throw new Squawk('unauthorized', null, [new Squawk('token_expired')]);
		
		throw error;
	}

	if (decoded.v !== '1')
		throw new Squawk('invalid_token_version');

	const ascTkn = await app.dbClient.accessTokens.getById(decoded.jti);

	if (ascTkn.revokedAt)
		throw new Squawk('token_revoked');

	if (ascTkn.expiresAt < (new Date()).toISOString())
		throw new Squawk('unauthorized', null, [new Squawk('token_expired')]);

	return decoded.sub;
}
