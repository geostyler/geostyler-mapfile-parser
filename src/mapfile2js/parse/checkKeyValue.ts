function removeQuotes(str: string): string {
  if (/^['"].+['"]$/.test(str)) {
    return str.substring(1, str.length - 1);
  }

  return str;
}

export interface KeyValueLineObject {
  isKeyOnly: boolean;
  key: string;
  value: string;
}

/**
 *
 * @param {string} line Line without comment
 */
export function checkKeyValue(line: string): KeyValueLineObject {
  const lineObject: KeyValueLineObject = {
    isKeyOnly: false,
    key: '',
    value: ''
  };

  if (line.match(/\s/)) {
    // Check key value
    lineObject.isKeyOnly = false;

    const lineParts = line.split(/\s/);

    const key = removeQuotes(lineParts[0]);
    lineObject.key = key;
    const value = line.replace(lineParts[0], '').trim();
    // do not mess with expressions, quotes have meaning
    lineObject.value = key.toUpperCase() === 'EXPRESSION'
      ? value
      : removeQuotes(value);
  } else {
    // key only
    lineObject.isKeyOnly = true;
    lineObject.key = line;
  }

  return lineObject;
}
