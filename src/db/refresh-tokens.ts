import { Db, FilterQuery } from 'mongodb';

import { AccessToken } from './access-tokens';
import Collection from './nest-collection';

export interface RefreshToken extends AccessToken {
	usedAt: string | null;
	key: string;
}

const ttl = 2678400; // 1 month

export default class RefreshTokens extends Collection<RefreshToken> {
	constructor(db: Db) {
		super(db, 'refresh-tokens');
	}

	async setupIndexes() {
		await Promise.all([
			this.collection.createIndex({ clientId: 1, userId: 1 }),
			this.collection.createIndex({ expiresAt: 1 }, { sparse: true, expireAfterSeconds: ttl }),
		]);
	}

	async setAsUsed(id: string) {
		await this.collection.updateOne({ _id: id } as FilterQuery<RefreshToken>, {
			$set: { usedAt: new Date().toISOString() },
		});
	}

	async setManyAsRevoked(userId: string, clientId: string) {
		await this.collection.updateMany({
			userId,
			clientId,
			usedAt: null,
			revokedAt: null,
		} as FilterQuery<RefreshToken>, {
			$set: { revokedAt: new Date().toISOString() },
		});
	}
}
