import Squawk from '../utils/squawk';
import enrolAlphaUserImpl from '../app/enrol-alpha-user';
import { Context, EnrolAlphaUserRequest } from '../types';
import enrolAlphaUserSchema from './enrol-alpha-user.json';

export default async function enrolAlphaUser(ctx: Context, request: EnrolAlphaUserRequest) {
	if (!ctx.auth || ctx.auth.type !== 'internal')
		throw new Squawk('access_denied');

	return await enrolAlphaUserImpl(ctx, request);
}

export { enrolAlphaUserSchema };
