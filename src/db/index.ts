import { Db, MongoClient } from 'mongodb';

import AccessTokens from './access-tokens';
import Authorizations from './authorizations';
import Identifiers from './identifiers';
import ProviderMappings from './provider-mappings';
import RefreshTokens from './refresh-tokens';
import Subscriptions from './subscriptions';
import Users from './users';

export default class DbClient {
	private client: MongoClient;
	private db!: Db;

	accessTokens!: AccessTokens;
	authorizations!: Authorizations;
	identifiers!: Identifiers;
	providerMappings!: ProviderMappings;
	refreshTokens!: RefreshTokens;
	subscriptions!: Subscriptions;
	users!: Users;

	constructor(mongoUri: string) {
		this.client = new MongoClient(mongoUri);
	}

	async connect() {
		await this.client.connect();

		this.db = this.client.db('nest');

		this.authorizations = new Authorizations(this.db);
		this.accessTokens = new AccessTokens(this.db);
		this.identifiers = new Identifiers(this.db);
		this.providerMappings = new ProviderMappings(this.db);
		this.refreshTokens = new RefreshTokens(this.db);
		this.subscriptions = new Subscriptions(this.db);
		this.users = new Users(this.db);

		await this.setupIndexes();
	}

	async setupIndexes() {
		await this.authorizations.setupIndexes();
		await this.accessTokens.setupIndexes();
		await this.identifiers.setupIndexes();
		await this.providerMappings.setupIndexes();
		await this.refreshTokens.setupIndexes();
		await this.subscriptions.setupIndexes();
		await this.users.setupIndexes();
	}
}
