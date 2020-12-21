import {
	DynamoDBClient,
	GetItemCommand,
	PutItemCommand,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

import Squawk from '../utils/squawk';

export default abstract class Table<T extends Record<string, any>> {
	protected client: DynamoDBClient;
	tableName: string;

	constructor(client: DynamoDBClient, tableName: string, env: string) {
		this.client = client;
		this.tableName = `${tableName}${env === 'prod' ? '' : `-${env}`}`;
	}

	async getById(id: string): Promise<T> {
		const item = await this.client.send(new GetItemCommand({
			TableName: this.tableName,
			Key: {
				id: { S: id },
			},
		}));

		if (item.Item === void 0)
			throw new Squawk('not_found');

		return unmarshall(item.Item) as T;
	}

	async create(payload: T) {
		await this.client.send(new PutItemCommand({
			TableName: this.tableName,
			Item: marshall(payload),
		}));

		return payload;
	}
}
