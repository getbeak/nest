import { Context, ListNewsItemsRequest, NewsItem } from '../types';

const newsItems: NewsItem[] = [{
	id: 'newsitem_000000CAr4t7Pfltpymg6DWr75IdU',
	primary: {
		code: 'generic_banner',
		payload: {
			emoji: '🐦',
			title: 'Welcome to the Beak Beta',
			body: 'blah blah',
			action: {
				cta: 'Feedback',
				url: 'https://www.notion.so/beakapp/8e3f72a1103548c7a149de1485effda9?v=33ae478ec0524a57bc2a9ae0421ed63a',
			},
		},
	},
	fallback: null,
}];

export default async function listNewsItems(_ctx: Context, _request: ListNewsItemsRequest) {
	return newsItems;
}
