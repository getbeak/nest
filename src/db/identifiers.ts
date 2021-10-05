import { Db, FilterQuery } from 'mongodb';

import Collection from './nest-collection';

export interface Identifier {
	id: string;
	identifierType: 'email';
	identifierValue: string;
	createdAt: string;
	updatedAt: string | null;
	verifiedAt: string | null;
}

export default class Identifiers extends Collection<Identifier> {
	constructor(db: Db) {
		super(db, 'identifiers');
	}

	async setupIndexes() {
		await Promise.all([
			this.collection.createIndex({ identifierType: 1, identifierValue: 1 }),
		]);
	}
}
