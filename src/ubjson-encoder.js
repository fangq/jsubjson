const textEncoderFactory = typeof TextEncoder !== 'undefined'
	? () => new TextEncoder()
	: () => {
		// eslint-disable-next-line global-require
		const util = require('util');
		return new util.TextEncoder();
	};

export class UbjsonEncoder {
	constructor(options = {}) {
		this._options = options;
		this._textEncoder = textEncoderFactory();
	}

	encode(value) {
		const packers = this._encode(value);
		const size = packers.reduce((acc, x) => acc + x.byteLength, 0);
		const array = new Uint8Array(size);
		const view = new DataView(array.buffer);
		const storage = { array, view };
		let offset = 0;
		for (const packer of packers) {
			packer.storer(storage, offset);
			offset += packer.byteLength;
		}
		return array.buffer;
	}

	_encode(value) {
		const type = this._getType(value);
		return [
			this._packType(type),
			...this._encodeValue(value, type)
		];
	}

	_encodeValue(value, type) {
		let char;
		let bytes;
		switch (type) {
			case 'C':
				char = value.charCodeAt();
				return [this._pack(({ view }, offset) => view.setInt8(offset, char), 1)];
			case 'S':
				bytes = this._textEncoder.encode(value);
				return [
					...this._encode(bytes.byteLength),
					this._packTypedArray(bytes)
				];
			case 'i':
				return [this._pack(({ view }, offset) => view.setInt8(offset, value), 1)];
			case 'U':
				return [this._pack(({ view }, offset) => view.setUint8(offset, value), 1)];
			case 'I':
				return [this._pack(({ view }, offset) => view.setInt16(offset, value), 2)];
			case 'l':
				return [this._pack(({ view }, offset) => view.setInt32(offset, value), 4)];
			case 'd':
				return [this._pack(({ view }, offset) => view.setFloat32(offset, value), 4)];
			case 'D':
				return [this._pack(({ view }, offset) => view.setFloat64(offset, value), 8)];
			case '[':
				return this._encodeArray(value);
			case '{':
				return this._encodeObject(value);
		}
		return [];
	}

	_getType(value) {
		if (value === null) {
			return 'Z';
		}
		switch (typeof value) {
			case 'undefined':
				return 'N';
			case 'boolean':
				return value ? 'T' : 'F';
			case 'string':
				return (value.length === 1 && value.charCodeAt() <= 127) ? 'C' : 'S';
			case 'number':
				if (Number.isInteger(value)) {
					if (-128 <= value && value <= 127) {
						return 'i';
					}
					if (0 <= value && value <= 255) {
						return 'U';
					}
					if (-32768 <= value && value <= 32767) {
						return 'I';
					}
					if (-2147483648 <= value && value <= 2147483647) {
						return 'l';
					}
				}
				return (Number.isNaN(value) || Math.fround(value) === value) ? 'd' : 'D';
			case 'object':
				return Array.isArray(value) || ArrayBuffer.isView(value) ? '[' : '{';
		}
		throw new Error('Value cannot be serialized');
	}

	_encodeArray(value) {
		let type;
		if ((this._options.optimizeArrays === true
				|| this._options.optimizeArrays === 'onlyTypedArrays')
				&& ArrayBuffer.isView(value)) {
			switch (value.constructor.name) {
				case 'Int8Array':
					return [].concat(
						this._packContainerMarkers('i', value.length),
						this._packTypedArray(value)
					);
				case 'Uint8Array':
					return [].concat(
						this._packContainerMarkers('U', value.length),
						this._packTypedArray(value)
					);
				case 'Int16Array':
					type = 'I';
					break;
				case 'Int32Array':
					type = 'l';
					break;
				case 'Float32Array':
					type = 'd';
					break;
				case 'Float64Array':
					type = 'D';
					break;
			}
		}
		const items = (Array.isArray(value) ? value : Array.from(value)).map(x => ({
			type: type || this._getType(x),
			value: x
		}));
		return this._packContainerItems(items, ']', type || this._options.optimizeArrays === true);
	}

	_encodeObject(value) {
		const items = Object.entries(value).map(x => ({
			key: x[0],
			type: this._getType(x[1]),
			value: x[1]
		}));
		return this._packContainerItems(items, '}', this._options.optimizeObjects === true);
	}

	_packContainerMarkers(type, count) {
		const packers = [];
		if (count != null) {
			if (type != null) {
				packers.push(this._packType('$'), this._packType(type));
			}
			packers.push(this._packType('#'), ...this._encode(count));
		}
		return packers;
	}

	_packContainerItems(items, terminator, optimize) {
		let type;
		let count;
		if (optimize) {
			type = this._obtainCommonType(items);
			count = items.length;
		}
		const packers = this._packContainerMarkers(type, count);
		for (const item of items) {
			item.key && packers.push(...this._encodeValue(item.key, 'S'));
			type == null && packers.push(this._packType(item.type));
			packers.push(...this._encodeValue(item.value, type || item.type));
		}
		if (count == null) {
			packers.push(this._packType(terminator));
		}
		return packers;
	}

	_obtainCommonType(items) {
		const type = items.map(x => x.type).reduce(this._typeReducer);
		return (type === 'U' && items.some(x => x.value < 0)) ? 'I' : type;
	}

	_typeReducer(a, b) {
		if (a === b) {
			return a;
		}
		if (a == null || b == null) {
			return null;
		}
		const reduceTo = seq => seq[Math.min(seq.indexOf(a), seq.indexOf(b))];
		return reduceTo('Dd') || reduceTo('SC') || reduceTo('lIUi');
	}

	_packType(value) {
		return this._pack(({ view }, offset) => view.setInt8(offset, value.charCodeAt()), 1);
	}

	_packTypedArray(value) {
		return this._pack(({ array }, offset) => array.set(value, offset), value.byteLength);
	}

	_pack(storer, byteLength) {
		return { storer, byteLength };
	}
}
