const test = require('tape');
const util = require('util');
const ubjson = require('../dist/ubjson');

function toBuffer(...args) {
	return Uint8Array.from(args, x => x === +x ? x : x.charCodeAt()).buffer;
}

test('decode unsupported type', t => {
	t.throws(() => ubjson.decode(toBuffer('!')));
	t.end();
});

test('decode undefined', t => {
	t.equal(
		ubjson.decode(undefined),
		undefined
	);
	t.end();
});

test('decode null', t => {
	t.equal(
		ubjson.decode(toBuffer('Z')),
		null
	);
	t.end();
});

test('decode no-op', t => {
	t.equal(
		ubjson.decode(toBuffer('N')),
		undefined
	);
	t.end();
});

test('decode true', t => {
	t.equal(
		ubjson.decode(toBuffer('T')),
		true
	);
	t.end();
});

test('decode false', t => {
	t.equal(
		ubjson.decode(toBuffer('F')),
		false
	);
	t.end();
});

test('decode int8', t => {
	t.equal(
		ubjson.decode(toBuffer('i', 100)),
		100
	);
	t.end();
});

test('decode uint8', t => {
	t.equal(
		ubjson.decode(toBuffer('U', 200)),
		200
	);
	t.end();
});

test('decode int16', t => {
	t.equal(
		ubjson.decode(toBuffer('I', 0x12, 0x34)),
		0x1234
	);
	t.end();
});

test('decode int32', t => {
	t.equal(
		ubjson.decode(toBuffer('l', 0x12, 0x34, 0x56, 0x78)),
		0x12345678
	);
	t.end();
});

test('decode int64 [error]', t => {
	t.throws(() => ubjson.decode(
		toBuffer('L', 0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0)
	));
	t.end();
});

test('decode int64 [skip]', t => {
	t.doesNotThrow(() => ubjson.decode(
		toBuffer('L', 0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0),
		{ int64Handling: 'skip' }
	));
	t.end();
});

test('decode int64 [raw]', t => {
	t.deepEqual(
		ubjson.decode(
			toBuffer('L', 0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0),
			{ int64Handling: 'raw' }
		),
		[0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0]
	);
	t.end();
});

test('decode int64 [custom handler]', t => {
	t.deepEqual(
		ubjson.decode(
			toBuffer('L', 0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0),
			{
				int64Handling: ({ view }, offset) => ({
					int64: [view.getUint32(offset), view.getUint32(offset + 4)]
				})
			}
		),
		{ int64: [0x12345678, 0x9abcdef0] }
	);
	t.end();
});

test('decode int64 [invalid option]', t => {
	t.throws(() => ubjson.decode(
		toBuffer('L', 0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0),
		{ int64Handling: 'invalid' }
	));
	t.end();
});

test('decode float32', t => {
	t.equal(
		ubjson.decode(toBuffer('d', 0x3f, 0x80, 0x80, 0x00)),
		1.00390625
	);
	t.end();
});

test('decode float64', t => {
	t.equal(
		ubjson.decode(toBuffer('D', 0x40, 0xf8, 0x6a, 0x00, 0x10, 0x00, 0x00, 0x00)),
		100000.00390625
	);
	t.end();
});

test('decode high-precision number [error]', t => {
	t.throws(() => ubjson.decode(
		toBuffer('H', 'i', 3, '1', '.', '1')
	));
	t.end();
});

test('decode high-precision number [skip]', t => {
	t.doesNotThrow(() => ubjson.decode(
		toBuffer('H', 'i', 3, '1', '.', '1'),
		{ highPrecisionNumberHandling: 'skip' }
	));
	t.end();
});

test('decode high-precision number [raw]', t => {
	t.equal(
		ubjson.decode(
			toBuffer('H', 'i', 3, '1', '.', '1'),
			{ highPrecisionNumberHandling: 'raw' }
		),
		'1.1'
	);
	t.end();
});

test('decode high-precision number [custom handler]', t => {
	t.deepEqual(
		ubjson.decode(
			toBuffer('H', 'i', 3, '1', '.', '1'),
			{
				highPrecisionNumberHandling: ({ array }, offset, byteLength) => {
					const view = new DataView(array.buffer, offset, byteLength);
					const decoder = new util.TextDecoder();
					return { highPrecisionNumber: decoder.decode(view) };
				}
			}
		),
		{ highPrecisionNumber: '1.1' }
	);
	t.end();
});

test('decode char', t => {
	t.equal(
		ubjson.decode(toBuffer('C', 'a')),
		'a'
	);
	t.end();
});

test('decode string', t => {
	t.equal(
		ubjson.decode(toBuffer('S', 'i', 6, 'u', 'b', 'j', 's', 'o', 'n')),
		'ubjson'
	);
	t.end();
});

test('decode array', t => {
	t.deepEqual(
		ubjson.decode(toBuffer('[', 'i', 1, 'i', 2, 'i', 3, ']')),
		[1, 2, 3]
	);
	t.end();
});

test('decode array (with no-op)', t => {
	t.deepEqual(
		ubjson.decode(toBuffer('[', 'i', 1, 'N', 'i', 2, 'i', 3, 'N', ']')),
		[1, 2, 3]
	);
	t.end();
});

test('decode array (empty, optimized)', t => {
	t.deepEqual(
		ubjson.decode(toBuffer('[', '#', 'i', 0)),
		[]
	);
	t.end();
});

test('decode array (mixed, optimized)', t => {
	t.deepEqual(
		ubjson.decode(toBuffer('[', '#', 'i', 3, 'i', 1, 'C', 'a', 'T')),
		[1, 'a', true]
	);
	t.end();
});

