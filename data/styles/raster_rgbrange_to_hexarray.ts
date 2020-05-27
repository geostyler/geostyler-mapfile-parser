import { Style } from 'geostyler-style';

const rasterStyle: Style = {
  name: 'raster_rgbrange_to_hexarray',
  rules: [{
    name: 'Test raster',
    symbolizers: [{
      kind: 'Raster',
      colorMap: {
        type: 'ramp',
        colorMapEntries: [{
          color: '#000000',
          quantity: 370
        }, {
          color: '#FFFFFF',
          quantity: 3557,
          opacity: 1
        }]
      },
    }]
  }]
};

export default rasterStyle;
