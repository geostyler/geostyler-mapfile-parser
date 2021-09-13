/* eslint-disable camelcase */
import * as fs from 'fs';
import MapfileStyleParser from './MapfileStyleParser';

import { ComparisonFilter, Filter } from 'geostyler-style';

import point_simple_point from '../data/styles/point_simple_point';
import line_simple_line from '../data/styles/line_simple_line';
import polygon_simple_polygon from '../data/styles/polygon_simple_polygon';
import raster_simple_raster from '../data/styles/raster_simple_raster';

import point_simple_rgb_to_hex from '../data/styles/point_simple_rgb_to_hex';
import point_simple_label from '../data/styles/point_simple_label';
import point_simple_many_classes_filters from '../data/styles/point_simple_many_classes_filters';
import point_scale from '../data/styles/point_scale';
import point_st_sample_style_tags from '../data/styles/point_st_sample_style_tags';
// eslint-disable-next-line max-len
import point_st_sample_style_tags_single_filter_list from '../data/styles/point_st_sample_style_tags_single_filter_list';
// eslint-disable-next-line max-len
import point_st_sample_style_tags_single_filter_regex from '../data/styles/point_st_sample_style_tags_single_filter_regex';

// import raster_simple_many_classes_filter_intervals from '../data/styles/raster_simple_many_classes_filter_intervals';
// import raster_simple_many_classes_filter_values from '../data/styles/raster_simple_many_classes_filter_values';
// import raster_simple_many_classes_filter_ramp from '../data/styles/raster_simple_many_classes_filter_ramp';
import raster_rgbrange_to_hexarray from '../data/styles/raster_rgbrange_to_hexarray';
import raster_resampling_average from '../data/styles/raster_resampling_average';
import raster_resampling_bilinear from '../data/styles/raster_resampling_bilinear';
import raster_resampling_nearest from '../data/styles/raster_resampling_nearest';
import line_set_of_expressions from '../data/styles/line_set_of_expressions';
import point_symbol_style_in_label from '../data/styles/point_symbol_style_in_label';


it('MapfileStyleParser is defined', () => {
  expect(MapfileStyleParser).toBeDefined();
});

