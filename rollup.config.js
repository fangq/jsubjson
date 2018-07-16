import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';

export default {
	input: 'src/ubjson.js',
	plugins: [
		babel({ exclude: 'node_modules/**' }),
		terser({ mangle: { properties: { regex: /^_/ } } })
	],
	output: [
		{
			file: 'dist/ubjson.js',
			format: 'cjs',
			sourcemap: true
		}, {
			file: 'dist/ubjson.es.js',
			format: 'es',
			sourcemap: true
		}
	]
};
