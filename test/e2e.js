const test = require('tape');
const ubjson = require('../dist/ubjson');

test('encode/decode complex object', t => {
	const expected = {
		hello: 'world',
		from: ['UBJSON'],
		colors: [
			[255, 255, 255],
			[0, 0, 0],
			[64, 64, 96]
		],
		domains: {
			com: 'commercial',
			org: 'organization',
			net: 'network'
		},
		entires: [
			{
				id: 1,
				name: 'test',
				content: null,
				timestamp: 1532432408.008,
				published: false
			}, {
				id: 2,
				name: 'lorem',
				content: 'Lorem ipsum...',
				timestamp: 1532432416.346,
				published: true
			}
		]
	};
	const actual = ubjson.decode(ubjson.encode(
		expected,
		{ optimizeArrays: true, optimizeObjects: true }
	));
	t.deepEqual(actual, expected);
	t.end();
});
