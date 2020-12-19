import { SESClient } from '@aws-sdk/client-ses';
import RedisClient from 'ioredis';

import { App, Config } from '../types';

export default function createApp(config: Config): App {
	return {
		redisClient: new RedisClient(config.redisUri),
		sesClient: new SESClient('eu-west-2'),
	};
}
