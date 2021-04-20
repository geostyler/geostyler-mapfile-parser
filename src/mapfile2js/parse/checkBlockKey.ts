import { LineObject } from '../parseMapfile';

/**
 *
 * @param {LineObject} lineObject
 * @returns {LineObject} block ckecked line object.
 */
export function checkBlockKey(lineObject: LineObject): LineObject {
  lineObject.isBlockKey = false;
  lineObject.isBlockLine = false;

  if (
    !lineObject.value &&
    lineObject.key.toUpperCase() !== 'END' && // END is no block
    !lineObject.key.toLowerCase().includes('init=') && // value of PROJECTION block is no block
    isNaN(parseInt(lineObject.key, 10)) // a single number within a line is no block
  ) {
    lineObject.isBlockKey = true;
  } else if (lineObject.value && lineObject.value.toUpperCase().endsWith(' END')) {
    lineObject.isBlockKey = true;
    lineObject.isBlockLine = true;
  }

  return lineObject;
}
