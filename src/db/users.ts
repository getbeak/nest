import { Db } from 'mongodb';

import Collection from './nest-collection';

export interface User {
	id: string;
	stpUserId: string;
	createdAt: string;
	updatedAt: string | null;
}

export default class Users extends Collection<User> {
	constructor(db: Db) {
		super(db, 'users');
	}

	async setupIndexes() {
		await this.collection.createIndex({ stpUserId: 1 });
	}
}
