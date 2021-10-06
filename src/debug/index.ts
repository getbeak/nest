import type {
	APIGatewayProxyEventHeaders,
	APIGatewayProxyEventV2,
	APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';
import express, { Request, Response } from 'express';

import { handler } from '../';

const port = 3001;
const server = express();

server.post('/1/webhook/*', express.raw({ type: 'application/json' }), async (req, res) => {
	const event = createGatewayRequestEvent(req, true);
	const responseEvent = await handler(event);

	mapResponseEventToResponse(responseEvent, res);
});

server.post('*', express.json(), async (req, res) => {
	const event = createGatewayRequestEvent(req, false);
	const responseEvent = await handler(event);

	mapResponseEventToResponse(responseEvent, res);
});

// eslint-disable-next-line no-console
server.listen(port, () => console.log(`App listening on port ${port}`));

function createGatewayRequestEvent(req: Request, rawBody: boolean): APIGatewayProxyEventV2 {
	return {
		headers: req.headers as APIGatewayProxyEventHeaders,
		isBase64Encoded: true,
		version: '2.0',
		cookies: [],
		body: rawBody ? req.body : JSON.stringify(req.body),
		routeKey: `ANY ${req.path}`,
		rawPath: req.path,
		rawQueryString: '',
		requestContext: {
			accountId: '1234567890',
			apiId: 'supersecret',
			domainName: 'supersecret.execute-api.eu-west-2.amazonaws.com',
			domainPrefix: 'supersecret',
			http: {
				method: req.method.toLocaleUpperCase(),
				path: req.path,
				protocol: 'HTTP/1.2',
				sourceIp: '172.168.1.69',
				userAgent: 'Beak Debug Server',
			},
			requestId: 'test-id',
			routeKey: `ANY ${req.path}`,
			stage: 'test',
			// NOTE(afr): Pointless data
			time: '14/Dec/2020:11:00:00 +0000',
			timeEpoch: 1583817383220,
		},
	};
}

function mapResponseEventToResponse(event: APIGatewayProxyStructuredResultV2, res: Response) {
	res.statusCode = event.statusCode!;
	
	Object.keys(event.headers!).map(k => {
		res.setHeader(k, event.headers![k] as string);
	});

	res.send(event.body);
	res.end();
}
