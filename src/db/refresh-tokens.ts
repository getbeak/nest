import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

import Table from './table';
import { AccessToken } from './access-tokens';

export interface RefreshToken extends AccessToken {
	usedAt: string | null;
	key: string;
}

export default class RefreshTokens extends Table<RefreshToken> {
	constructor(client: DynamoDBClient) {
		super(client, 'beak-nest-refresh-tokens');
	}
}
