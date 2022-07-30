import ksuid from '@cuvva/ksuid';
import { Db } from 'mongodb';

import Squawk from '../utils/squawk';
import Collection from './nest-collection';

export type ConsentLevel = 'none' | 'general';

export interface MarketingConsent {
	id: string;
	userId: string;
	level: ConsentLevel;
	createdAt: string;
	updatedAt: string | null;
}

export default class MarketingConsents extends Collection<MarketingConsent> {
	constructor(db: Db) {
		super(db, 'marketing-consents');
	}

	async setupIndexes() {
		await this.collection.createIndex({ userId: 1 }, { unique: true });
	}

	async upsertMarketingConsent(userId: string, level: ConsentLevel) {
		const id = ksuid.generate('mktngconsent').toString();
		const now = new Date().toISOString();

		await this.collection.updateOne({ userId }, {
			$set: {
				level,
				updatedAt: now,
			},
			$setOnInsert: {
				_id: id,
				userId,
				createdAt: now,
				removedAt: null,
			},
		}, { upsert: true });
	}

	async findUserMarketingConsent(userId: string) {
		const identifier = await this.collection.findOne({ userId });

		if (!identifier)
			throw new Squawk('not_found');

		return this.convertFromMongoDocument(identifier);
	}
}
