import { Style } from 'geostyler-style';

const polygonStyle: Style = {
  name: 'polygon_simple_polygon',
  rules: [{
    name: '',
    symbolizers: [{
      kind: 'Fill',
      color: '#00FF00',
      fillOpacity: 1,
      outlineColor: '#555555',
      outlineOpacity: 1
    }]
  }]
};

export default polygonStyle;
