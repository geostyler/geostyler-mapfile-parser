import { LineObject } from '../parseMapfile';

// there can be multiple layer, class and style block siblings
const multiBlockKeys = {
  layer: 'layers',
  class: 'classes',
  label: 'labels',
  style: 'styles',
  symbol: 'symbols',
};

/**
 * Parse block keys.
 * @param {LineObject} lineObject Line Object
 * @param {array} lines Array of line strings
 * @param {array} blocks Block stack
 */
export function parseBlockKey(lineObject: LineObject, currentBlock: any): object | undefined {
  // handle block lines
  if (lineObject.isBlockLine) {
    console.error(`Not able to deal with the following Block line: ${lineObject.content}`);
    return;
  }

  // handle multi block keys
  if (lineObject.key in multiBlockKeys) {
    const pluralKey = multiBlockKeys[lineObject.key];
    if (!(pluralKey in currentBlock)) {
      currentBlock[pluralKey] = []; // add list
    }
    // add block to list
    currentBlock[pluralKey].push({});
    // return new block
    return currentBlock[pluralKey][currentBlock[pluralKey].length - 1];
  } else {
    // check for duplicate block key
    if (lineObject.key in currentBlock || multiBlockKeys[lineObject.key] in currentBlock) {
      console.error(`Overwriting block! Add '${lineObject.key}' to multi block keys!`);
    }
    // create block
    currentBlock[lineObject.key] = {};
    // return new block
    return currentBlock[lineObject.key];
  }
}
