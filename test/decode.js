const test = require('tape');
const ubjson = require('../dist/ubjson');

function toBuffer(...args) {
	return Uint8Array.from(args, x => x === +x ? x : x.charCodeAt()).buffer;
}

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

test('decode int64 (error)', t => {
	t.throws(() => ubjson.decode(
		toBuffer('L', 0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0)
	));
	t.end();
});

test('decode int64 (skip)', t => {
	t.doesNotThrow(() => ubjson.decode(
		toBuffer('L', 0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0),
		{ int64Handling: 'skip' }
	));
	t.end();
});

test('decode int64 (raw)', t => {
	t.deepEqual(
		ubjson.decode(
			toBuffer('L', 0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0),
			{ int64Handling: 'raw' }
		),
		[0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0]
	);
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

test('decode high-precision number (error)', t => {
	t.throws(() => ubjson.decode(
		toBuffer('H', 'i', 3, '1', '.', '1')
	));
	t.end();
});

test('decode high-precision number (skip)', t => {
	t.doesNotThrow(() => ubjson.decode(
		toBuffer('H', 'i', 3, '1', '.', '1'),
		{ highPrecisionNumberHandling: 'skip' }
	));
	t.end();
});

test('decode high-precision number (raw)', t => {
	t.equal(
		ubjson.decode(
			toBuffer('H', 'i', 3, '1', '.', '1'),
			{ highPrecisionNumberHandling: 'raw' }
		),
		'1.1'
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

test('decode array with no-op', t => {
	t.deepEqual(
		ubjson.decode(toBuffer('[', 'i', 1, 'N', 'i', 2, 'i', 3, 'N', ']')),
		[1, 2, 3]
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
		ubjson.decode(toBuffer('[', '$', 'i', '#', 'i', 3, 1, 2, 3)),
		[1, 2, 3]
	);
	t.end();
});

test('decode array (only null values, optimized)', t => {
	t.deepEqual(
		ubjson.decode(toBuffer('[', '$', 'Z', '#', 'i', 3)),
		[null, null, null]
	);
	t.end();
});

test('decode array (strongly typed, optimized, use typed array)', t => {
	const actual = ubjson.decode(
		toBuffer('[', '$', 'U', '#', 'i', 3, 1, 2, 3),
		{ useTypedArrays: true }
	);
	t.assert(actual.constructor.name === 'Uint8Array');
	t.deepEqual(actual, [1, 2, 3]);
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

test('decode object with no-op', t => {
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
