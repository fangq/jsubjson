import { UbjsonEncoder } from './ubjson-encoder';
import { UbjsonDecoder } from './ubjson-decoder';
export { UbjsonEncoder };
export { UbjsonDecoder };

export function encode(value, options) {
	const encoder = new UbjsonEncoder(options);
	return encoder.encode(value);
}

export function decode(buffer, options) {
	const decoder = new UbjsonDecoder(options);
	return decoder.decode(buffer);
}

export class Ubjson {
	static encode(value, options) {
		return encode(value, options);
	}

	static decode(buffer, options) {
		return decode(buffer, options);
	}
}
