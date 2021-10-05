import { Db } from 'mongodb';
import ksuid from '@cuvva/ksuid';

import Collection from './nest-collection';

export interface ProviderMapping {
	id: string;
	userId: string;
	providerType: 'stripe';
	providerValue: string;
	createdAt: string;
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
	}

	async createMapping(userId: string, providerType: 'stripe', providerValue: string) {
		const id = ksuid.generate('provmap').toString();

		await this.collection.insertOne({
			_id: id,
			userId,
			providerType,
			providerValue,
			createdAt: new Date().toISOString(),
			removedAt: null,
		});

		return id;
	}
}
