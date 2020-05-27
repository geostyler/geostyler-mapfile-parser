import { Style } from 'geostyler-style';

const rasterStyle: Style = {
  'name': 'raster_st_sample_style_tags',
  'rules': [{
    'name': 'Test raster',
    'symbolizers': [{
      'kind': 'Raster',
      'opacity': 0.5,
    }]
  }]
};

export default rasterStyle;
