import { Style } from 'geostyler-style';

const pointStyle: Style = {
  name: 'point_scale',
  rules: [{
    name: 'Max scale from layer (priority)',
    scaleDenominator: {
      max: 160000,
    },
    symbolizers: [{
      kind: 'Mark',
      wellKnownName: 'Circle',
      color: '#000000',
      radius: 12,
    }],
  }, {
    name: 'Scales from class',
    scaleDenominator: {
      max: 320000,
      min: 160000,
    },
    symbolizers: [{
      kind: 'Mark',
      wellKnownName: 'Circle',
      color: '#000000',
      radius: 6,
    }],
  }, {
    name: 'Max scale from layer',
    scaleDenominator: {
      max: 160000,
      min: 320000,
    },
    symbolizers: [{
      kind: 'Mark',
      wellKnownName: 'Circle',
      color: '#000000',
      radius: 3,
    }],
  }, {
    name: 'Scale 0 and max scale from layer (priority)',
    scaleDenominator: {
      max: 160000,
      min: 0,
    },
    symbolizers: [{
      kind: 'Mark',
      wellKnownName: 'Circle',
      visibility: false,
      radius: 10,
    }],
  }],
};

export default pointStyle;
