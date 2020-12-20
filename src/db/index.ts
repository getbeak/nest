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

	constructor() {
		this.client = new DynamoDBClient({ region: 'eu-west-2' });

		this.authorizations = new Authorizations(this.client);
		this.accessTokens = new AccessTokens(this.client);
		this.refreshTokens = new RefreshTokens(this.client);
		this.users = new Users(this.client);
	}
}
