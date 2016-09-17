/**
 * Utility for cloning an <svg/> as a <symbol/> within
 * the composition of svgstore output.
 */
'use strict';

var union = require('./union');

var DEFAULT_ATTRS_TO_COPY = [
  'viewBox',
  'aria-labelledby',
  'role'
];

var TEMPLATE_SYMBOL = '<symbol/>';
var SELECTOR_SVG = 'svg';


/**
 *  Make sure the symbol carries over the proper attributes on the original `<svg>`
 */
function copySymbolAttributes(customSymbolAttrs, symbol, originalSVG) {
	var customAttrs = Array.isArray(customSymbolAttrs) ? customSymbolAttrs : [];
	var attributesToCopy = union(DEFAULT_ATTRS_TO_COPY, customAttrs);
	
	for (var i = 0; i < attributesToCopy.length; i++) {
		var attrName = attributesToCopy[i];
		var attrValue = originalSVG.attr(attrName);

		if (typeof attrValue !== 'undefined' && attrValue !== null) {
			symbol.attr(attrName, attrValue);
		}
	}
}

/**
 * @param {string} id The id to be applied to the symbol tag
 * @param {string} loadedChild An object created by loading the content of the current file via the cheerio#load function.
 * @param {object} options for parsing the svg content
 * @return {object} symbol The final cheerio-aware object created by cloning the SVG contents
 * @see <a href="https://github.com/cheeriojs/cheerio">The Cheerio Project</a>
 */
function svgToSymbol(id, loadedChild, symbolAttrsToCopy) {
	var svgElem = loadedChild(SELECTOR_SVG);

	// initialize a new <symbol> element
	var symbol = loadedChild(TEMPLATE_SYMBOL);
	symbol.attr('id', id);

	copySymbolAttributes(symbolAttrsToCopy, symbol, svgElem);

	// Finally, append the contents of the `svgElem` to the symbol
	symbol.append(svgElem.contents());

	return symbol;
}

module.exports = svgToSymbol;
