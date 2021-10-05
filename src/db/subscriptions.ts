import { Db } from 'mongodb';

import Collection from './nest-collection';

export interface Subscription {
	id: string;
	stpSubscriptionId: string;
	stpProductId: string;
	startsAt: string;
	endsAt: string | null;
	createdAt: string;
	updatedAt: string | null;
}

export default class Subscriptions extends Collection<Subscription> {
	constructor(db: Db) {
		super(db, 'subscriptions');
	}

	async setupIndexes() {
		await this.collection.createIndex({ stpUserId: 1 });
	}
}
