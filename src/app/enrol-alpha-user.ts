import { Context, EnrolAlphaUserRequest } from '../types';
import Squawk from '../utils/squawk';

export default async function enrolAlphaUser(_ctx: Context, _request: EnrolAlphaUserRequest) {
	throw new Squawk('deprecated');
}
