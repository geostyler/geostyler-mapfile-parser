import { Style } from 'geostyler-style';

const pointStyle: Style = {
  name: 'point_simple_rgb_to_hex',
  rules: [
  {
    name: 'Test point',
    symbolizers: [{
      kind: 'Mark',
      fillOpacity: 1,
      wellKnownName: 'circle',
      color: '#00FF00',
      radius: 7.5,
      rotate: 0,
    }]
  }]
}

export default pointStyle;
