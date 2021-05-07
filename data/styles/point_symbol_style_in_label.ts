import { Style } from 'geostyler-style';

const pointSymbolStyle: Style = [
  {
    name: 'point_symbol_style_in_label',
    rules: [
      {
        name: '',
        scaleDenominator: { max: 35000 },
        symbolizers: [
          { kind: 'Icon', image: 'simple_point_symbol.svg' },
          {
            kind: 'Text',
            label: '{{ref}}',
            font: ['ptsansbold'],
            size: 6.644432194046306,
            color: '#ffffff'
          }
        ]
      }
    ]
  }
];

export default pointSymbolStyle;
