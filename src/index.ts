import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export const handle = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
	const url = event.requestContext.path;
	const urlSafe = url.toLowerCase();

	switch (true) {
		case urlSafe.startsWith('/download/'): // /download/:platform/:file
			return { statusCode: 200, body: 'download!' };

		case urlSafe.startsWith('/latest/'): // /latest/:platform/:extension
			return { statusCode: 200, body: 'latest!' };

		case urlSafe.startsWith('/update/'): // /update/:platform/:extension/:version
			return { statusCode: 200, body: 'update!' };

		case urlSafe.startsWith('/releases/'): // /releases/:platform/:extension/:version
			return { statusCode: 200, body: 'releases!' };

		default:
			return {
				statusCode: 404,
				body: 'This is not the request you are looking for. Visit https://getbeak.app! 🐦',
			};
	}
};
