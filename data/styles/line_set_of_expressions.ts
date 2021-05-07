import { Style } from 'geostyler-style';

const lineExpressionStyle: Style = [{
  name: 'roads_inline',
  rules: [
    {
      name: '',
      filter: [
        '&&',
        ['==', 'class', 'railways'],
        ['!=', 'service', 'spur'],
        ['==', 'type', 'rail']
      ],
      scaleDenominator: { max: 500000, min: 25000 },
      symbolizers: []
    }
  ]
}];

export default lineExpressionStyle;
