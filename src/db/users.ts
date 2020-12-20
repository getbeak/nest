import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

import Table from './table';

export interface User {
	id: string;
	stpUserId: string;
}

export default class Users extends Table<User> {
	constructor(client: DynamoDBClient) {
		super(client, 'beak-nest-users');
	}
}
