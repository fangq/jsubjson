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

export const Ubjson = { encode, decode };
