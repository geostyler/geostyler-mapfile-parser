import { LineObject } from '../parseMapfile';

/**
 * Determines the depth of every line of mapfile.
 * @param {LineObject[]} lineObjects Array of line objects
 */
export function determineDepth(lineObjects: Array<LineObject>): object {
  let depth = 0;

  lineObjects.forEach((lineObject) => {
    lineObject.depth = depth;

    if (!lineObject.isBlockKey) {
      depth++;
    } else {
      if (lineObject.key) {
        if (lineObject.key.toUpperCase() === 'END') {
          depth--;
          lineObject.depth = depth;
        }
      }
    }
  });

  return lineObjects;
}
