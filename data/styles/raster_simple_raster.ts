import { Style } from 'geostyler-style';

const rasterStyle: Style = {
  'name': 'Simple raster',
  'rules': [{
    'name': 'Test raster',
    'symbolizers': [{
      'kind': 'Raster',
      'opacity': 0.5,
    }]
  }]
};

export default rasterStyle;
