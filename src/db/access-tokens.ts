import { Db } from 'mongodb';

import { Grant } from '../types';
import Collection from './nest-collection';

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

const ttl = 2678400; // 1 month

export default class AccessTokens extends Collection<AccessToken> {
	constructor(db: Db) {
		super(db, 'access-tokens');
	}

	async setupIndexes() {
		await Promise.all([
			this.collection.createIndex({ clientId: 1, userId: 1 }),
			this.collection.createIndex({ expiresAt: 1 }, { sparse: true, expireAfterSeconds: ttl }),
			this.collection.createIndex({ revokedAt: 1 }, { sparse: true, expireAfterSeconds: ttl }),
		]);
	}

	async findAllActive(userId: string, clientId: string) {
		const items = await this.collection.find({
			revokedAt: null,
			expiresAt: { $gt: new Date().toISOString() },
			userId,
			clientId,
		}).toArray();

		return items.map(this.convertFromMongoDocument);
	}

	async setManyAsRevoked(ids: string[]) {
		await this.collection.updateMany({
			_id: { $in: ids },
			revokedAt: null,
		}, {
			$set: {
				revokedAt: new Date().toISOString(),
			},
		});
	}
}
