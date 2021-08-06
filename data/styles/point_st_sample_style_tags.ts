import { Style } from 'geostyler-style';

const pointStyle: Style = {
  name: 'point_st_sample_style_tags',
  rules: [{
    name: 'Test point',
    symbolizers: [{
      kind: 'Mark',
      wellKnownName: 'circle',
      color: '#00FF00',
      radius: 7.5,
      rotate: 360,
      fillOpacity: 1,
      opacity: 1,
      strokeColor: '#000000',
      strokeWidth: 1,
      strokeOpacity: 1  // same as opacity
    }]
  }]
};

export default pointStyle;
