import { Style } from 'geostyler-style';

const rasterStyle: Style = {
  name: 'raster_simple_many_classes_filter_values',
  rules: [{
    name: 'Test raster',
    symbolizers: [{
      kind: 'Raster',
      colorMap: {
        type: 'values',
        colorMapEntries: [{
          color: '#00FF00',
          quantity: 0,
          opacity: 1
        }, {
          color: '#0000FF',
          quantity: 1,
          opacity: 1
        }]
      },
    }]
  }]
};

export default rasterStyle;
