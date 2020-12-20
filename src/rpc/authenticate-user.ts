
import authenticateUserImpl from '../app/authenticate-user';
import { AuthenticateUserRequest, Context } from '../types';
import authenticateUserSchema from './authenticate-user.json';

export default async function authenticateUser(ctx: Context, request: AuthenticateUserRequest) {
	return await authenticateUserImpl(ctx, request);
}

export { authenticateUserSchema };
