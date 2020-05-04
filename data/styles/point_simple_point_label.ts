import { Style } from 'geostyler-style';

const pointStyle: Style = {
  name: 'Simple label',
  rules: [
  {
    name: 'Test label',
    symbolizers: [{
      kind: 'Text',
      font: ['Verdana'],
      color: '#00FF00',
      size: 9
    }]
  }]
}

export default pointStyle;
