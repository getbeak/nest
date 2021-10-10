
import getUserImpl from '../../app/get-user';
import { Context, GetUserRequest } from '../../types';
import Squawk from '../../utils/squawk';
import getUserSchema from './get-user.json';

export default async function getUser(ctx: Context, request: GetUserRequest) {
	if (!ctx.auth)
		throw new Squawk('access_denied');

	if (ctx.auth.type !== 'internal' && ctx.auth.userId !== request.userId)
		throw new Squawk('access_denied');

	return await getUserImpl(ctx, request);
}

export { getUserSchema };
