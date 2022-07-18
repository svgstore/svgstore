'use strict';

const svgstore = require('../src/svgstore.js');
const test = require('./utils/test.js');

const doctype =
	'<?xml version="1.0" encoding="UTF-8"?>' +
	'<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" ' +
	'"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';

const svgNs =
	'<svg xmlns="http://www.w3.org/2000/svg" ' +
	'xmlns:xlink="http://www.w3.org/1999/xlink">';

const FIXTURE_SVGS = {
	foo: '<svg viewBox="0 0 100 100"><defs><linear-gradient style="fill: red;"/></defs><path style="fill: red;"/></svg>',
	bar: '<svg viewBox="0 0 200 200"><defs><radial-gradient style="stroke: red;"/></defs><rect style="stroke: red;"/></svg>',
	baz: '<svg viewBox="0 0 200 200"><defs><linear-gradient style="fill: red;"/></defs><path style="fill: red;"/></svg>',
	qux: '<svg viewBox="0 0 200 200"><defs><radial-gradient style="stroke: red;" fill="blue"/></defs><rect style="stroke: red;" fill="blue"/></svg>',
	quux: '<svg viewBox="0 0 200 200" aria-labelledby="titleId" role="img"><title id="titleId">A boxy shape</title><rect/></svg>',
	corge:
		'<svg viewBox="0 0 200 200" aria-labelledby="titleId" role="img" preserveAspectRatio="xMinYMax" take-me-too="foo" count-me-out="bar">' +
		'<title id="titleId">A boxy shape</title><rect/></svg>',
	defsWithId:
		'<svg><defs><linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="a"><stop stop-color="#FFF" offset="0%"/><stop stop-color="#F0F0F0" offset="100%"/></linearGradient><path id="b" d=""/></defs><path fill="url(#a)" fill-rule="nonzero" d=""/><use xlink:href="#b"></use><use fill-rule="nonzero" xlink:href="#b"></use><path fill="url(#a)" fill-rule="nonzero" d=""/></svg>',
};

test('should create an svg document', async (t) => {
	const store = svgstore();
	const svg = store.toString();

	t.strictEqual(svg.slice(0, 5), '<?xml');
});

test('should create an svg element', async (t) => {
	const store = svgstore();
	const svg = store.toString({ inline: true });

	t.strictEqual(svg.slice(0, 4), '<svg');
});

test('should combine svgs', async (t) => {
	const store = svgstore()
		.add('foo', doctype + FIXTURE_SVGS.foo)
		.add('bar', doctype + FIXTURE_SVGS.bar);

	const expected =
		doctype +
		svgNs +
		'<defs>' +
		'<linear-gradient style="fill: red;"/>' +
		'<radial-gradient style="stroke: red;"/>' +
		'</defs>' +
		'<symbol id="foo" viewBox="0 0 100 100"><path style="fill: red;"/></symbol>' +
		'<symbol id="bar" viewBox="0 0 200 200"><rect style="stroke: red;"/></symbol>' +
		'</svg>';

	t.strictEqual(store.toString(), expected);
});

test('should clean defs', async (t) => {
	const store = svgstore({ cleanDefs: true })
		.add('foo', doctype + FIXTURE_SVGS.foo)
		.add('bar', doctype + FIXTURE_SVGS.bar)
		.add('baz', doctype + FIXTURE_SVGS.baz, {
			cleanDefs: [],
		})
		.add('qux', doctype + FIXTURE_SVGS.qux, {
			cleanDefs: ['fill'],
		});

	const expected =
		doctype +
		svgNs +
		'<defs>' +
		'<linear-gradient/><radial-gradient/>' +
		'<linear-gradient style="fill: red;"/>' +
		'<radial-gradient style="stroke: red;"/>' +
		'</defs>' +
		'<symbol id="foo" viewBox="0 0 100 100"><path style="fill: red;"/></symbol>' +
		'<symbol id="bar" viewBox="0 0 200 200"><rect style="stroke: red;"/></symbol>' +
		'<symbol id="baz" viewBox="0 0 200 200"><path style="fill: red;"/></symbol>' +
		'<symbol id="qux" viewBox="0 0 200 200"><rect style="stroke: red;" fill="blue"/></symbol>' +
		'</svg>';

	t.strictEqual(store.toString(), expected);
});

test('should clean symbols', async (t) => {
	const store = svgstore({ cleanSymbols: true })
		.add('foo', doctype + FIXTURE_SVGS.foo)
		.add('bar', doctype + FIXTURE_SVGS.bar)
		.add('baz', doctype + FIXTURE_SVGS.baz, {
			cleanSymbols: [],
		})
		.add('qux', doctype + FIXTURE_SVGS.qux, {
			cleanSymbols: ['fill'],
		});

	const expected =
		doctype +
		svgNs +
		'<defs>' +
		'<linear-gradient style="fill: red;"/>' +
		'<radial-gradient style="stroke: red;"/>' +
		'<linear-gradient style="fill: red;"/>' +
		'<radial-gradient style="stroke: red;" fill="blue"/>' +
		'</defs>' +
		'<symbol id="foo" viewBox="0 0 100 100"><path/></symbol>' +
		'<symbol id="bar" viewBox="0 0 200 200"><rect/></symbol>' +
		'<symbol id="baz" viewBox="0 0 200 200"><path style="fill: red;"/></symbol>' +
		'<symbol id="qux" viewBox="0 0 200 200"><rect style="stroke: red;"/></symbol>' +
		'</svg>';

	t.strictEqual(store.toString(), expected);
});

