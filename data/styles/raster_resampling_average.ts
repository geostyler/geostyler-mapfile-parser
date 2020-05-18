import { Style } from 'geostyler-style';

const rasterStyle: Style = {
  'name': 'raster_simple_raster',
  'rules': [{
    'name': 'Test raster',
    'symbolizers': [{
      'kind': 'Raster',
      'opacity': 1.0,
      'resampling': 'linear'
    }]
  }]
};

export default rasterStyle;
