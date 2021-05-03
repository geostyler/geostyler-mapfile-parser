import * as fs from 'fs';
import { parseSymbolset } from '../parseMapfile';
import { MapfileSymbol, Mapfile, MapfileClass, MapfileLayer, MapfileStyle } from '../mapfileTypes';
import { parse } from 'path';

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
 * Parses the Mapfile data if it contains single SYMBOL tags and replaces the name with the filename within the
 * symbol tag
 *
 * @param {Mapfile} mapfile Parsed Mapfile Object
 */
export function resolveSymbolsFromMapfile(mapfile: Mapfile): Mapfile {
  const symbols = mapfile.map.symbols;

  if (mapfile.map.layers) {
    mapfile.map.layers.forEach((layer: MapfileLayer) => {
      if (layer.classes) {
        layer.classes.forEach((mclass: MapfileClass) => {
          if (mclass.styles) {
            const styles: MapfileStyle[] = mclass.styles;
            styles.forEach((style: MapfileStyle) => {
              if (style.symbol) {
                symbols.forEach((symbol: any) => {
                  if (
                    symbol.name && symbol.image && symbol.name === style.symbol
                  ) {
                    style.symbol = (parse(symbol.image)
                      .base as unknown) as MapfileSymbol;
                  }
                });
              }
            });
          }
        });
      }
    });
  }
  return mapfile;
}

/**
 * @param {Mapfile} mapfile Parsed Mapfile Object
 * @param {string} symbolsPath optional path of the symbols.sym file if no symbolset is defined in the Mapfile.
 */
export function resolveSymbolset(mapfile: Mapfile, symbolsPath?: string): Mapfile {
  let symbolsetPath = mapfile.map.symbolset;
  let symbolsetFrom = 'MapFile SYMBOLSET tag';

  // if no SYMBOLSET is specified, but the Mapfile contains single SYMBOL tags
  if (!symbolsetPath && mapfile.map.symbols) {
    return resolveSymbolsFromMapfile(mapfile);
  }

  if (!symbolsetPath) {
    // Fallback to load the symbols file. Search "mapfile-symbols-path=" in the process args
    // (command line options).
    const processArgs = process.argv.slice(2);
    symbolsetPath = processArgs.find(arg => arg.search('mapfile-symbols-path=') === 0);
    symbolsetFrom = 'command line argument';
  }

  if (!symbolsetPath) {
    // Second fallback to the symbols file. Use the given symbolsPath value.
    symbolsetPath = symbolsPath;
    symbolsetFrom = 'the "symbolsPath" configuration of the parser.';
  }
  
  if (!symbolsetPath) {
    console.error('No symbolset path defined.');
    return mapfile;
  }

  if (!fs.existsSync(symbolsetPath)) {
    console.error(`No file found for symbolset path: ${symbolsetPath} (path taken from ${symbolsetFrom})`);
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
