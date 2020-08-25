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
        // TODO: distinguish corectly between index and name reference
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
 * @param {Mapfile} mapfile Parsed Mapfile Object
 * @param {string} symbolsPath optional path of the symbols.sym file if no symbolset is defined in the Mapfile.
 */
export function resolveSymbolset(mapfile: Mapfile, symbolsPath?: string): Mapfile {
  let symbolsetPath = mapfile.map.symbolset;

  if (!symbolsetPath) {
    // Fallback to load the symbols file. Search "mapfile-symbols-path=" in the process args
    // (command line options).
    const processArgs = process.argv.slice(2);
    symbolsetPath = processArgs.find(arg => arg.search('mapfile-symbols-path=') === 0);
  }

  if (!symbolsetPath) {
    // Second fallback to the symbols file. Use the given symbolsPath value.
    symbolsetPath = symbolsPath;
  }
  
  if (!symbolsetPath || !fs.existsSync(symbolsetPath)) {
    console.error(`Non existent symbolset path: ${symbolsetPath}`);
    return mapfile;
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
