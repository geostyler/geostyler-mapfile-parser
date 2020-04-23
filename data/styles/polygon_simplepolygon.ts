import { Style } from 'geostyler-style';

const polygonSimplePolygon: Style = {
  name: 'Simple polygons',
  rules: [{
    name: 'Test polygon',
    symbolizers: [{
      kind: 'Fill',
      color: '#00FF00',
      outlineColor: '#555555'
    }]
  }]
};

export default polygonSimplePolygon;
