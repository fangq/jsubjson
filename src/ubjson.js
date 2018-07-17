import { UbjsonEncoder } from './ubjson-encoder';
import { UbjsonDecoder } from './ubjson-decoder';

export default class Ubjson {
	static encode(value, options = {}) {
		const encoder = new UbjsonEncoder(options);
		return encoder.encode(value);
	}

	static decode(buffer, options = {}) {
		const decoder = new UbjsonDecoder(options);
		return decoder.decode(buffer);
	}
}
