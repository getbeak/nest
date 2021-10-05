import sendMagicLinkImpl from '../../app/send-magic-link';
import { Context, SendMagicLinkRequest } from '../../types';
import sendMagicLinkSchema from './send-magic-link.json';

export default async function sendMagicLink(ctx: Context, request: SendMagicLinkRequest) {
	return await sendMagicLinkImpl(ctx, request);
}

export { sendMagicLinkSchema };
