# UBJSON encoder/decoder

*Lightweight, quick and dirty UBJSON encoder/decoder for the browser and node.js.*

This library implements [Universal Binary JSON] Draft 12 encoder/decoder in JavaScript.

> ⚠ Please note, this package is in early alpha stage. Encoding and decoding working as far
> as I know. If you encounter an bug, please [create an issue].

There are no unit test yet. PRs are welcome!

[Universal Binary JSON]: http://ubjson.org/
[create an issue]: https://bitbucket.org/shelacek/ubjson/issues


## Example (browser)

```js
import Ubjson from '@shelacek/ubjson';
const buffer = Ubjson.encode({ hello: 'world', from: ['UBJSON'] });
const obj = Ubjson.decode(buffer);
console.log(obj); // { hello: 'world', from: ['UBJSON'] }
```


## Example (node.js)

```js
const ubjson = require('@shelacek/ubjson');
const buffer = ubjson.encode({ hello: 'world', from: ['UBJSON'] });
const obj = ubjson.decode(buffer);
console.log(obj); // { hello: 'world', from: ['UBJSON'] }
```


## API

> Note: You can find typings at https://bitbucket.org/shelacek/ubjson/src/master/src/types.d.ts.


### `Ubjson.encode(value, [options])`

- `value: any` - input value, array or object to serialize.
- `options: Object` (optional) - encoding options.
  - `options.optimizeArrays: boolean | 'onlyTypedArray'` (default `false`) - enable use
    of [optimized format] for arrays. If `'onlyTypedArray'` is used, only *TypedArrays* use strongly
    typed container.
  - `options.optimizeObjects: boolean` (default `false`) - enable use of [optimized format]
    for objects.

Method returns `ArrayBuffer` with *UBJSON* data.

[optimized format]: http://ubjson.org/type-reference/container-types/#optimized-format


### `Ubjson.decode(buffer, [options])`

- `buffer: ArrayBuffer` - input buffer, that *UBJSON* data.
- `options: Object` (optional) - decoding options.
  - `options.int64Handling: 'error' | 'skip' | 'raw'` (default `error`) - Handling of unsupported
    *int64* values. 'error' throws exception, 'skip' ignore that value (or key/value pair) and 'raw'
    returns Uint8Array with *int64* bytes.
  - `options.highPrecisionNumberHandling: 'error' | 'skip' | 'raw'` (default `error`) - Handling
    of unsupported *high-precision numbers*. 'error' throws exception, 'skip' ignore that value
    (or key/value pair) and 'raw' returns string represents that number.
  - `options.useTypedArrays: boolean` (default `true`) - enable use of *TypedArrays* for strongly
    typed containers.

Method returns decoded *UBJSON* value/object/array (`any`).


## Limitations

This library does not support encoding of [no-op value] yet. Javascript not support
[64-bit integers]&nbsp;(yet) and [high-precision numbers], as well as the library. You can use
`'raw'` option in `int64Handling`/`highPrecisionNumberHandling` to retrive original data.

[no-op value]: http://ubjson.org/type-reference/value-types/#noop
[64-bit integers]: http://ubjson.org/type-reference/value-types/#numeric-64bit
[high-precision numbers]: http://ubjson.org/type-reference/value-types/#numeric-gt-64bit


## Compatibility

The library needs a `TextEncoder` and `TextDecoder` (or `util.TextEncoder`/`util.TextDecoder`
on node.js), support for `TypedArrays` and `class` keyword. Library should work on
*Firefox*&nbsp;>=45, *Chrome*&nbsp;>=49, *Safari*&nbsp;>=10.1, *Opera*&nbsp;>=36,
*Node*&nbsp;>=8.11.3. *Edge* needs TextEncoder/TextDecoder polyfill.

In case of interest, I can reduce requirements.

