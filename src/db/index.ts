import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

import AccessTokens from './access-tokens';
import Authorizations from './authorizations';
import RefreshTokens from './refresh-tokens';
import Users from './users';

export default class DbClient {
	private client: DynamoDBClient;

	authorizations: Authorizations;
	accessTokens: AccessTokens;
	refreshTokens: RefreshTokens;
	users: Users;

	constructor(env: string) {
		this.client = new DynamoDBClient({ region: 'eu-west-2' });

		this.authorizations = new Authorizations(this.client, env);
		this.accessTokens = new AccessTokens(this.client, env);
		this.refreshTokens = new RefreshTokens(this.client, env);
		this.users = new Users(this.client, env);
	}
}
