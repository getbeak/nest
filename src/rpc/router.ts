import { APIGatewayProxyEventV2 } from 'aws-lambda';
import camelCaseKeys from 'camelcase-keys';
import { validate } from 'jsonschema';
import { Logger } from 'tslog';

import { App, Context, VersionSet, VersionSets } from '../types';
import Squawk from '../utils/squawk';
import authenticateUser, { authenticateUserSchema } from './authenticate-user';
import getSubscriptionStatus, { getSubscriptionStatusSchema } from './get-subscription-status';
import handleAuth from './middleware/auth';
import sendMagicLink, { sendMagicLinkSchema } from './send-magic-link';

const urlRegex = /^\/(\d)\/([\d-]+)\/(.+)$/;
const methods = ['POST', 'OPTIONS'];

const v20201214: VersionSet = {
	send_magic_link: {
		impl: sendMagicLink,
		schema: sendMagicLinkSchema,
	},
	authenticate_user: {
		impl: authenticateUser,
		schema: authenticateUserSchema,
	},
	get_subscription_status: {
		impl: getSubscriptionStatus,
		schema: getSubscriptionStatusSchema,
	},
};

const versionSets: VersionSets = {
	'2020-12-14': v20201214,
};

const router = async (logger: Logger, app: App, event: APIGatewayProxyEventV2): Promise<Record<string, any> | null> => {
	const method = event.requestContext.http.method.toUpperCase();

	if (!method || !methods.includes(method))
		throw new Squawk('method_not_supported');

	if (method === 'OPTIONS')
		return null;

	const { version, endpoint } = parsePath(event.rawPath);
	const versionSet = versionSets[version];

	if (!versionSet)
		throw new Squawk('version_not_supported');

	const runtime = versionSet[endpoint];

	if (!runtime)
		throw new Squawk('not_found');

	const { impl, schema } = runtime;
	const ctx: Context = {
		app,
		auth: await handleAuth(app, event),
		logger,
		request: {
			awsRequestId: event.requestContext.requestId,
			clientIp: event.requestContext.http.sourceIp,
			userAgent: event.requestContext.http.userAgent,
		},
	};

	let request: any = null;

	if (event.body !== void 0) {
		const originalRequest = JSON.parse(event.body);

		validate(originalRequest, schema, { throwError: true });

		request = camelCaseKeys(originalRequest);
	}

	return await impl(ctx, request);
};

function parsePath(path: string) {
	const matches = urlRegex.exec(path);

	if (!matches)
		throw new Squawk('malformed_url', { path });

	const [, baseVersion, dateVersion, endpoint] = matches;

	if (baseVersion !== '1')
		throw new Squawk('unknown_version', { supportedVersion: '1' });

	return { version: dateVersion, endpoint };
}

export default router;
