function removeQuotes(str: string): string {
  if ((str.startsWith('\'') && str.endsWith('\'')) || (str.startsWith('"') && str.endsWith('"'))) {
    return str.substring(1, str.length - 1);
  }

  return str;
}

/**
 *
 * @param {string} line Line without comment
 */
export function checkKeyValue(line: string): object {
  const lineObject: any = {};

  if (line.match(/\s/)) {
    // Check key value
    lineObject.isKeyOnly = false;

    const lineParts = line.split(/\s/);
    lineObject.key = removeQuotes(lineParts[0]);
    lineObject.value = removeQuotes(line.replace(lineParts[0], '').trim());
  } else {
    // key only
    lineObject.isKeyOnly = true;
    lineObject.key = line;
  }

  return lineObject;
}
