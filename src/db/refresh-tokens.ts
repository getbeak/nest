import { Db, FilterQuery } from 'mongodb';

import { AccessToken } from './access-tokens';
import Collection from './nest-collection';

export interface RefreshToken extends AccessToken {
	usedAt: string | null;
	key: string;
}

export default class RefreshTokens extends Collection<RefreshToken> {
	constructor(db: Db) {
		super(db, 'refresh-tokens');
	}

	async setupIndexes() {
		
	}

	async setAsUsed(id: string) {
		await this.collection.updateOne({ _id: id } as FilterQuery<RefreshToken>, {
			usedAt: new Date().toISOString(),
		});
	}

	async setManyAsRevoked(userId: string, clientId: string) {
		await this.collection.updateMany({
			userId,
			clientId,
			usedAt: null,
			revokedAt: null,
		} as FilterQuery<RefreshToken>, {
			revokedAt: new Date().toISOString(),
		});
	}
}