test('should attempt to preserve the `viewBox`, `aria-labelledby`, and `role` attributes of the root SVG by default', async (t) => {
	const store = svgstore().add('quux', FIXTURE_SVGS.quux);

	const expected =
		doctype +
		svgNs +
		'<defs/>' +
		'<symbol id="quux" viewBox="0 0 200 200" aria-labelledby="titleId" role="img">' +
		'<title id="titleId">A boxy shape</title><rect/>' +
		'</symbol>' +
		'</svg>';

	t.strictEqual(store.toString(), expected);
});

test('should support custom attribute preservation, on top of the defaults', async (t) => {
	const copyAttrs = ['preserveAspectRatio', 'take-me-too', 'role'];
	const store = svgstore({ copyAttrs }).add('corge', FIXTURE_SVGS.corge);

	const expected =
		doctype +
		svgNs +
		'<defs/>' +
		'<symbol id="corge" viewBox="0 0 200 200" aria-labelledby="titleId" role="img" preserveAspectRatio="xMinYMax" take-me-too="foo">' +
		'<title id="titleId">A boxy shape</title><rect/>' +
		'</symbol>' +
		'</svg>';

	t.strictEqual(store.toString(), expected);
});

test('should set symbol attributes', async (t) => {
	const options = {
		inline: true,
		symbolAttrs: {
			viewBox: null,
			id: function (id) {
				return 'icon-' + id;
			},
		},
	};

	const store = svgstore(options)
		.add('foo', doctype + FIXTURE_SVGS.foo)
		.add('bar', doctype + FIXTURE_SVGS.bar);

	const expected =
		'<svg>' +
		'<defs>' +
		'<linear-gradient style="fill: red;"/>' +
		'<radial-gradient style="stroke: red;"/>' +
		'</defs>' +
		'<symbol id="icon-foo"><path style="fill: red;"/></symbol>' +
		'<symbol id="icon-bar"><rect style="stroke: red;"/></symbol>' +
		'</svg>';

	t.strictEqual(store.toString(), expected);
});

test('should set svg attributes', async (t) => {
	const options = {
		inline: true,
		svgAttrs: {
			id: 'spritesheet',
			style: 'display: none',
		},
	};

	const store = svgstore(options)
		.add('foo', doctype + FIXTURE_SVGS.foo)
		.add('bar', doctype + FIXTURE_SVGS.bar);

	const expected =
		'<svg id="spritesheet" style="display: none">' +
		'<defs>' +
		'<linear-gradient style="fill: red;"/>' +
		'<radial-gradient style="stroke: red;"/>' +
		'</defs>' +
		'<symbol id="foo" viewBox="0 0 100 100"><path style="fill: red;"/></symbol>' +
		'<symbol id="bar" viewBox="0 0 200 200"><rect style="stroke: red;"/></symbol>' +
		'</svg>';

	t.strictEqual(store.toString(), expected);
});

test('should rename defs id', async (t) => {
	const options = {
		inline: true,
		renameDefs: true,
	};

	const store = svgstore(options).add(
		'defs_with_id',
		doctype + FIXTURE_SVGS.defsWithId
	);

	const expected =
		'<svg>' +
		'<defs>' +
		'<linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="defs_with_id_a">' +
		'<stop stop-color="#FFF" offset="0%"/>' +
		'<stop stop-color="#F0F0F0" offset="100%"/>' +
		'</linearGradient>' +
		'<path id="defs_with_id_b" d=""/>' +
		'</defs>' +
		'<symbol id="defs_with_id">' +
		'<path fill="url(#defs_with_id_a)" fill-rule="nonzero" d=""/>' +
		'<use xlink:href="#defs_with_id_b"/>' +
		'<use fill-rule="nonzero" xlink:href="#defs_with_id_b"/>' +
		'<path fill="url(#defs_with_id_a)" fill-rule="nonzero" d=""/>' +
		'</symbol>' +
		'</svg>';

	t.strictEqual(store.toString(), expected);
});

test('should add <view/> and <use/> to enable SVG Fragment Identifiers', async (t) => {
	const store = svgstore({ fragmentIdentifier: (id) => `view-${id}` })
		.add('foo', doctype + FIXTURE_SVGS.foo.replace('<svg', svgNs.slice(0, -1)))
		.add('bar', doctype + FIXTURE_SVGS.bar.replace('<svg', svgNs.slice(0, -1)));

	const expected =
		doctype +
		svgNs +
		'<defs>' +
		'<linear-gradient style="fill: red;"/>' +
		'<radial-gradient style="stroke: red;"/>' +
		'</defs>' +
		'<symbol id="foo" viewBox="0 0 100 100"><path style="fill: red;"/></symbol>' +
		'<view id="view-foo" viewBox="0 0 100 100"/>' +
		'<use xlink:href="#foo" width="100" height="100" x="0" y="0"/>' +
		'<symbol id="bar" viewBox="0 0 200 200"><rect style="stroke: red;"/></symbol>' +
		'<view id="view-bar" viewBox="0 100 200 200"/>' +
		'<use xlink:href="#bar" width="200" height="200" x="0" y="100"/>' +
		'</svg>';

	t.strictEqual(store.toString(), expected);
});
