import { SESClient } from '@aws-sdk/client-ses';
import { Stripe } from 'stripe';
import { Logger } from 'tslog';

import DbClient from './db';

export interface Config {
	env: string;
	jwtPublicKey: string;
	jwtPrivateKey: string;
	stpSecretKey: string;
	stpWebhookSecret: string;
	mongoUri: string;
	internalKey: string;
}

export interface App {
	config: Config;

	dbClient: DbClient;
	sesClient: SESClient;
	stripeClient: Stripe;
}

export interface Context {
	app: App;
	auth: null | AuthUser | AuthInternal;
	logger: Logger;
	request: {
		clientIp: string;
		userAgent: string;
		awsRequestId: string;
	};
}

export interface AuthUser {
	type: 'user';
	userId: string;
}

export interface AuthInternal {
	type: 'internal';
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

export interface JWT {
	v: '1';
	jti: string;
	sub: string;
	aud: string;
	iat: number;
	exp: number;
}

export type GrantType = 'authorization_code' | 'refresh_token';

export interface Grant {
	type: GrantType;
	value: string;
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

export interface AuthenticateUserAuthorizationCode {
	clientId: string;
	grantType: 'authorization_code';
	redirectUri: string;
	code: string;
	codeVerifier: string;
}

export interface AuthenticateUserRefreshToken {
	clientId: string;
	grantType: 'refresh_token';
	refreshToken: string;
}

export type AuthenticateUserRequest = AuthenticateUserAuthorizationCode | AuthenticateUserRefreshToken;

export interface AuthenticateUserResponse {
	accessToken: string;
	tokenType: string;
	expiresIn: number;
	expiresAt: string;
	refreshToken: string;
	userId: string;
	clientId: string;
}

export interface GetSubscriptionStatusRequest {
	userId: string;
}

export interface GetSubscriptionStatusResponse {
	subscription: 'beak_alpha';
}

export interface EnrolAlphaUserRequest {
	email: string;
}

export interface ListNewsItemsRequest {
	clientId: string;
}

export interface NewsItem {
	id: string;
	primary: NewsItemGenericBanner;
	fallback: null | NewsItemGenericBanner;
}

export interface NewsItemGenericBanner {
	code: 'generic_banner';
	dismissible: boolean;
	payload: {
		emoji: string;
		title: string;
		body: string;
		action: {
			url: string;
			cta: string;
		} | null;
	};
}
