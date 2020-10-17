import { Style } from 'geostyler-style';

const polygonStyle: Style = {
  name: 'polygon_simple_polygon',
  rules: [{
    name: '',
    symbolizers: [{
      kind: 'Fill',
      color: '#00FF00',
      outlineColor: '#555555',
    }]
  }]
};

export default polygonStyle;
