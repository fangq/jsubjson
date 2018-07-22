const test = require('tape');
const ubjson = require('../dist/ubjson');

function toArray(...args) {
	if (args[0] instanceof ArrayBuffer) {
		return Array.from(new Uint8Array(args[0]));
	}
	return args.map(x => x === +x ? x : x.charCodeAt());
}

test('encode unsupported value', t => {
	// eslint-disable-next-line prefer-arrow-callback
	t.throws(() => ubjson.encode(function () {}));
	t.end();
});

test('encode undefined', t => {
	t.deepEqual(
		toArray(ubjson.encode(undefined)),
		toArray('N')
	);
	t.end();
});

test('encode null', t => {
	t.deepEqual(
		toArray(ubjson.encode(null)),
		toArray('Z')
	);
	t.end();
});

test('encode true', t => {
	t.deepEqual(
		toArray(ubjson.encode(true)),
		toArray('T')
	);
	t.end();
});

test('encode false', t => {
	t.deepEqual(
		toArray(ubjson.encode(false)),
		toArray('F')
	);
	t.end();
});

test('encode int8', t => {
	t.deepEqual(
		toArray(ubjson.encode(100)),
		toArray('i', 100)
	);
	t.end();
});

test('encode uint8', t => {
	t.deepEqual(
		toArray(ubjson.encode(200)),
		toArray('U', 200)
	);
	t.end();
});

test('encode int16', t => {
	t.deepEqual(
		toArray(ubjson.encode(0x1234)),
		toArray('I', 0x12, 0x34)
	);
	t.end();
});

test('encode int32', t => {
	t.deepEqual(
		toArray(ubjson.encode(0x12345678)),
		toArray('l', 0x12, 0x34, 0x56, 0x78)
	);
	t.end();
});

test('encode float32', t => {
	t.deepEqual(
		toArray(ubjson.encode(1.00390625)),
		toArray('d', 0x3f, 0x80, 0x80, 0x00)
	);
	t.end();
});

test('encode float32 (too large integer)', t => {
	t.deepEqual(
		toArray(ubjson.encode(2147483648)),
		toArray('d', 0x4f, 0x00, 0x00, 0x00)
	);
	t.end();
});

test('encode float64', t => {
	t.deepEqual(
		toArray(ubjson.encode(100000.00390625)),
		toArray('D', 0x40, 0xf8, 0x6a, 0x00, 0x10, 0x00, 0x00, 0x00)
	);
	t.end();
});

test('encode char', t => {
	t.deepEqual(
		toArray(ubjson.encode('a')),
		toArray('C', 'a')
	);
	t.end();
});

test('encode string', t => {
	t.deepEqual(
		toArray(ubjson.encode('ubjson')),
		toArray('S', 'i', 6, 'u', 'b', 'j', 's', 'o', 'n')
	);
	t.end();
});

test('encode array', t => {
	t.deepEqual(
		toArray(ubjson.encode([1, 2, 3])),
		toArray('[', 'i', 1, 'i', 2, 'i', 3, ']')
	);
	t.end();
});

test('encode array (int8) [only typed array]', t => {
	t.deepEqual(
		toArray(ubjson.encode([1, 2, 3], { optimizeArrays: 'onlyTypedArrays' })),
		toArray('[', 'i', 1, 'i', 2, 'i', 3, ']')
	);
	t.end();
});

test('encode array (mixed) [optimize]', t => {
	t.deepEqual(
		toArray(ubjson.encode([1, 'a', true], { optimizeArrays: true })),
		toArray('[', '#', 'i', 3, 'i', 1, 'C', 'a', 'T')
	);
	t.end();
});

test('encode array (int8) [optimize]', t => {
	t.deepEqual(
		toArray(ubjson.encode([1, 2, 3], { optimizeArrays: true })),
		toArray('[', '$', 'i', '#', 'i', 3, 1, 2, 3)
	);
	t.end();
});

test('encode array (int16) [optimize]', t => {
	t.deepEqual(
		toArray(ubjson.encode([255, -1], { optimizeArrays: true })),
		toArray('[', '$', 'I', '#', 'i', 2, 0x00, 0xff, 0xff, 0xff)
	);
	t.end();
});

test('encode array (only null values) [optimize]', t => {
	t.deepEqual(
		toArray(ubjson.encode([null, null, null], { optimizeArrays: true })),
		toArray('[', '$', 'Z', '#', 'i', 3)
	);
	t.end();
});

