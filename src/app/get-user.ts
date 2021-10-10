import { Context, GetUserRequest, GetUserResponse } from '../types';

export default async function getUser(ctx: Context, request: GetUserRequest): Promise<GetUserResponse> {
	const user = await ctx.app.dbClient.users.findUser(request.userId);
	const identifiers = await ctx.app.dbClient.identifiers.listUserIdentifiers(request.userId);

	return {
		id: user.id,
		createdAt: user.createdAt,
		identifiers: identifiers.map(i => ({
			id: i.id,
			identifierType: i.identifierType,
			identifierValue: i.identifierValue,
			createdAt: i.createdAt,
			updatedAt: i.updatedAt,
			verifiedAt: i.verifiedAt,
			removedAt: i.removedAt,
		})),
	};
}
