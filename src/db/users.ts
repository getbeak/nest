import ksuid from '@cuvva/ksuid';
import { Db } from 'mongodb';

import Squawk from '../utils/squawk';
import Collection from './nest-collection';

export interface User {
	id: string;
	createdAt: string;
}

export default class Users extends Collection<User> {
	constructor(db: Db) {
		super(db, 'users');
	}

	async setupIndexes() { /* No indexes needed */ }

	async createUser() {
		const id = ksuid.generate('user').toString();

		await this.collection.insertOne({
			_id: id,
			createdAt: new Date().toISOString(),
		});

		return id;
	}

	async findUser(id: string) {
		const user = await this.collection.findOne({ _id: id });

		if (user === null)
			throw new Squawk('not_found');

		return this.convertFromMongoDocument(user);
	}
}
