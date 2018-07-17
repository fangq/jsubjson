export interface UbjsonEncoderOptions {
	optimizeArrays: boolean | 'onlyTypedArray';
	optimizeObjects: boolean;
}

export interface UbjsonDecoderOptions {
	int64Handling: 'error' | 'skip' | 'raw';
	highPrecisionNumberHandling: 'error' | 'skip' | 'raw';
	useTypedArrays: boolean;
}

export interface UbjsonEncoder {
	constructor(options?: UbjsonEncoderOptions);
	encode(value: any): ArrayBuffer;
}

export interface UbjsonDecoder {
	constructor(options?: UbjsonDecoderOptions);
	decode(buffer: ArrayBuffer): any;
}

export default interface Ubjson {
	encode(value: any, options?: UbjsonEncoderOptions): ArrayBuffer;
	decode(buffer: ArrayBuffer, options?: UbjsonDecoderOptions): any;
}
