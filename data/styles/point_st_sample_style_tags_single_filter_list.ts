import { Style } from 'geostyler-style';

const pointStyle: Style = {
  name: 'point_st_sample_style_tags_single_filter_list',
  rules: [{
    filter: [
      '*=', ['FN_strMatches', 'name', '/(bus|bank)/'], true
    ],
    name: 'Test point',
    symbolizers: [{
      kind: 'Mark',
      wellKnownName: 'circle',
      color: '#FF0000',
      fillOpacity: 1,
      radius: 5,
      rotate: 360,
      opacity: 0.5
    }],
  }]
};

export default pointStyle;
