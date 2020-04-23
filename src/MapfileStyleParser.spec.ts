import * as fs from 'fs';
import MapfileStyleParser from './MapfileStyleParser';
import { Style } from 'geostyler-style';

import point_simplepoint from '../data/styles/point_simplepoint';
import line_simpleline from '../data/styles/line_simpleline';
import polygon_simplepolygon from '../data/styles/polygon_simplepolygon';

it('MapfileStyleParser is defined', () => {
  expect(MapfileStyleParser).toBeDefined();
});

describe('MapfileStyleParser implements StyleParser', () => {
  let styleParser: MapfileStyleParser;

  beforeEach(() => {
    styleParser = new MapfileStyleParser();
  });

  describe('#readStyle', () => {
    it('is defined', () => {
      expect(styleParser.readStyle).toBeDefined();
    });

    it('can read a simple MapFile PointSymbolizer', () => {
      expect.assertions(2);
      const mapfile = fs.readFileSync('./data/mapfiles//point_simple_point.map', 'utf8');
      return styleParser.readStyle(mapfile)
        .then((geoStylerStyle: Style) => {
          expect(geoStylerStyle).toBeDefined();
          expect(geoStylerStyle).toEqual(point_simplepoint);
      });
    });

    it('can read a simple MapFile LineSymbolizer', () => {
      expect.assertions(2);
      const mapfile = fs.readFileSync('./data/mapfiles/line_simple_line.map', 'utf8');
      return styleParser.readStyle(mapfile)
        .then((geoStylerStyle: Style) => {
          expect(geoStylerStyle).toBeDefined();
          expect(geoStylerStyle).toEqual(line_simpleline);
      });
    });

    it('can read a simple MapFile PolygonSymbolizer', () => {
      expect.assertions(2);
      const mapfile = fs.readFileSync( './data/mapfiles/polygon_simple_polygon.map', 'utf8');
      return styleParser.readStyle(mapfile)
        .then((geoStylerStyle: Style) => {
          expect(geoStylerStyle).toBeDefined();
          expect(geoStylerStyle).toEqual(polygon_simplepolygon);
      });
    });
  });

  describe('#writeStyle', () => {
    it('is defined', () => {
      expect(styleParser.writeStyle).toBeDefined();
    });
  });

});
