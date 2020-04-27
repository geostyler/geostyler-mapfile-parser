import { Style } from 'geostyler-style';

const pointStyle: Style = {
  name: 'Simple points',
  rules: [{
    filter: [
      '*=',
      ['FN_strMatches', 'Attr', '/(Word1|Word2|Word3)/'],
      true
    ],
    name: 'Test point',
    symbolizers: [{
      kind: 'Mark',
      wellKnownName: 'Circle',
      color: '#00FF00',
      radius: 4,
      rotate: 360,
      opacity: 50
    }],
  }]
};

export default pointStyle;
