import * as fs from 'fs';

import { parseMapfile } from "./parseMapfile";

describe('parseMapfile', () => {
    it('is defined', () => {
        expect(parseMapfile).toBeDefined();
    });
    // it('can parse this', () => {
    //     const pathToMapfile = 'data/mapfiles/ch.swisstopo.swissboundaries3d-gemeinde-flaeche.fill.map'
    //     const mapfile = parseMapfile(fs.readFileSync(pathToMapfile, 'utf8'));
    //     //console.log(JSON.stringify(mapfile, null, 2));
    //     expect(mapfile).toEqual(expect.anything());
    // });
});