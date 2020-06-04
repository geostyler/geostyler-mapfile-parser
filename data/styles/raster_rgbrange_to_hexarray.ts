import { Style } from 'geostyler-style';

const rasterStyle: Style = {
  name: 'raster_rgbrange_to_hexarray',
  rules: [{
    name: '',
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
        }]
      },
    }]
  }]
};

export default rasterStyle;
