import { Db, MongoClient } from 'mongodb';

import AccessTokens from './access-tokens';
import Authorizations from './authorizations';
import RefreshTokens from './refresh-tokens';
import Users from './users';

export default class DbClient {
	private client: MongoClient;
	private db: Db;

	authorizations: Authorizations;
	accessTokens: AccessTokens;
	refreshTokens: RefreshTokens;
	users: Users;

	constructor(mongoUri: string) {
		this.client = new MongoClient(mongoUri);
		this.db = this.client.db('nest');

		this.authorizations = new Authorizations(this.db);
		this.accessTokens = new AccessTokens(this.db);
		this.refreshTokens = new RefreshTokens(this.db);
		this.users = new Users(this.db);
	}

	async setupIndexes() {
		await this.authorizations.setupIndexes();
		await this.accessTokens.setupIndexes();
		await this.refreshTokens.setupIndexes();
		await this.users.setupIndexes();
	}
}
