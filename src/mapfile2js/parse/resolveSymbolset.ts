import * as fs from 'fs';
import { parse } from '../parse';

let symbolset: Array<any> = [];

function substituteSymbols(obj: object): void {
  for (const property in obj) {
    if (typeof obj[property] == 'object') {
      substituteSymbols(obj[property]);
    } else if (property === 'symbol') {
      obj[property] = symbolset.find(element => element.name === obj[property]);
    } else {
      continue;
    }
  }
}

/**
 *
 * @param {object} mapfileObject Parsed Mapfile Object
 */
export function resolveSymbolset(mapfileObject: any): any {

  const symbolsetPath = mapfileObject.map.symbolset;

  if (typeof symbolsetPath !== 'string') {
    return mapfileObject;
  }
  const symbolsetContent = fs.readFileSync(symbolsetPath, 'utf-8');
  if (symbolsetContent) {
    const result = parse(symbolsetContent) as any;
    symbolset = result.symbolset.symbol;
    substituteSymbols(mapfileObject);
    return mapfileObject;
  } else {
    Error('Not able to resolve symbolset!');
  }
}

