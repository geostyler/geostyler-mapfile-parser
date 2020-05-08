import { Style } from 'geostyler-style';

const rasterStyle: Style = {
  'name': 'raster_simple_raster',
  'rules': [{
    'name': 'Test raster',
    'symbolizers': [{
      'kind': 'Raster',
      'opacity': 0.5,
    }]
  }]
};

export default rasterStyle;
