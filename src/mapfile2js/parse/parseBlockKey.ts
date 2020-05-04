/**
 * Parse block keys.
 * @param {Object} lineObject Line Object
 * @param {number} index Current lines index
 * @param {array} lines Array of line strings
 * @param {array} blocks Block stack
 */

// there can be multiple layer, class and style block siblings
const multiBlockKeys = ['layer', 'class', 'style', 'symbol'];
// some blocks are actually just an array
const arrayBlockKeys = ['points'];

export function parseBlockKey(lineObject: any, index: number, currentBlock: any): object | undefined {
  // can not handle block lines
  if (lineObject.isBlockLine) {
    console.error(`Not able to deal with block line yet! Block line [${index + 1}]: ${lineObject.content}`);
    return;
  }

  // work around projection imitating a block
  if (lineObject.key.toUpperCase() === 'PROJECTION') {
    return;
  }

  // handle multi block keys
  if (multiBlockKeys.includes(lineObject.key)) {
    if (!(lineObject.key in currentBlock)) {
      // add list
      currentBlock[lineObject.key] = [];
    }
    // add block to list
    currentBlock[lineObject.key].push({});

    // return new block
    return currentBlock[lineObject.key][currentBlock[lineObject.key].length - 1];
  } else if (arrayBlockKeys.includes(lineObject.key)) {
    // create array
    currentBlock[lineObject.key] = [];
    return currentBlock[lineObject.key];
  } else {
    // check for duplicate block key
    if (lineObject.key in currentBlock) {
      console.error(`Overwriting block! Add '${lineObject.key}' to multi block keys!`);
    }
    // create block
    currentBlock[lineObject.key] = {};
    // return new block
    return currentBlock[lineObject.key];
  }
}
