import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { validate } from 'jsonschema';
import { Logger } from 'tslog';
import { Context, VersionSet, VersionSets } from 'types';
import Squawk from 'util/squawk';

import sendMagicLink from './send-magic-link';

const urlRegex = /^\/(\d)\/([\d-]+)\/(.+)$/gm;

const v20201214: VersionSet = {
	send_magic_link: {
		impl: sendMagicLink,
		schema: null,
	},
};

const versionSets: VersionSets = {
	'2020-12-14': v20201214,
};

const router = async (logger: Logger, event: APIGatewayProxyEventV2): Promise<Record<string, any>> => {
	const method = event.requestContext.http.method.toUpperCase();

	if (!method)
		throw new Squawk('method_not_supported');

	const { version, endpoint } = parsePath(event.rawPath);
	const versionSet = versionSets[version];

	if (!versionSet)
		throw new Squawk('version_not_supported');

	const runtime = versionSet[endpoint];

	if (!runtime)
		throw new Squawk('not_found');

	const { impl, schema } = runtime;

	// TODO(afr): Populate context
	const ctx: Context = {};
	let request: any = null;

	if (event.body !== void 0) {
		request = JSON.parse(event.body);

		validate(request, schema, { throwError: true });
	}

	return await impl(ctx, request);
};

function parsePath(path: string) {
	const matches = urlRegex.exec(path);

	if (!matches)
		throw new Squawk('malformed_url');

	const [baseVersion, dateVersion, endpoint] = matches;

	if (baseVersion !== '1')
		throw new Squawk('unknown_version', { supportedVersion: '1' });

	return { version: dateVersion, endpoint };
}

export default router;
