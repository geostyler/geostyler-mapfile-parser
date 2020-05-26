import { Style } from 'geostyler-style';

const lineStyle: Style = {
  name: 'line_st_sample_style_tags',
  rules: [{
    name: 'Test line',
    symbolizers: [{
      kind: 'Line',
      width: 5,
      color: '#00FF00'
    }]
  }]
};

export default lineStyle;
