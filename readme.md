# svgstore

[![NPM version][npm-img]][npm-url] [![Downloads][downloads-img]][npm-url]

Combines multiple SVG files into one using `<symbol>` elements which you may [`<use>` in your markup](https://css-tricks.com/svg-sprites-use-better-icon-fonts/). Heavily inspired by [`grunt-svgstore`](https://github.com/FWeinb/grunt-svgstore) and [`gulp-svgstore`](https://github.com/w0rm/gulp-svgstore), this is a standalone module that may be [used in any asset pipeline](#future-goals).

## Install

    $ npm install --save svgstore

## Usage

```js
var svgstore = require('svgstore');
var fs = require('fs');

var sprites = svgstore()
    .add('unicorn', fs.readFileSync('./unicorn.svg', 'utf8'))
    .add('rainbow', fs.readFileSync('./rainbow.svg', 'utf8'));

fs.writeFileSync('./sprites.svg', sprites);
```

The resulting file may be consumed in markup as external content.

```html
<body>
    <svg role="img"><use xlink:href="./sprites.svg#unicorn"/></svg>
    <svg role="img"><use xlink:href="./sprites.svg#rainbow"/></svg>
</body>
```

See the [examples directory](https://github.com/shannonmoeller/svgstore/tree/master/docs/examples) for more detail.

## API

### svgstore([options]): SvgStore

- `options` `{Object}`: [Options for converting SVGs to symbols](#svgstore-options)

Creates a container SVG sprites document.

### .element

The current [cheerio](https://github.com/cheeriojs/cheerio) instance.

### .add(id, svg [, options]): SvgStore

- `id` `{String}` Unique `id` for this SVG file.
- `svg` `{String}` Raw source of the SVG file.
- `options` `{Object}` Same as the [options of `svgstore()`](#svgstore-options), but will only apply to this SVG file's `<symbol>`.

Appends a file to the sprite with the given `id`.

### .toString([options]): String

- `options` `{Object}`
  - `inline` `{Boolean}` (default: `false`) Don't output `<?xml ?>`, `DOCTYPE`, and the `xmlns` attribute.

Outputs sprite as a string of XML.

## <a name="svgstore-options"></a>Options

- `cleanDefs` `{Boolean|Array}` (default: `false`) Remove `style` attributes from SVG definitions, or a list of attributes to remove.
- `cleanSymbols` `{Boolean|Array}` (default: `false`) Remove `style` attributes from SVG objects, or a list of attributes to remove.
- `svgAttrs` `{Boolean|Object}` (default: `false`) A map of attributes to set on the root `<svg>` element. If you set an attribute's value to null, you remove that attribute. Values may be functions like jQuery.
- `symbolAttrs` `{Boolean|Object}` (default: `false`) A map of attributes to set on each `<symbol>` element. If you set an attribute's value to null, you remove that attribute. Values may be functions like jQuery.
- `copyAttrs` `{Boolean|Array}` (default: `false`) Attributes to have `svgstore` attempt to copy to the newly created `<symbol>` tag from it's source `<svg>` tag. The `viewBox`, `aria-labelledby`, and `role` attributes are always copied.
- `renameDefs` `{Boolean}` (default: `false`) Rename `defs` content ids to make them inherit files' names so that it would help to avoid defs with same ids in the output file.
- `fragmentIdentifier` `{Function}` (default: `null`) Enable [SVG Fragment Identifiers](https://css-tricks.com/svg-fragment-identifiers-work/) to allow the use of `<img src="icons.svg#unicorn-view" />`. You can custom fragment ID like `(id) => 'view-' + id`

## Contributing

Standards for this project, including tests, code coverage, and semantics are enforced with a build tool. Pull requests must include passing tests with 100% code coverage and no linting errors.

### Test

    $ npm test

## Future Goals

The svgstore organization began after it was noticed that the common [build task of converting an `<svg>` into a `<symbol>` tag](https://css-tricks.com/svg-symbol-good-choice-icons/) was being implemented in a similar manner by many different projects across the JavaScript ecosystem.

The long-term goal for this project, in particular, is to provide a single standalone module that can be plugged in to any asset pipeline, thus allowing pipeline tools to focus on providing clean APIs and interfaces related to their build process integration, rather than implementing/duplicating SVG conversion logic directly.

#### Current build tools using `svgstore`:

* [broccoli-svgstore][broccoli-svgstore]
* [svgstore-cli][svgstore-cli]

----

MIT © [Shannon Moeller](http://shannonmoeller.com)

[downloads-img]: http://img.shields.io/npm/dm/svgstore.svg?style=flat-square
[npm-img]:       http://img.shields.io/npm/v/svgstore.svg?style=flat-square
[npm-url]:       https://npmjs.org/package/svgstore
[broccoli-svgstore]: https://github.com/svgstore/broccoli-svgstore
[svgstore-cli]: https://github.com/svgstore/svgstore-cli
