import { Style } from 'geostyler-style';

const rasterStyle: Style = {
  'name': 'raster_resampling_nearest',
  'rules': [{
    'name': 'Test raster',
    'symbolizers': [{
      'kind': 'Raster',
      'opacity': 1.0,
      'resampling': 'nearest'
    }]
  }]
};

export default rasterStyle;
