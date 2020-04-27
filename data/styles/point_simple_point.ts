import { Style } from 'geostyler-style';

const pointStyle: Style = {
  name: 'Simple points',
  rules: [{
    name: 'Test point',
    symbolizers: [{
      kind: 'Mark',
      wellKnownName: 'Circle',
      color: '#00FF00',
      radius: 15
    }]
  }]
};

export default pointStyle;
