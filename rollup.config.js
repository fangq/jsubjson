import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';

export default {
	input: 'src/ubjson.js',
	plugins: [
		babel({ exclude: 'node_modules/**' }),
		terser({
			ecma: 6,
			module: true,
			mangle: {
				toplevel: true,
				properties: { regex: /^_/ }
			},
			compress: {
				passes: 2,
				unsafe: true
			}
		})
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
