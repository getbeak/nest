import ksuid from '@cuvva/ksuid';
import { Db } from 'mongodb';

import Collection from './nest-collection';

export interface ProviderMapping {
	id: string;
	userId: string;
	providerType: 'stripe';
	providerValue: string;
	createdAt: string;
	updatedAt: string;
	removedAt: string | null;
}

export default class ProviderMappings extends Collection<ProviderMapping> {
	constructor(db: Db) {
		super(db, 'provider_mappings');
	}

	async setupIndexes() {
		await this.collection.createIndex({ userId: 1 });
		await this.collection.createIndex({
			userId: 1,
			providerType: 1,
			providerValue: 1,
			removedAt: 1,
		});
		await this.collection.createIndex({
			providerType: 1,
			providerValue: 1,
			removedAt: { $eq: null },
		}, { unique: true });
	}

	async createOrUpdateMapping(userId: string, providerType: 'stripe', providerValue: string) {
		const id = ksuid.generate('provmap').toString();
		const now = new Date().toISOString();

		await this.collection.updateOne({
			userId,
			providerType,
			providerValue,
		}, {
			$set: {
				updatedAt: now,
			},
			$setOnInsert: {
				_id: id,
				userId,
				providerType,
				providerValue,
				createdAt: now,
				removedAt: null,
			},
		}, { upsert: true });

		return id;
	}
}
