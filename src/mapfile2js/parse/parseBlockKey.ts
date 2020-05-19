import { LineObject } from '../parse';

// there can be multiple layer, class and style block siblings
const multiBlockKeys = { layer: 'layers', class: 'classes', label: 'labels', style: 'styles', symbol: 'symbols' };
// some blocks are actually just an array
const arrayBlockKeys = ['points'];

/**
 * Parse block keys.
 * @param {LineObject} lineObject Line Object
 * @param {number} index Current lines index
 * @param {array} lines Array of line strings
 * @param {array} blocks Block stack
 */
export function parseBlockKey(lineObject: LineObject, index: number, currentBlock: any): object | undefined {
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
  if (lineObject.key in multiBlockKeys) {
    const pluralKey = multiBlockKeys[lineObject.key];
    if (!(pluralKey in currentBlock)) {
      // add list
      currentBlock[pluralKey] = [];
    }
    // add block to list
    currentBlock[pluralKey].push({});

    // return new block
    return currentBlock[pluralKey][currentBlock[pluralKey].length - 1];
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
