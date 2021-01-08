import { Db, FilterQuery } from 'mongodb';

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

export default class AccessTokens extends Collection<AccessToken> {
	constructor(db: Db) {
		super(db, 'access-tokens');
	}

	async setupIndexes() {
		
	}

	async findAllActive(userId: string, clientId: string) {
		const filter: FilterQuery<AccessToken> = {
			revokedAt: null,
			expiresAt: { $gt: new Date().toISOString() },
			userId,
			clientId,
		};

		const items = await this.collection.find(filter).toArray();

		return items.map(this.convertFromMongoDocument);
	}

	async setManyAsRevoked(ids: string[]) {
		await this.collection.updateMany({
			_id: { $in: ids },
			revokedAt: null,
		} as FilterQuery<AccessToken>, {
			revokedAt: new Date().toISOString(),
		});
	}
}
