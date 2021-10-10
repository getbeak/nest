type Meta = Record<string, unknown>;

export default class Squawk extends Error {
	readonly code: string = '';
	readonly meta: Meta | undefined = void 0;
	readonly reasons: Squawk[] | undefined = void 0;

	constructor(code: string, meta?: Meta | null, reasons?: Error[]) {
		super(code);
		// Error.captureStackTrace(this, this.constructor);

		this.code = code;

		if (meta)
			this.meta = meta;

		if (reasons) {
			this.reasons = [];

			for (const i in reasons) {
				if (!Squawk.isSquawk(reasons[i]))
					this.reasons.push(Squawk.coerce(reasons[i]));
			}
		}

		defineNonSerializable(this, 'name', 'Squawk');
		defineNonSerializable(this, 'message', this.code);
	}

	static isSquawk(error: Error | unknown) {
		return (error instanceof Squawk);
	}

	static coerce(error: Error | unknown) {
		if (Squawk.isSquawk(error))
			return error as Squawk;

		const newError = new Squawk('unknown', error ? { error } : void 0);

		if (error instanceof Error)
			defineNonSerializable(newError, 'stack', error.stack);

		return newError;
	}
}

function defineNonSerializable(obj: unknown, property: string, value: unknown) {
	Object.defineProperty(obj, property, {
		value,
		writable: false,
		enumerable: false, // prevents json serialization
		configurable: true, // allows redefinition
	});
}
