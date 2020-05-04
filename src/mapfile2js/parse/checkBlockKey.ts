import { KeyValueLineObject } from './checkKeyValue';


interface BlockObject {
  isBlockKey: boolean;
  isBlockLine: boolean;
}

/**
 *
 * @param {object} lineObject
 * @returns {object} line object.
 */
export function checkBlockKey(lineObject: KeyValueLineObject): BlockObject {
  const lo: BlockObject = {
    isBlockKey: false,
    isBlockLine: false
  };

  if (lineObject.isKeyOnly) {
    // END is no block
    if (lineObject.key.toUpperCase() !== 'END') {
      // value of PROJECTION block is no block
      if (!lineObject.key.toLowerCase().includes('init=')) {
        lo.isBlockKey = true;
      }
    }
  } else {
    // if block is in a single line like
    // PATTERN 10 10 END
    if (lineObject.value) {
      if (lineObject.value.toUpperCase().endsWith(' END')) {
        lo.isBlockKey = true;
        lo.isBlockLine = true;
      }
    }
  }

  return lo;
}
