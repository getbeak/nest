import ksuid from '@cuvva/ksuid';
import { Db } from 'mongodb';

import Collection, { MongoDocument } from './nest-collection';

export interface Subscription {
	id: string;
	userId: string;
	stpProductId: string;
	stpSubscriptionId: string;
	startsAt: string;
	endsAt: string;
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

	async createSubscription(
		userId: string,
		stpProductId: string,
		stpSubscriptionId: string,
		startsAt: string,
		endsAt: string,
	) {
		const id = ksuid.generate('sub').toString();

		await this.collection.insertOne({
			_id: id,
			userId,
			stpProductId,
			stpSubscriptionId,
			startsAt,
			endsAt,
			createdAt: new Date().toISOString(),
			updatedAt: null,
		});

		return id;
	}

	async findActiveSubscription(userId: string) {
		const now = new Date().toISOString();

		const subscription = await this.collection.findOne({
			userId,
			// @ts-expect-error
			endsAt: { $ne: null, $gt: now },
		}) as unknown as MongoDocument<Subscription>;

		return this.convertFromMongoDocument(subscription);
	}
}
