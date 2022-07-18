const { Resvg } = require('@resvg/resvg-js');

function getSvgRect(svg) {
  const { width, height } = new Resvg(svg, {
    logLevel: 'error',
    font: { loadSystemFonts: false },
  });
  return { width, height };
}

module.exports = getSvgRect;
