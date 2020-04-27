import { Style } from 'geostyler-style';

const pointStyle: Style = {
  name: 'Complex points',
  rules: [{
    name: 'st_full_tags_points',
    symbolizers: [{
      kind: 'Mark',
      wellKnownName: 'Circle',
      color: '#00FF00',
      radius: 15,
      rotate: 360,
      opacity: 100
    }]    
  }]
};

export default pointStyle;
