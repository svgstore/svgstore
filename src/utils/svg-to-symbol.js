/**
 * Utility for cloning an <svg/> as a <symbol/> within
 * the composition of svgstore output.
 */

'use strict';

var SELECTOR_SVG = 'svg';
var TEMPLATE_SYMBOL = '<symbol/>';
var ATTRIBUTE_ID = 'id';

/**
 * @param {string} id The id to be applied to the symbol tag
 * @param {string} child An object created by loading the content of the current file via the cheerio#load function.
 * @param {object} options for parsing the svg content
 * @return {object} symbol The final cheerio-aware object created by cloning the SVG contents
 * @see <a href="https://github.com/cheeriojs/cheerio">The Cheerio Project</a>
 */
function svgToSymbol(id, child, options) {
	var svgElem = child(SELECTOR_SVG);

	// initialize a new <symbol> element
	var symbol = child(TEMPLATE_SYMBOL);
	symbol.attr(ATTRIBUTE_ID, id);
	symbol.append(svgElem.contents());

	return symbol;
}

module.exports = svgToSymbol;
