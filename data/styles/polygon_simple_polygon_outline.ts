import { Style } from 'geostyler-style';

const polygonStyle: Style = {
  name: 'polygon_simple_polygon_outline',
  rules: [
    {
      name: '',
      symbolizers: [
        { kind: 'Fill', outlineOpacity: 0, color: '#00FF00', fillOpacity: 1 },
        {
          kind: 'Fill',
          outlineColor: '#555555',
          fillOpacity: 0,
          outlineWidth: 0.1,
          outlineOpacity: 1
        }
      ]
    }
  ]
};
export default polygonStyle;
