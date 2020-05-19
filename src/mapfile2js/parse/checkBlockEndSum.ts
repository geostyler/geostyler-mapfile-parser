import { LineObject } from '../parse';

/**
 *
 * @param {LineObject[]} lines Array of line objects
 */
export function checkBlockEndSum(lines: LineObject[]): void {
  let blockCounter = 0;
  let endCounter = 0;

  lines.forEach((line) => {
    if (line.isBlockLine) {
      blockCounter++;
      endCounter++;
    } else {
      if (line.isBlockKey) {
        blockCounter++;
      } else {
        if (line.key) {
          if (line.key.toUpperCase() === 'END') {
            endCounter++;
          }
        }
      }
    }
  });

  if (blockCounter !== endCounter) {
    if (blockCounter < endCounter) {
      throw new Error(`Too many ends (blocks: ${blockCounter}, ends: ${endCounter}).`);
    } else {
      throw new Error(`Too few ends (blocks: ${blockCounter}, ends: ${endCounter}).`);
    }
  }
}
