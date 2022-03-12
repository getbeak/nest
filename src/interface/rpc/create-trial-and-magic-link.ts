import createTrialAndMagicLinkImpl from '../../app/create-trial-and-magic-link';
import { Context, SendMagicLinkRequest } from '../../types';
import createTrialAndMagicLinkSchema from './create-trial-and-magic-link.json';

export default async function createTrialAndMagicLink(ctx: Context, request: SendMagicLinkRequest) {
	return await createTrialAndMagicLinkImpl(ctx, request);
}

export { createTrialAndMagicLinkSchema };
