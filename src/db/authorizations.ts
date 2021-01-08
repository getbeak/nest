import { Db, FilterQuery } from 'mongodb';

import Collection from './nest-collection';

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

export default class Authorizations extends Collection<AuthorizationCode> {
	constructor(db: Db) {
		super(db, 'authorizations');
	}

	async setupIndexes() {
		await Promise.all([
			this.collection.createIndex({ expiresAt: 1, clientId: 1, identifierValue: 1 }),
			this.collection.createIndex({ revokedAt: 1, usedAt: 1 }),
		]);
	}

	async setAsUsed(id: string) {
		await this.collection.updateOne({ _id: id } as FilterQuery<AuthorizationCode>, {
			$set: { usedAt: new Date().toISOString() },
		});
	}

	async setManyAsRevoked(type: 'email', value: string, clientId: string) {
		await this.collection.updateMany({
			clientId,
			identifierType: type,
			identifierValue: value,
			usedAt: null,
			revokedAt: null,
		} as FilterQuery<AuthorizationCode>, {
			$set: { revokedAt: new Date().toISOString() },
		});
	}
}
