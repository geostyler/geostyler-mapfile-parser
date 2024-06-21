import logger from '@terrestris/base-util/dist/Logger';
import { LineObject } from '../parseMapfile';

// there can be multiple layer, class and style block siblings
const multiBlockKeys = {
  layer: 'layers',
  class: 'classes',
  label: 'labels',
  style: 'styles',
  symbol: 'symbols',
  outputformat: 'outputformats',
  formatoption: 'formatoptions',
  include: 'includes',
  processing: 'processings',
};

/**
 * Parse block keys.
 * @param {LineObject} lineObject Line Object
 * @param {array} lines Array of line strings
 * @param {array} blocks Block stack
 */
export function parseBlockKey(lineObject: LineObject, currentBlock: any): Record<string, unknown> | undefined {
  // test for unhadled block lines
  if (lineObject.isBlockLine) {
    logger.error(`Not able to deal with the following Block line: ${lineObject.content}`);
    return;
  }

  // handle multi block keys
  if (lineObject.key in multiBlockKeys) {
    // @ts-expect-error TODO fix index typing
    const pluralKey = multiBlockKeys[lineObject.key];
    if (!(pluralKey in currentBlock)) {
      currentBlock[pluralKey] = []; // add list
    }
    if (lineObject.isBlockKey) {
      currentBlock[pluralKey].push({}); // add block to list
      return currentBlock[pluralKey][currentBlock[pluralKey].length - 1]; // return new block
    } else {
      currentBlock[pluralKey].push(lineObject.value); // list key value
      return undefined;
    }
  } else {
    // check for duplicate block key
    // @ts-expect-error TODO fix index typing
    if (lineObject.key in currentBlock || multiBlockKeys[lineObject.key] in currentBlock) {
      logger.error(`Overwriting block! Add '${lineObject.key}' to multi block keys!`);
    }
    // create block
    currentBlock[lineObject.key] = {};
    // return new block
    return currentBlock[lineObject.key];
  }
}
