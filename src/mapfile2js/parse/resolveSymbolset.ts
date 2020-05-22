import * as fs from 'fs';
import { parseSymbolset } from '../parseMapfile';
import { MapfileSymbol, Mapfile } from '../mapfileTypes';

let mapfileSymbols: Array<MapfileSymbol>;

function substituteSymbols(obj: any): void {
  for (const property in obj) {
    if (typeof obj[property] == 'object') {
      substituteSymbols(obj[property]);
    } else if (property === 'symbol') {
      if (obj[property] === '0') {
        // eslint-disable-next-line id-blacklist
        obj[property] = undefined;
      } else {
        // TODO: distinguish corectly betwen index and name reference
        const symbol = mapfileSymbols.find((element) => element.name === obj[property]);
        if (symbol) {
          obj[property] = symbol;
        } else {
          obj[property] = mapfileSymbols[parseFloat(obj[property])];
        }
      }
    }
  }
}

/**
 *
 * @param {Mapfile} mapfile Parsed Mapfile Object
 */
export function resolveSymbolset(mapfile: Mapfile): Mapfile {
  let symbolsetPath = mapfile.map.symbolset;

  // fallback to mapserver defaults if not specified
  if (!symbolsetPath) {
    symbolsetPath = `${__dirname}/../../../data/mapfiles/symbols.sym`;
  } else if (!fs.existsSync(symbolsetPath)) {
    console.error(`Non existent symbolset path: ${symbolsetPath}`);
    symbolsetPath = `${__dirname}/../../../data/mapfiles/symbols.sym`;
  }

  // resolve symbolset
  const symbolsetContent = fs.readFileSync(symbolsetPath, 'utf-8');
  if (symbolsetContent) {
    const mapfileSymbolset = parseSymbolset(symbolsetContent);
    mapfileSymbols = mapfileSymbolset.symbols;
    substituteSymbols(mapfile);
  } else {
    Error('Not able to resolve symbolset!');
  }
  return mapfile;
}
