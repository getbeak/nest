import ksuid from '@cuvva/ksuid';
import { Db, Filter } from 'mongodb';

import { Device } from '../types';
import Squawk from '../utils/squawk';
import Collection from './nest-collection';

export interface Trial {
	id: string;
	userId: string;
	stpProductId: string;
	stpSubscriptionId: string;
	stpCustomerId: string;
	startsAt: string;
	endsAt: string;
	device: {
		beakId: string;
		fingerprint: string;
	};
	createdAt: string;
	updatedAt: string | null;
}

export default class Trials extends Collection<Trial> {
	constructor(db: Db) {
		super(db, 'trials');
	}

	async setupIndexes() {
		await this.collection.createIndex({
			'device.beakId': 1,
			'device.fingerprint': 1,
		});
		await this.collection.createIndex({ userId: 1 });
	}

	async createTrial(
		userId: string,
		stpProductId: string,
		stpSubscriptionId: string,
		stpCustomerId: string,
		startsAt: string,
		endsAt: string,
		fingerprint: string,
		beakId: string,
	) {
		const id = ksuid.generate('trial').toString();
		const now = new Date().toISOString();

		await this.collection.insertOne({
			_id: id,
			userId,
			stpProductId,
			stpSubscriptionId,
			stpCustomerId,
			startsAt,
			endsAt,
			device: {
				beakId,
				fingerprint,
			},
			createdAt: now,
			updatedAt: null,
		});
	}

	async ensureAnonymousFreshTrial(device: Device) {
		const existingTrial = await this.collection.findOne({
			$or: [
				{ 'device.fingerprint': device.fingerprint },
				{ 'device.beakId': device.beakId },
			],
		});

		if (existingTrial)
			throw new Squawk('trial_already_used');
	}

	async ensureUserFreshTrial(device: Device, userId: string) {
		const existingTrial = await this.collection.findOne({
			$or: [
				{ userId },
				{ 'device.fingerprint': device.fingerprint },
				{ 'device.beakId': device.beakId },
			],
		});

		if (existingTrial)
			throw new Squawk('trial_already_used');
	}
}
