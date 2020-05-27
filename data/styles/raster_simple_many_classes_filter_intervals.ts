import { Style } from 'geostyler-style';

const rasterStyle: Style = {
  name: 'raster_simple_many_classes_filter_intervals',
  rules: [{
    name: 'Test raster',
    symbolizers: [{
      kind: 'Raster',
      colorMap: {
        type: 'intervals',
        colorMapEntries: [{
          color: '#00FF00',
          quantity: 100,
          opacity: 1
        }, {
          color: '#0000FF',
          quantity: 200,
          opacity: 1
        }]
      },
    }]
  }]
};

export default rasterStyle;
