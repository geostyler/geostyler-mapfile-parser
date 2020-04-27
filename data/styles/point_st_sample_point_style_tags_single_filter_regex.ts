import { Style } from 'geostyler-style';

const pointStyle: Style = {
  name: 'Simple point',
  rules: [{
    filter: [
      '*=', ['FN_strMatches', 'Test point 1', '/^(A|B)Anyword$/'], true
    ],
    name: 'Test point',
    symbolizers: [{
      kind: 'Mark',
      wellKnownName: 'Circle',
      color: '#00FF00',
      radius: 15,
      rotate: 360,
      opacity: 100
    }],
  }]
};

export default pointStyle;
