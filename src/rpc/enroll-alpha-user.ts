import Squawk from '../utils/squawk';
import enrollAlphaUserImpl from '../app/enroll-alpha-user';
import { Context, EnrollAlphaUserRequest } from '../types';
import enrollAlphaUserSchema from './enroll-alpha-user.json';

export default async function enrollAlphaUser(ctx: Context, request: EnrollAlphaUserRequest) {
	if (!ctx.auth || ctx.auth.type !== 'internal')
		throw new Squawk('access_denied');

	return await enrollAlphaUserImpl(ctx, request);
}

export { enrollAlphaUserSchema };
