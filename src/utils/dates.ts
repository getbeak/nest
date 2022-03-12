export function unixToIso(unix: number) {
	return new Date(unix * 1000).toISOString();
}
