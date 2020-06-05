import { Style } from 'geostyler-style';

const rasterStyle: Style = {
  'name': 'raster_tileindex_token',
  'rules': [{
    'name': 'Test raster',
    'symbolizers': [{
      'kind': 'Raster',
      'opacity': 0.5,
    }]
  }]
};

export default rasterStyle;
