import { Style } from 'geostyler-style';

const pointStyle: Style = {
  name: 'simple_point_style_tags_single_filter_list',
  rules: [{
    filter: [
      '*=', ['FN_strMatches', 'Attr', '/(Word1|Word2|Word3)/'], true
    ],
    name: 'Test point',
    symbolizers: [{
      kind: 'Mark',
      wellKnownName: 'Circle',
      color: '#00FF00',
      radius: 2,
      rotate: 360,
      opacity: 0.5
    }],
  }]
};

export default pointStyle;