test('decode array (strongly typed, optimized)', t => {
	t.deepEqual(
		ubjson.decode(
			toBuffer('[', '$', 'i', '#', 'i', 3, 1, 2, 3)
		),
		[1, 2, 3]
	);
	t.end();
});

test('decode array (strongly typed, unexpected eof, optimized)', t => {
	t.throws(() => ubjson.decode(toBuffer('[', '$', 'i', '#', 'i', 3, 1, 2)));
	t.end();
});

test('decode array (strongly typed, invalid length value, optimized)', t => {
	t.throws(() => ubjson.decode(toBuffer('[', '$', 'i', '#', 'i', -1)));
	t.end();
});

test('decode array (strongly typed, invalid length type, optimized)', t => {
	t.throws(() => ubjson.decode(toBuffer('[', '$', 'i', '#', 'C', '0')));
	t.end();
});

test('decode array (strongly typed, malformed, optimized)', t => {
	t.throws(() => ubjson.decode(toBuffer('[', '$', 'i', 1, 2, 3, ']')));
	t.end();
});

test('decode array (only null values, optimized)', t => {
	t.deepEqual(
		ubjson.decode(toBuffer('[', '$', 'Z', '#', 'i', 3)),
		[null, null, null]
	);
	t.end();
});

test('decode array (int8, strongly typed, optimized) [use typed array]', t => {
	const actual = ubjson.decode(
		toBuffer('[', '$', 'i', '#', 'i', 2, 0x12, 0xfe),
		{ useTypedArrays: true }
	);
	t.assert(actual.constructor.name === 'Int8Array');
	t.deepEqual(actual, [18, -2]);
	t.end();
});

test('decode array (uint8, strongly typed, optimized) [use typed array]', t => {
	const actual = ubjson.decode(
		toBuffer('[', '$', 'U', '#', 'i', 2, 0x12, 0xfe),
		{ useTypedArrays: true }
	);
	t.assert(actual.constructor.name === 'Uint8Array');
	t.deepEqual(actual, [18, 254]);
	t.end();
});

test('decode array (int16, strongly typed, optimized) [use typed array]', t => {
	const actual = ubjson.decode(
		toBuffer('[', '$', 'I', '#', 'i', 2, 0x12, 0x34, 0xfe, 0xdc),
		{ useTypedArrays: true }
	);
	t.assert(actual.constructor.name === 'Int16Array');
	t.deepEqual(actual, [4660, -292]);
	t.end();
});

test('decode array (int32, strongly typed, optimized) [use typed array]', t => {
	const actual = ubjson.decode(
		toBuffer(
			'[', '$', 'l', '#', 'i', 2,
			0x12, 0x34, 0x56, 0x78, 0xfe, 0xdc, 0xba, 0x98
		),
		{ useTypedArrays: true }
	);
	t.assert(actual.constructor.name === 'Int32Array');
	t.deepEqual(actual, [305419896, -19088744]);
	t.end();
});

test('decode array (float32, strongly typed, optimized) [use typed array]', t => {
	const actual = ubjson.decode(
		toBuffer(
			'[', '$', 'd', '#', 'i', 2,
			0x3e, 0x80, 0x00, 0x00, 0x3e, 0x00, 0x00, 0x00
		),
		{ useTypedArrays: true }
	);
	t.assert(actual.constructor.name === 'Float32Array');
	t.deepEqual(actual, [0.25, 0.125]);
	t.end();
});

test('decode array (float64, strongly typed, optimized) [use typed array]', t => {
	const actual = ubjson.decode(
		toBuffer(
			'[', '$', 'D', '#', 'i', 2,
			0x3f, 0xd0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x3f, 0xc0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
		),
		{ useTypedArrays: true }
	);
	t.assert(actual.constructor.name === 'Float64Array');
	t.deepEqual(actual, [0.25, 0.125]);
	t.end();
});

test('decode object', t => {
	t.deepEqual(
		ubjson.decode(toBuffer(
			'{',
			'i', 1, 'a', 'i', 1,
			'i', 1, 'b', 'i', 2,
			'i', 1, 'c', 'i', 3,
			'}'
		)),
		{ a: 1, b: 2, c: 3 }
	);
	t.end();
});

test('decode object (with no-op)', t => {
	t.deepEqual(
		ubjson.decode(toBuffer(
			'N', '{',
			'N', 'i', 1, 'a', 'i', 1,
			'i', 1, 'b', 'N', 'i', 2,
			'i', 1, 'c', 'i', 3, 'N',
			'}', 'N'
		)),
		{ a: 1, b: 2, c: 3 }
	);
	t.end();
});

test('decode array (empty, optimized)', t => {
	t.deepEqual(
		ubjson.decode(toBuffer('{', '#', 'i', 0)),
		{}
	);
	t.end();
});

test('decode object (mixed, optimized)', t => {
	t.deepEqual(
		ubjson.decode(toBuffer(
			'{', '#', 'i', 3,
			'i', 1, 'a', 'i', 1,
			'i', 1, 'b', 'C', 'a',
			'i', 1, 'c', 'T'
		)),
		{ a: 1, b: 'a', c: true }
	);
	t.end();
});

test('decode object (strongly typed, optimized)', t => {
	t.deepEqual(
		ubjson.decode(toBuffer(
			'{', '$', 'i', '#', 'i', 3,
			'i', 1, 'a', 1,
			'i', 1, 'b', 2,
			'i', 1, 'c', 3
		)),
		{ a: 1, b: 2, c: 3 }
	);
	t.end();
});

test('decode object (only null values, optimized)', t => {
	t.deepEqual(
		ubjson.decode(toBuffer(
			'{', '$', 'Z', '#', 'i', 3,
			'i', 1, 'a',
			'i', 1, 'b',
			'i', 1, 'c'
		)),
		{ a: null, b: null, c: null }
	);
	t.end();
});
