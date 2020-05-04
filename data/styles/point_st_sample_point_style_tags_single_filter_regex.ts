import { Style } from 'geostyler-style';

const pointStyle: Style = {
  name: 'Simple point',
  rules: [{
    filter: [
      '*=', ['FN_strMatches', 'OBJECTVAL', '/^(A|B)Anyword$/'], true
    ],
    name: 'Test point',
    symbolizers: [{
      kind: 'Mark',
      wellKnownName: 'Circle',
      color: '#000000',
      radius: 2.5,
      rotate: 360,
      opacity: 1
    }],
  }]
};

export default pointStyle;
