import { Style } from 'geostyler-style';

const pointStyle: Style = {
  name: 'point_simple_rgb_to_hex',
  rules: [
  {
    name: 'Test point',
    symbolizers: [{
      kind: 'Mark',
      wellKnownName: 'Circle',
      color: '#00FF00',
      radius: 7.5
    }]
  }]
}

export default pointStyle;
