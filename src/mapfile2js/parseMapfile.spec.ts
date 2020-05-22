import * as fs from 'fs';

import { parseMapfile, parseSymbolset } from './parseMapfile';

describe('parseMapfile', () => {
  it('is defined', () => {
    expect(parseMapfile).toBeDefined();
  });
  it('can parse a mapfile', () => {
    const pathToMapfile = `${__dirname}/../../data/mapfiles/mapserver.map`;
    const mapfile = parseMapfile(fs.readFileSync(pathToMapfile, 'utf8'));
    expect(mapfile).toHaveProperty('map');
  });
});

describe('parseSymbolset', () => {
  it('is defines', () => {
    expect(parseSymbolset).toBeDefined();
  });
  it('can parse a symbolset', () => {
    const pathToSymbolset = `${__dirname}/../../data/mapfiles/symbols.sym`;
    const symbolset = parseSymbolset(fs.readFileSync(pathToSymbolset, 'utf8'));
    expect(symbolset).toHaveProperty('symbols');
  });
});
