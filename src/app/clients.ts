import Squawk from '../utils/squawk';

export interface Client {
	id: string;
	name: string;
	enabled: boolean;
	redirectUri: string[];
}

const clients: Client[] = [{
	id: 'client_000000C2kdCzNlbL1BqR5FeMatItU',
	name: 'Beak app (macOS)',
	enabled: true,
	redirectUri: ['https://magic.getbeak.app/'],
}, {
	id: 'client_000000CAixjPMTECPznenOM8rKRxQ',
	name: 'Beak app (linux)',
	enabled: true,
	redirectUri: ['https://magic.getbeak.app/'],
}, {
	id: 'client_000000CAixkP7YVb0cH1zvNfE5mYi',
	name: 'Beak app (windows)',
	enabled: true,
	redirectUri: ['https://magic.getbeak.app/'],
}, {
	id: 'client_000000C7zCx1DUI536pOmMUFPbnPc',
	name: 'Beak web app',
	enabled: false,
	redirectUri: ['https://rio.getbeak.app/'],
}];

export function getClient(clientId: string) {
	const client = clients.find(c => c.id === clientId);

	if (!client)
		throw new Squawk('client_not_found');

	return client;
}

export default clients;
