import listNewsItemsImpl from '../app/list-news-items';
import { Context, ListNewsItemsRequest } from '../types';
import listNewsItemsSchema from './list-news-items.json';

export default async function listNewsItems(ctx: Context, request: ListNewsItemsRequest) {
	return await listNewsItemsImpl(ctx, request);
}

export { listNewsItemsSchema };
