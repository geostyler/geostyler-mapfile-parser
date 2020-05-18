import * as fs from 'fs';
import { parse } from '../parse';

let symbolset: Array<any> = [];

function substituteSymbols(obj: object): void {
  for (const property in obj) {
    if (typeof obj[property] == 'object') {
      substituteSymbols(obj[property]);
    } else if (property === 'symbol') {
      if (obj[property] !== '0') {
        // TODO: distinguish corectly between index and name reference
        const symbol = symbolset.find((element) => element.name === obj[property]);
        if (symbol) {
          obj[property] = symbol;
        } else {
          obj[property] = symbolset[parseFloat(obj[property])];
        }
      }
    }
  }
}

/**
 *
 * @param {object} mapfileObject Parsed Mapfile Object
 */
export function resolveSymbolset(mapfileObject: any): any {
  let symbolsetPath = mapfileObject.map.symbolset;

  // fallback to mapserver defaults if not specified
  if (!symbolsetPath) {
    symbolsetPath = `${__dirname}/../../../data/mapfiles/symbols.sym`;
  }

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