test('encode array (uint8 typed array)', t => {
	t.deepEqual(
		toArray(ubjson.encode(Uint8Array.from([1, 2]))),
		toArray('[', 'i', 1, 'i', 2, ']')
	);
	t.end();
});

test('encode array (int8 typed array) [optimize]', t => {
	t.deepEqual(
		toArray(ubjson.encode(Int8Array.from([18, -2]), { optimizeArrays: true })),
		toArray('[', '$', 'i', '#', 'i', 2, 0x12, 0xfe)
	);
	t.end();
});

test('encode array (uint8 typed array) [optimize]', t => {
	t.deepEqual(
		toArray(ubjson.encode(Uint8Array.from([18, 254]), { optimizeArrays: true })),
		toArray('[', '$', 'U', '#', 'i', 2, 0x12, 0xfe)
	);
	t.end();
});

test('encode array (int16 typed array) [optimize]', t => {
	t.deepEqual(
		toArray(ubjson.encode(Int16Array.from([4660, -292]), { optimizeArrays: true })),
		toArray('[', '$', 'I', '#', 'i', 2, 0x12, 0x34, 0xfe, 0xdc)
	);
	t.end();
});

test('encode array (int32 typed array) [optimize]', t => {
	t.deepEqual(
		toArray(ubjson.encode(Int32Array.from([305419896, -19088744]), { optimizeArrays: true })),
		toArray('[', '$', 'l', '#', 'i', 2, 0x12, 0x34, 0x56, 0x78, 0xfe, 0xdc, 0xba, 0x98)
	);
	t.end();
});

test('encode array (float32 typed array) [optimize]', t => {
	t.deepEqual(
		toArray(ubjson.encode(Float32Array.from([0.25, 0.125]), { optimizeArrays: true })),
		toArray('[', '$', 'd', '#', 'i', 2, 0x3e, 0x80, 0x00, 0x00, 0x3e, 0x00, 0x00, 0x00)
	);
	t.end();
});

test('encode array (float64 typed array) [optimize]', t => {
	t.deepEqual(
		toArray(ubjson.encode(Float64Array.from([0.25, 0.125]), { optimizeArrays: true })),
		toArray(
			'[', '$', 'D', '#', 'i', 2,
			0x3f, 0xd0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x3f, 0xc0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
		)
	);
	t.end();
});

test('encode array (uint8 typed array) [only typed array]', t => {
	t.deepEqual(
		toArray(ubjson.encode(Uint8Array.from([1, 2, 3]), { optimizeArrays: 'onlyTypedArrays' })),
		toArray('[', '$', 'U', '#', 'i', 3, 1, 2, 3)
	);
	t.end();
});

test('encode object', t => {
	t.deepEqual(
		toArray(ubjson.encode({ a: 1, b: 2, c: 3 })),
		toArray(
			'{',
			'i', 1, 'a', 'i', 1,
			'i', 1, 'b', 'i', 2,
			'i', 1, 'c', 'i', 3,
			'}'
		)
	);
	t.end();
});

test('encode object (mixed) [optimize]', t => {
	t.deepEqual(
		toArray(ubjson.encode({ a: 1, b: 'a', c: true }, { optimizeObjects: true })),
		toArray(
			'{', '#', 'i', 3,
			'i', 1, 'a', 'i', 1,
			'i', 1, 'b', 'C', 'a',
			'i', 1, 'c', 'T'
		)
	);
	t.end();
});

test('encode object (strongly typed) [optimize]', t => {
	t.deepEqual(
		toArray(ubjson.encode({ a: 1, b: 2, c: 3 }, { optimizeObjects: true })),
		toArray(
			'{', '$', 'i', '#', 'i', 3,
			'i', 1, 'a', 1,
			'i', 1, 'b', 2,
			'i', 1, 'c', 3
		)
	);
	t.end();
});

test('encode object (only null values) [optimize]', t => {
	t.deepEqual(
		toArray(ubjson.encode({ a: null, b: null, c: null }, { optimizeObjects: true })),
		toArray(
			'{', '$', 'Z', '#', 'i', 3,
			'i', 1, 'a',
			'i', 1, 'b',
			'i', 1, 'c'
		)
	);
	t.end();
});
