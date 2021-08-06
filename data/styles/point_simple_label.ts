import { Style } from 'geostyler-style';

const pointStyle: Style = {
  name: 'point_simple_label',
  rules: [
  {
    name: 'Test label',
    symbolizers: [{
      kind: 'Text',
      label: 'Nisosa',
      font: ['Verdana'],
      color: '#00FF00',
      size: 9,
      rotate: 0,
    }]
  }]
}

export default pointStyle;
