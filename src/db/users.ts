import { Db } from 'mongodb';

import Collection from './nest-collection';

export interface User {
	id: string;
	stpUserId: string;
}

export default class Users extends Collection<User> {
	constructor(db: Db) {
		super(db, 'users');
	}

	async setupIndexes() {
		
	}
}
