import { Style } from 'geostyler-style';

const pointStyle: Style = {
  name: 'point_st_sample_style_tags_single_filter_regex',
  rules: [{
    filter: [
      '==', {
        name: 'strMatches',
        args: [{
          name: 'property',
          args: ['name']
        }, '/bus/']
      }, true
    ],
    name: 'Test point',
    symbolizers: [{
      kind: 'Mark',
      wellKnownName: 'circle',
      fillOpacity: 1,
      color: '#000000',
      radius: 4.25,
      rotate: 360,
      opacity: 1,
    }],
  }]
};

export default pointStyle;
