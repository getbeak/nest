import { SESClient } from '@aws-sdk/client-ses';
import Stripe from 'stripe';

import DbClient from '../db';
import { App, Config } from '../types';

export default function createApp(config: Config): App {
	return {
		config,

		dbClient: new DbClient(config.env),
		sesClient: new SESClient('eu-west-2'),
		stripeClient: new Stripe(config.stpSecretKey, {
			typescript: true,
			apiVersion: '2020-08-27',
		}),
	};
}
