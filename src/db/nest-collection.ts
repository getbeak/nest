import { Collection, Db, FilterQuery, OptionalId } from 'mongodb';

import Squawk from '../utils/squawk';

// eslint-disable-next-line @typescript-eslint/naming-convention
export type MongoDocument<T> = Omit<T, 'id'> & { _id: string };

export default abstract class NestCollection<T extends Record<string, any>> {
	protected collection: Collection<MongoDocument<T>>;
	collectionName: string;

	constructor(db: Db, collectionName: string) {
		this.collectionName = collectionName;
		this.collection = db.collection(collectionName);
	}

	protected setupIndexes() { /* */ }

	async createOne(item: T) {
		const mongoItem = this.convertToMongoDocument(item);
		const insert = await this.collection.insertOne(mongoItem as OptionalId<MongoDocument<T>>);

		return this.convertFromMongoDocument(insert.ops[0] as MongoDocument<T>);
	}

	async findById(id: string) {
		const object = await this.collection
			.find({ _id: id } as FilterQuery<MongoDocument<T>>)
			.limit(1)
			.next();

		if (!object)
			throw new Squawk('not_found');

		return this.convertFromMongoDocument(object);
	}

	convertFromMongoDocument(document: MongoDocument<T>) {
		// eslint-disable-next-line @typescript-eslint/naming-convention
		const { _id, ...rest } = document;

		return {
			id: _id,
			...rest,
		} as unknown as T;
	}

	convertToMongoDocument(document: T): MongoDocument<T> {
		const { id, ...rest } = document;

		return {
			_id: id,
			...rest,
		};
	}
}
