import { Style } from 'geostyler-style';

const pointStyle: Style = {
  name: 'Simple point',
  rules: [{
    name: 'Test point',
    symbolizers: [{
      kind: 'Mark',
      wellKnownName: 'Circle',
      color: '#00FF00',
      radius: 15,
      rotate: 360,
      opacity: 100,
      strokeColor: '#000000',
      strokeWidth: 1
    }]    
  }]
};

export default pointStyle;
