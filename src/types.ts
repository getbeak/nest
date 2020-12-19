import { SESClient } from '@aws-sdk/client-ses';
import { Redis } from 'ioredis';
import { Logger } from 'tslog';

export interface Config {
	redisUri: string;
}

export interface App {
	redisClient: Redis;
	sesClient: SESClient;
}

export interface Context {
	app: App;
	auth: null;
	logger: Logger;
	request: {
		clientIp: string;
		userAgent: string;
		awsRequestId: string;
	};
}

export interface VersionSets {
	[k: string]: VersionSet;
}

export interface VersionSet {
	[k: string]: {
		impl: (ctx: Context, request: any) => void | any;
		schema: Record<string, unknown>;
	};
}

export interface SendMagicLinkRequest {
	clientId: string;
	redirectUri: string;
	state: string;
	codeChallengeMethod: string;
	codeChallenge: string;
	identifierType: string;
	identifierValue: string;
}
