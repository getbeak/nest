import { Context, ListNewsItemsRequest, NewsItem } from '../types';

const newsItems: NewsItem[] = [];

export default async function listNewsItems(_ctx: Context, _request: ListNewsItemsRequest) {
	return newsItems;
}
