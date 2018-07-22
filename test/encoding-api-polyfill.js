const test = require('tape');
const util = require('util');

test('encode/decode with encoding API polyfill', t => {
	global.TextEncoder = util.TextEncoder;
	global.TextDecoder = util.TextDecoder;
	Object.keys(require.cache).forEach(x => delete require.cache[x]);
	// eslint-disable-next-line global-require
	const ubjson = require('../dist/ubjson');

	const value = { hello: 'world', from: ['UBJSON'] };
	t.deepEqual(ubjson.decode(ubjson.encode(value)), value);
	t.end();
});

test('encode/decode without encoding API polyfill', t => {
	delete global.TextEncoder;
	delete global.TextDecoder;
	Object.keys(require.cache).forEach(x => delete require.cache[x]);
	// eslint-disable-next-line global-require
	const ubjson = require('../dist/ubjson');

	const value = { hello: 'world', from: ['UBJSON'] };
	t.deepEqual(ubjson.decode(ubjson.encode(value)), value);
	t.end();
});
