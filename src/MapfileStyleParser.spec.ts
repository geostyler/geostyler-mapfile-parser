import * as fs from 'fs';
import MapfileStyleParser from './MapfileStyleParser';

import point_simple_point from '../data/styles/point_simple_point';
/* import point_simple_point_many_classes_filters from '../data/styles/point_simple_point_many_classes_filters';
import point_st_sample_point_style_tags from '../data/styles/point_st_sample_point_style_tags';
import point_st_sample_point_style_tags_single_filter_list from '../data/styles/point_st_sample_point_style_tags_single_filter_list';
import point_st_sample_point_style_tags_single_filter_regex from '../data/styles/point_st_sample_point_style_tags_single_filter_regex';
*/
import line_simple_line from '../data/styles/line_simple_line';
import polygon_simple_polygon from '../data/styles/polygon_simple_polygon';
import raster_simple_raster from '../data/styles/raster_simple_raster';

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

    it('can read a simple MapFile PointSymbolizer', async () => {
      expect.assertions(2);
      const mapfile = fs.readFileSync('./data/mapfiles//point_simple_point.map', 'utf8');
      const geoStylerStyle = await styleParser.readStyle(mapfile);
      expect(geoStylerStyle).toBeDefined();
      expect(geoStylerStyle).toEqual(point_simple_point);
    });

    it('can read a simple MapFile LineSymbolizer', async () => {
      expect.assertions(2);
      const mapfile = fs.readFileSync('./data/mapfiles/line_simple_line.map', 'utf8');
      const geoStylerStyle = await styleParser.readStyle(mapfile);
      expect(geoStylerStyle).toBeDefined();
      expect(geoStylerStyle).toEqual(line_simple_line);
    });

    it('can read a simple MapFile PolygonSymbolizer', async () => {
      expect.assertions(2);
      const mapfile = fs.readFileSync( './data/mapfiles/polygon_simple_polygon.map', 'utf8');
      const geoStylerStyle = await styleParser.readStyle(mapfile);
      expect(geoStylerStyle).toBeDefined();
      expect(geoStylerStyle).toEqual(polygon_simple_polygon);
    });

    it('can read a simple MapFile RasterSymbolizer', async () => {
      expect.assertions(2);
      const mapfile = fs.readFileSync( './data/mapfiles/raster_simple_raster.map', 'utf8');
      const geoStylerStyle = await styleParser.readStyle(mapfile);
      expect(geoStylerStyle).toBeDefined();
      expect(geoStylerStyle).toEqual(raster_simple_raster);
    });
/*
    it('can read a simple MapFile PointSymbolizer with many classes', async () => {
      expect.assertions(2);
      const mapfile = fs.readFileSync('./data/mapfiles//point_simple_point_many_classes_filters.map', 'utf8');
      const geoStylerStyle = await styleParser.readStyle(mapfile);
      expect(geoStylerStyle).toBeDefined();
      expect(geoStylerStyle).toEqual(point_simple_point_many_classes_filters);
    });

    it('can read a simple sample MapFile PointSymbolizer with style tags', async () => {
      expect.assertions(2);
      const mapfile = fs.readFileSync( './data/mapfiles/point_st_sample_point_style_tags.map', 'utf8');
      const geoStylerStyle = await styleParser.readStyle(mapfile);
      expect(geoStylerStyle).toBeDefined();
      expect(geoStylerStyle).toEqual(point_st_sample_point_style_tags);
    });

    it('can read a simple MapFile PointSymbolizer with filter list', async () => {
      expect.assertions(2);
      const mapfile = fs.readFileSync('./data/mapfiles/point_st_sample_point_style_tags_single_filter_list.map', 'utf8');
      const geoStylerStyle = await styleParser.readStyle(mapfile);
      expect(geoStylerStyle).toBeDefined();
      expect(geoStylerStyle).toEqual(point_st_sample_point_style_tags_single_filter_list);
    });

    it('can read a simple MapFile PointSymbolizer with filter regex', async () => {
      expect.assertions(2);
      const mapfile = fs.readFileSync('./data/mapfiles/point_st_sample_point_style_tags_single_filter_regex.map', 'utf8');
      const geoStylerStyle = await styleParser.readStyle(mapfile);
      expect(geoStylerStyle).toBeDefined();
      expect(geoStylerStyle).toEqual(point_st_sample_point_style_tags_single_filter_regex);
    }); */
   });

  describe('#writeStyle', () => {
    it('is defined', () => {
      expect(styleParser.writeStyle).toBeDefined();
    });
  });

});
