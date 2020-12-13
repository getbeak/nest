import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';

// Example event https://docs.aws.amazon.com/lambda/latest/dg/services-apigateway.html

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
	const url = event.rawPath;
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