describe('MapfileStyleParser implements StyleParser', () => {
  let styleParser: MapfileStyleParser;

  beforeEach(() => {
    styleParser = new MapfileStyleParser();
    styleParser.symbolsPath = './data/mapfiles/symbols.sym';
  });

  describe('#readStyle', () => {
    it('is defined', () => {
      expect(styleParser.readStyle).toBeDefined();
    });

    it('can read a simple MapFile PointSymbolizer', async () => {
      expect.assertions(2);
      const mapfile = fs.readFileSync('./data/mapfiles/point_simple_point.map', 'utf8');
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

    it('can convert a RGB color to hexdecimal format', async () => {
      expect.assertions(2);
      const mapfile = fs.readFileSync('./data/mapfiles/point_simple_rgb_to_hex.map', 'utf8');
      const geoStylerStyle = await styleParser.readStyle(mapfile);
      expect(geoStylerStyle).toBeDefined();
      expect(geoStylerStyle).toEqual(point_simple_rgb_to_hex);
    });

    it('can read a simple MapFile Label', async () => {
      expect.assertions(2);
      const mapfile = fs.readFileSync( './data/mapfiles/point_simple_label.map', 'utf8');
      const geoStylerStyles = await styleParser.readStyle(mapfile);
      expect(geoStylerStyles).toBeDefined();
      expect(geoStylerStyles).toEqual(point_simple_label);
    });

    it('can read a Point MapFile with scales', async () => {
      expect.assertions(2);
      const mapfile = fs.readFileSync( './data/mapfiles/point_scale.map', 'utf8'); // Two layers !
      const geoStylerStyles = await styleParser.readMultiStyles(mapfile);
      expect(geoStylerStyles).toBeDefined();
      expect(geoStylerStyles).toEqual(point_scale);
    });

    it('can read a PointSymbolizer with style tags', async () => {
      expect.assertions(2);
      const mapfile = fs.readFileSync( './data/mapfiles/point_st_sample_style_tags.map', 'utf8');
      const geoStylerStyle = await styleParser.readStyle(mapfile);
      expect(geoStylerStyle).toBeDefined();
      expect(geoStylerStyle).toEqual(point_st_sample_style_tags);
    });

    it('can read a simple MapFile PointSymbolizer with many classes', async () => {
      expect.assertions(2);
      const mapfile = fs.readFileSync('./data/mapfiles/point_simple_many_classes_filters.map', 'utf8');
      const geoStylerStyle = await styleParser.readStyle(mapfile);
      expect(geoStylerStyle).toBeDefined();
      expect(geoStylerStyle).toEqual(point_simple_many_classes_filters);
    });

    it('can read a simple sample MapFile PointSymbolizer with style tags', async () => {
      expect.assertions(2);
      const mapfile = fs.readFileSync( './data/mapfiles/point_st_sample_style_tags.map', 'utf8');
      const geoStylerStyle = await styleParser.readStyle(mapfile);
      expect(geoStylerStyle).toBeDefined();
      expect(geoStylerStyle).toEqual(point_st_sample_style_tags);
    });

    it('can read a simple MapFile PointSymbolizer with filter list', async () => {
      expect.assertions(2);
      const mapfile = fs.readFileSync('./data/mapfiles/point_st_sample_style_tags_single_filter_list.map', 'utf8');
      const geoStylerStyle = await styleParser.readStyle(mapfile);
      expect(geoStylerStyle).toBeDefined();
      expect(geoStylerStyle).toEqual(point_st_sample_style_tags_single_filter_list);
    });

    it('can read a simple MapFile PointSymbolizer with filter regex', async () => {
      expect.assertions(2);
      const mapfile = fs.readFileSync('./data/mapfiles/point_st_sample_style_tags_single_filter_regex.map', 'utf8');
      const geoStylerStyle = await styleParser.readStyle(mapfile);
      expect(geoStylerStyle).toBeDefined();
      expect(geoStylerStyle).toEqual(point_st_sample_style_tags_single_filter_regex);
    });
    /*
    it('can read a simple MapFile RasterSymbolizer with many classes intervals', async () => {
      expect.assertions(2);
      const mapfile = fs.readFileSync( './data/mapfiles/raster_simple_many_classes_filter_intervals.map', 'utf8');
      const geoStylerStyle = await styleParser.readStyle(mapfile);
      expect(geoStylerStyle).toBeDefined();
      expect(geoStylerStyle).toEqual(raster_simple_many_classes_filter_intervals);
    });

    it('can read a simple MapFile RasterSymbolizer with many classes values', async () => {
      expect.assertions(2);
      const mapfile = fs.readFileSync( './data/mapfiles/raster_simple_many_classes_filter_values.map', 'utf8');
      const geoStylerStyle = await styleParser.readStyle(mapfile);
      expect(geoStylerStyle).toBeDefined();
      expect(geoStylerStyle).toEqual(raster_simple_many_classes_filter_values);
    });

    it('can read a simple MapFile RasterSymbolizer with many classes ramp', async () => {
      expect.assertions(2);
      const mapfile = fs.readFileSync( './data/mapfiles/raster_simple_many_classes_filter_ramp.map', 'utf8');
      const geoStylerStyle = await styleParser.readStyle(mapfile);
      expect(geoStylerStyle).toBeDefined();
      expect(geoStylerStyle).toEqual(raster_simple_many_classes_filter_ramp);
    });
    */
    it('can convert a RGBRGB range to hexadecimal array', async () => {
      expect.assertions(2);
      const mapfile = fs.readFileSync( './data/mapfiles/raster_rgbrange_to_hexarray.map', 'utf8');
      const geoStylerStyle = await styleParser.readStyle(mapfile);
      expect(geoStylerStyle).toBeDefined();
      expect(geoStylerStyle).toEqual(raster_rgbrange_to_hexarray);
    });

    it('can resample a simple MapFile RasterSymbolizer (average)', async () => {
      expect.assertions(2);
      const mapfile = fs.readFileSync( './data/mapfiles/raster_resampling_average.map', 'utf8');
      const geoStylerStyle = await styleParser.readStyle(mapfile);
      expect(geoStylerStyle).toBeDefined();
      expect(geoStylerStyle).toEqual(raster_resampling_average);
    });

    it('can resample a simple MapFile RasterSymbolizer (bilinear)', async () => {
      expect.assertions(2);
      const mapfile = fs.readFileSync( './data/mapfiles/raster_resampling_bilinear.map', 'utf8');
      const geoStylerStyle = await styleParser.readStyle(mapfile);
      expect(geoStylerStyle).toBeDefined();
      expect(geoStylerStyle).toEqual(raster_resampling_bilinear);
    });

    it('can resample a simple MapFile RasterSymbolizer (nearest)', async () => {
      expect.assertions(2);
      const mapfile = fs.readFileSync( './data/mapfiles/raster_resampling_nearest.map', 'utf8');
      const geoStylerStyle = await styleParser.readStyle(mapfile);
      expect(geoStylerStyle).toBeDefined();
      expect(geoStylerStyle).toEqual(raster_resampling_nearest);
    });

    it('can read a simple MapFile with several filter expressions', async () => {
      expect.assertions(2);
      const mapfile = fs.readFileSync( './data/mapfiles/line_set_of_expressions.map', 'utf8');
      const geoStylerStyle = await styleParser.readMultiStyles(mapfile);
      expect(geoStylerStyle).toBeDefined();
      expect(geoStylerStyle).toEqual(line_set_of_expressions);
    });
    it('can read a simple MapFile with symbol style in label', async () => {
      expect.assertions(2);
      const mapfile = fs.readFileSync( './data/mapfiles/point_symbol_style_in_label.map', 'utf8');
      const geoStylerStyle = await styleParser.readMultiStyles(mapfile);
      expect(geoStylerStyle).toBeDefined();
      expect(geoStylerStyle).toEqual(point_symbol_style_in_label);
    });

  });

  describe('#getFilterFromMapfileExpression', () => {
    it('is defined', () => {
      expect(styleParser.getFilterFromMapfileExpression).toBeDefined();
    });

    it('can parse simple expression', () => {
      const mapfileExpression = '( "[attribute_name]" == "string_literal" )';
      const geoStylerFilter: Filter = styleParser.getFilterFromMapfileExpression(mapfileExpression);
      expect(geoStylerFilter).toEqual(['==', 'attribute_name', 'string_literal'] as ComparisonFilter);
    });
  });

  describe('#writeStyle', () => {
    it('is defined', () => {
      expect(styleParser.writeStyle).toBeDefined();
    });
  });
});
