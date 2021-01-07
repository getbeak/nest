import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb';

import { AccessToken } from './access-tokens';
import Table from './table';

export interface RefreshToken extends AccessToken {
	usedAt: string | null;
	key: string;
}

export default class RefreshTokens extends Table<RefreshToken> {
	constructor(client: DynamoDBClient, env: string) {
		super(client, 'beak-nest-refresh-tokens', env);
	}

	async setAsUsed(id: string) {
		this.client.send(new UpdateItemCommand({
			TableName: this.tableName,
			Key: { id: { S: id } },
			UpdateExpression: 'set #newUsedAt = :x',
			ExpressionAttributeNames: {
				'#newUsedAt': 'usedAt',
			},
			ExpressionAttributeValues: {
				':x': { S: (new Date()).toISOString() },
			},
		}));
	}
}
