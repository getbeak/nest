import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb';

import Table from './table';

export interface AuthorizationCode {
	id: string;
	key: string;
	createdAt: string;
	expiresAt: string;
	usedAt: string | null;
	revokedAt: string | null;
	clientId: string;
	state: string;
	codeChallengeMethod: 'S256';
	codeChallenge: string;
	redirectUri: string;
	identifierType: 'email';
	identifierValue: string;
}

export default class Authorizations extends Table<AuthorizationCode> {
	constructor(client: DynamoDBClient) {
		super(client, 'beak-nest-authorizations');
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
