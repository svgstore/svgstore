import test from 'ava';
import svgstore from '../src/svgstore';

const doctype = '<?xml version="1.0" encoding="UTF-8"?>' +
	'<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" ' +
	'"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';

const svgNs = '<svg xmlns="http://www.w3.org/2000/svg" ' +
	'xmlns:xlink="http://www.w3.org/1999/xlink">';

const FIXTURE_SVGS = {
	foo: '<svg viewBox="0 0 100 100"><defs><linear-gradient style="fill: red;"/></defs><path style="fill: red;"/></svg>',
	bar: '<svg viewBox="0 0 200 200"><defs><radial-gradient style="stroke: red;"/></defs><rect style="stroke: red;"/></svg>',
	baz: '<svg viewBox="0 0 200 200"><defs><linear-gradient style="fill: red;"/></defs><path style="fill: red;"/></svg>',
	qux: '<svg viewBox="0 0 200 200"><defs><radial-gradient style="stroke: red;" fill="blue"/></defs><rect style="stroke: red;" fill="blue"/></svg>',
	quux: '<svg viewBox="0 0 200 200" aria-labelledby="titleId" role="img"><title id="titleId">A boxy shape</title><rect/></svg>',
	corge: '<svg viewBox="0 0 200 200" aria-labelledby="titleId" role="img" preserveAspectRatio="xMinYMax" take-me-too="foo" count-me-out="bar">' +
		'<title id="titleId">A boxy shape</title><rect/></svg>'
};

test('should create an svg document', async t => {
	const store = svgstore();
	const svg = store.toString();

	t.is(svg.slice(0, 5), '<?xml');
});

test('should create an svg element', async t => {
	const store = svgstore();
	const svg = store.toString({inline: true});

	t.is(svg.slice(0, 4), '<svg');
});

test('should combine svgs', async t => {
	const store = svgstore()
		.add('foo', doctype + FIXTURE_SVGS.foo)
		.add('bar', doctype + FIXTURE_SVGS.bar);

	const expected = doctype +
		svgNs +
		'<defs>' +
		'<linear-gradient style="fill: red;"/>' +
		'<radial-gradient style="stroke: red;"/>' +
		'</defs>' +
		'<symbol id="foo" viewBox="0 0 100 100"><path style="fill: red;"/></symbol>' +
		'<symbol id="bar" viewBox="0 0 200 200"><rect style="stroke: red;"/></symbol>' +
		'</svg>';

	t.is(store.toString(), expected);
});

test('should clean defs', async t => {
	const store = svgstore({cleanDefs: true})
		.add('foo', doctype + FIXTURE_SVGS.foo)
		.add('bar', doctype + FIXTURE_SVGS.bar)
		.add('baz', doctype + FIXTURE_SVGS.baz, {
			cleanDefs: []
		})
		.add('qux', doctype + FIXTURE_SVGS.qux, {
			cleanDefs: ['fill']
		});

	const expected = doctype +
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

	t.is(store.toString(), expected);
});

test('should clean symbols', async t => {
	const store = svgstore({cleanSymbols: true})
		.add('foo', doctype + FIXTURE_SVGS.foo)
		.add('bar', doctype + FIXTURE_SVGS.bar)
		.add('baz', doctype + FIXTURE_SVGS.baz, {
			cleanSymbols: []
		})
		.add('qux', doctype + FIXTURE_SVGS.qux, {
			cleanSymbols: ['fill']
		});

	const expected = doctype +
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

	t.is(store.toString(), expected);
});

test('should attempt to preserve the `viewBox`, `aria-labelledby`, and `role` attributes of the root SVG by default', async t => {
	const store = svgstore()
		.add('quux', FIXTURE_SVGS.quux);

	const expected = doctype +
		svgNs +
		'<defs/>' +
		'<symbol id="quux" viewBox="0 0 200 200" aria-labelledby="titleId" role="img">' +
		'<title id="titleId">A boxy shape</title><rect/>' +
		'</symbol>' +
		'</svg>';

	t.is(store.toString(), expected);
});

test('should support custom attribute copying, on top of the defaults', async t => {
	const copiedSymbolAttrs = ['preserveAspectRatio', 'take-me-too'];
	const store = svgstore({copiedSymbolAttrs})
		.add('corge', FIXTURE_SVGS.corge);

	const expected = doctype +
		svgNs +
		'<defs/>' +
		'<symbol id="corge" viewBox="0 0 200 200" aria-labelledby="titleId" role="img" preserveAspectRatio="xMinYMax" take-me-too="foo">' +
		'<title id="titleId">A boxy shape</title><rect/>' +
		'</symbol>' +
		'</svg>';

	t.is(store.toString(), expected);
});

test('should support custom attributes on a <symbol>', async t => {
	const options = {
		inline: true,
		customSymbolAttrs: {
			viewBox: null,
			id: function (id) {
				return 'icon-' + id;
			}
		}
	};

	const store = svgstore(options)
		.add('foo', doctype + FIXTURE_SVGS.foo)
		.add('bar', doctype + FIXTURE_SVGS.bar);

	const expected = '<svg>' +
		'<defs>' +
		'<linear-gradient style="fill: red;"/>' +
		'<radial-gradient style="stroke: red;"/>' +
		'</defs>' +
		'<symbol id="icon-foo"><path style="fill: red;"/></symbol>' +
		'<symbol id="icon-bar"><rect style="stroke: red;"/></symbol>' +
		'</svg>';

	t.is(store.toString(), expected);
});

test('should support custom attributes on the root <svg>', async t => {
	const options = {
		inline: true,
		customSVGAttrs: {
			id: 'spritesheet',
			style: 'display: none',
			custom: 'awesome'
		}
	};

	const store = svgstore(options)
		.add('foo', doctype + FIXTURE_SVGS.foo)
		.add('bar', doctype + FIXTURE_SVGS.bar);

	const expected = '<svg id="spritesheet" style="display: none" custom="awesome">' +
		'<defs>' +
		'<linear-gradient style="fill: red;"/>' +
		'<radial-gradient style="stroke: red;"/>' +
		'</defs>' +
		'<symbol id="foo" viewBox="0 0 100 100"><path style="fill: red;"/></symbol>' +
		'<symbol id="bar" viewBox="0 0 200 200"><rect style="stroke: red;"/></symbol>' +
		'</svg>';

	t.is(store.toString(), expected);
});
