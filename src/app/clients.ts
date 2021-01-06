import Squawk from '../utils/squawk';

export interface Client {
	id: string;
	name: string;
	enabled: boolean;
	redirectUri: string[];
}

const clients: Client[] = [{
	id: 'client_000000C2kdCzNlbL1BqR5FeMatItU',
	name: 'Beak app',
	enabled: true,
	redirectUri: ['https://magic.getbeak.app/'],
}];

export function getClient(clientId: string) {
	const client = clients.find(c => c.id === clientId);

	if (!client)
		throw new Squawk('client_not_found');

	return client;
}

export default clients;
