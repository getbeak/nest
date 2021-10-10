import { Context, ListNewsItemsRequest, NewsItem } from '../types';

const newsItems: NewsItem[] = [{
	id: 'newsitem_000000CAr4t7Pfltpymg6DWr75IdU',
	primary: {
		code: 'generic_banner',
		dismissible: false,
		payload: {
			emoji: '🐦',
			title: 'We\'re almost there',
			body: 'We\'re almost ready to go! If you have any feedback please either use the form below or email info@getbeak.app 🚀',
			action: {
				cta: 'View feedback form',
				url: 'https://www.notion.so/beakapp/8e3f72a1103548c7a149de1485effda9?v=33ae478ec0524a57bc2a9ae0421ed63a',
			},
		},
	},
	fallback: null,
}];

export default async function listNewsItems(_ctx: Context, _request: ListNewsItemsRequest) {
	return newsItems;
}
