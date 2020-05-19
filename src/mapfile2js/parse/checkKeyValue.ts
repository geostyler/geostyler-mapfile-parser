import { LineObject } from '../parse';

function removeQuotes(str: string): string {
  if (/^['"].+['"]$/.test(str)) {
    return str.substring(1, str.length - 1);
  }

  return str;
}

/**
 *
 * @param {LineObject} lineObject Line without comment
 */
export function checkKeyValue(lineObject: LineObject): LineObject {
  if (lineObject.contentWithoutComment.match(/\s/)) {
    // Check key value
    const lineParts = lineObject.contentWithoutComment.split(/\s/);

    lineObject.key = removeQuotes(lineParts[0]).toLowerCase();

    const value = lineObject.contentWithoutComment.replace(lineParts[0], '').trim();
    // do not mess with expressions, quotes have meaning
    lineObject.value = lineObject.key.toUpperCase() === 'EXPRESSION' ? value : removeQuotes(value);
  } else {
    // key only
    lineObject.key = lineObject.contentWithoutComment.toLowerCase();
  }

  return lineObject;
}
