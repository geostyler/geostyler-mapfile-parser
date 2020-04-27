import { Style } from 'geostyler-style';

const pointStyle: Style = {
  name: 'Simple points',
  rules: [
  {
    name: 'Test point 1',
    symbolizers: [{
      kind: 'Mark',
      wellKnownName: 'Circle',
      color: '#00FF00',
      radius: 15
    }],
    filter: [
      "==", "category", 1
    ]
  },
  {
    name: 'Test point 2',
    symbolizers: [{
      kind: 'Mark',
      wellKnownName: 'Circle',
      color: '#0000FF',
      radius: 10
    }],
    filter: [
      "==", "category", 5
    ]
  }]
}

export default pointStyle;
