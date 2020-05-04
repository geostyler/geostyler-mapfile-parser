import { Style } from 'geostyler-style';

const pointStyle: Style = {
  name: 'Simple point',
  rules: [
  {
    name: 'Test point 1',
    symbolizers: [{
      kind: 'Mark',
      wellKnownName: 'Circle',
      color: '#00FF00',
      radius: 7.5
    }],
    filter: [
      "==", "category", "1"
    ]
  },
  {
    name: 'Test point 2',
    symbolizers: [{
      kind: 'Mark',
      wellKnownName: 'Triangle',
      color: '#0000FF',
      radius: 5
    }],
    filter: [
      "==", "category", "2"
    ]
  },
  {
    name: 'Test point 3',
    symbolizers: [{
      kind: 'Mark',
      wellKnownName: 'Square',
      color: '#0000FF',
      radius: 5
    }],
    filter: [
      "==", "category", "3"
    ]
  },
  {
    name: 'Test point 4',
    symbolizers: [{
      kind: 'Mark',
      wellKnownName: 'Cross',
      color: '#0000FF',
      radius: 5
    }],
    filter: [
      "==", "category", "4"
    ]
  }]
}

export default pointStyle;
