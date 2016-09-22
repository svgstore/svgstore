/**
 * Utility function to set the attributes of an element. Allows values to be
 * passed as functions so existing values may be manipulated or left untouched.
 */

'use strict';

function setAttributes(el, attrHash) {
	if (!attrHash || typeof attrHash !== 'object') {
		return el;
	}

	Object.keys(attrHash).forEach(function (attr) {
		var value = attrHash[attr];

		// Handle function values directly as cherrio passes an unhelpful index
		// as the first argument in the native function handler.
		if (typeof value === 'function') {
			value = value(el.attr(attr));
		}

		el.attr(attr, value);
	});

	return el;
}

module.exports = setAttributes;
