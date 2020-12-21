import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

import { Grant } from '../types';
import Table from './table';

export interface AccessToken {
	id: string;
	createdAt: string;
	expiresAt: string;
	revokedAt: string | null;
	clientId: string;
	userId: string;
	grant: Grant;
	rootGrant: Grant;
	cidrBlocks: string[];
}

export default class AccessTokens extends Table<AccessToken> {
	constructor(client: DynamoDBClient, env: string) {
		super(client, 'beak-nest-access-tokens', env);
	}
}
