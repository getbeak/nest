import { Db } from 'mongodb';

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
}
