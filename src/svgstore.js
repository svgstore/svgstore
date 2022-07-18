'use strict';

var copyAttributes = require('./utils/copy-attributes');
var loadXml = require('./utils/load-xml');
var removeAttributes = require('./utils/remove-attributes');
var setAttributes = require('./utils/set-attributes');
var svgToSymbol = require('./utils/svg-to-symbol');
var getSvgRect = require('./utils/get-svg-rect');

var SELECTOR_SVG = 'svg';
var SELECTOR_DEFS = 'defs';

var TEMPLATE_SVG = '<svg><defs/></svg>';
var TEMPLATE_DOCTYPE =
	'<?xml version="1.0" encoding="UTF-8"?>' +
	'<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" ' +
	'"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';

var DEFAULT_OPTIONS = {
	cleanDefs: false,
	cleanSymbols: false,
	inline: false,
	svgAttrs: false,
	symbolAttrs: false,
	copyAttrs: false,
	renameDefs: false,
	fragmentIdentifier: null,
};

function svgstore(options) {
	var svgstoreOptions = Object.assign({}, DEFAULT_OPTIONS, options);

	// <svg>
	var parent = loadXml(TEMPLATE_SVG);
	var parentSvg = parent(SELECTOR_SVG);
	var parentDefs = parent(SELECTOR_DEFS);

	let currentY = 0;

	return {
		element: parent,

		add: function (id, file, options) {
			var child = loadXml(file);
			var addOptions = Object.assign({}, svgstoreOptions, options);

			// <defs>
			var childDefs = child(SELECTOR_DEFS);

			removeAttributes(childDefs, addOptions.cleanDefs);

			/* rename defs ids */
			if (addOptions.renameDefs) {
				childDefs.children().each(function (i, _elem) {
					var elem = child(_elem);
					var oldDefId = elem.attr('id');
					var newDefId = id + '_' + oldDefId;
					elem.attr('id', newDefId);

					/* process use tags */
					child('use').each(function (i, use) {
						var hrefLink = '#' + oldDefId;
						var checkableProperties = ['xlink:href', 'href'];
						var foundProperty;
						for (var j = 0; j < checkableProperties.length; j++) {
							var currentProperty = checkableProperties[j];
							if (child(use).prop(currentProperty) === hrefLink) {
								foundProperty = currentProperty;
								break;
							}
						}
						if (!foundProperty) {
							return;
						}
						child(use).attr(foundProperty, '#' + newDefId);
					});

					/* process fill attributes */
					child('[fill="url(#' + oldDefId + ')"]').each(function (
						i,
						use
					) {
						child(use).attr('fill', 'url(#' + newDefId + ')');
					});
				});
			}

			parentDefs.append(childDefs.contents());
			childDefs.remove();

			// <symbol>
			var childSvg = child(SELECTOR_SVG);
			var childSymbol = svgToSymbol(id, child, addOptions);

			removeAttributes(childSymbol, addOptions.cleanSymbols);
			copyAttributes(childSymbol, childSvg, addOptions.copyAttrs);
			setAttributes(childSymbol, addOptions.symbolAttrs);
			parentSvg.append(childSymbol);

			if (typeof svgstoreOptions.fragmentIdentifier === 'function') {
				const { width, height } = getSvgRect(file);
				const childView = child('<view/>');
				childView.attr('id', svgstoreOptions.fragmentIdentifier(id));
				childView.attr('viewBox', `0 ${currentY} ${width} ${height}`);
				const childUse = child('<use/>');
				childUse.attr('xlink:href', `#${id}`);
				childUse.attr('width', width);
				childUse.attr('height', height);
				childUse.attr('x', 0);
				childUse.attr('y', currentY);
				currentY += height;
				parentSvg.append(childView);
				parentSvg.append(childUse);
			}

			return this;
		},

		toString: function (options) {
			// Create a clone so we don't modify the parent document.
			var clone = loadXml(parent.xml());
			var toStringOptions = Object.assign({}, svgstoreOptions, options);

			// <svg>
			var svg = clone(SELECTOR_SVG);

			setAttributes(svg, toStringOptions.svgAttrs);

			// output inline
			if (toStringOptions.inline) {
				return clone.xml();
			}

			// output standalone
			svg.attr('xmlns', function (val) {
				return val || 'http://www.w3.org/2000/svg';
			});

			svg.attr('xmlns:xlink', function (val) {
				return val || 'http://www.w3.org/1999/xlink';
			});

			return TEMPLATE_DOCTYPE + clone.xml();
		},
	};
}

module.exports = svgstore;
