import { Style } from 'geostyler-style';

const rasterStyle: Style = {
  name: 'raster_simple_raster_many_classes_filter_ramp',
  rules: [{
    name: 'Test raster',
    symbolizers: [{
      kind: 'Raster',
      colorMap: {
        type: 'ramp',
        colorMapEntries: [{
          color: '#000000',
          quantity: 0
        }, {
          color: '#003200',
          quantity: 100,
          opacity: 1
        }, {
          color: '#003250',
          quantity: 200
        }]
      },
    }]
  }]
};

export default rasterStyle;
