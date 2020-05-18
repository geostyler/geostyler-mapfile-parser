import { Style } from 'geostyler-style';

const pointStyle: Style = [{
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
}, {
  name: 'point_scale_2',
  rules: [{
    name: 'Min scale from layer (priority)',
    scaleDenominator: {
      min: 6000,
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
      max: 0,
      min: 3000,
    },
    symbolizers: [{
      kind: 'Mark',
      wellKnownName: 'Circle',
      color: '#000000',
      radius: 6,
    }],
  }, {
    name: 'Min scale from layer only',
    scaleDenominator: {
      max: 50000,
      min: 6000,
    },
    symbolizers: [{
      kind: 'Mark',
      wellKnownName: 'Circle',
      visibility: false,
      radius: 3,
    }],
  }],
}, {
  name: 'point_scale_3',
  rules: [{
    name: 'Min scale from class',
    scaleDenominator: {
      min: 0,
    },
    symbolizers: [{
      kind: 'Mark',
      wellKnownName: 'Circle',
      color: '#000000',
      radius: 12,
    }],
  }],
}];

export default pointStyle;
