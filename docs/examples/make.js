'use strict';

var svgstore = require('../../src/svgstore');
var fs = require('fs');

var sprites = svgstore({ fragmentIdentifier: (id) => `view-${id}` })
	.add('unicorn', fs.readFileSync('./assets/unicorn.svg', 'utf8'))
	.add('rainbow', fs.readFileSync('./assets/rainbow.svg', 'utf8'));

fs.writeFileSync('./sprites.svg', sprites);
