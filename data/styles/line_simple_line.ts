import { Style } from 'geostyler-style';

const lineStyle: Style = {
  name: 'line_simple_line',
  rules: [{
    name: 'Test line',
    symbolizers: [{
      kind: 'Line',
      join: 'round', // mapserver default
      width: 5,
      color: '#00FF00'
    }]
  }]
};

export default lineStyle;
