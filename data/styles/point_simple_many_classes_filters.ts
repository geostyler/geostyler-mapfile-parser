import { Style } from 'geostyler-style';

const pointStyle: Style = {
  name: 'point_simple_many_classes_filters',
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
      "==", "id", "1"
    ]
  },
  {
    name: 'Test point 2',
    symbolizers: [{
      kind: 'Mark',
      wellKnownName: 'Triangle',
      color: '#FF0000',
      radius: 5
    }],
    filter: [
      "==", "id", "2"
    ]
  },
  {
    name: 'Test point 3',
    symbolizers: [{
      kind: 'Mark',
      wellKnownName: 'Square',
      color: '#00FFFF',
      radius: 5
    }],
    filter: [
      "==", "id", "3"
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
  }]
}

export default pointStyle;
