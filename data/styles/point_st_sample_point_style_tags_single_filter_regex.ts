import { Style } from 'geostyler-style';

const pointStyle: Style = {
  name: 'point_st_sample_point_style_tags_single_filter_regex',
  rules: [{
    filter: [
      '*=', ['FN_strMatches', 'OBJECTVAL', '/^(A|B)Anyword$/'], true
    ],
    name: 'Test point',
    symbolizers: [{
      kind: 'Mark',
      wellKnownName: 'Circle',
      color: '#000000',
      radius: 2.5,
      rotate: 360,
      opacity: 1
    }],
  }]
};

export default pointStyle;
