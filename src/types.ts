export interface Context {

}

export interface VersionSets {
	[k: string]: VersionSet;
}

export interface VersionSet {
	[k: string]: {
		impl: (ctx: Context, request: any) => void | any;
		schema: null;
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
