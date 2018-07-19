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
	constructor(options?: Partial<UbjsonEncoderOptions>);
	encode(value: any): ArrayBuffer;
}

export interface UbjsonDecoder {
	constructor(options?: Partial<UbjsonDecoderOptions>);
	decode(buffer: ArrayBuffer): any;
}

export default interface Ubjson {
	encode(value: any, options?: Partial<UbjsonEncoderOptions>): ArrayBuffer;
	decode(buffer: ArrayBuffer, options?: Partial<UbjsonDecoderOptions>): any;
}
