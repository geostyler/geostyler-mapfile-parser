import { Style } from 'geostyler-style';

const pointStyle: Style = [{
  name: 'point_scale',
  rules: [{
    name: 'Max scale from class',
    scaleDenominator: {
      max: 7000,
    },
    symbolizers: [{
      kind: 'Mark',
      wellKnownName: 'circle',
      fillOpacity: 1,
      color: '#000000',
      radius: 12,
      rotate: 0,
    }],
  }, {
    name: 'Max scale from layer, min scale from class',
    scaleDenominator: {
      max: 320000,
      min: 160000,
    },
    symbolizers: [{
      kind: 'Mark',
      wellKnownName: 'circle',
      fillOpacity: 1,
      color: '#000000',
      radius: 6,
      rotate: 0,
    }],
  }, {
    name: 'Max scale from layer',
    scaleDenominator: {
      max: 320000,
      min: 160000,
    },
    symbolizers: [{
      kind: 'Mark',
      wellKnownName: 'circle',
      fillOpacity: 1,
      color: '#000000',
      radius: 3,
      rotate: 0,
    }],
  }, {
    name: 'Scale 0 and max scale from class',
    scaleDenominator: {
      max: 0,
      min: 0,
    },
    symbolizers: [{
      kind: 'Mark',
      wellKnownName: 'circle',
      fillOpacity: 1,
      visibility: false,
      radius: 10,
      rotate: 0,
    }],
  }],
}, {
  name: 'point_scale_2',
  rules: [{
    name: 'Min scale from class',
    scaleDenominator: {
      min: 10000,
    },
    symbolizers: [{
      kind: 'Mark',
      wellKnownName: 'circle',
      fillOpacity: 1,
      color: '#000000',
      radius: 12,
      rotate: 0,
    }],
  }, {
    name: 'Scales from class',
    scaleDenominator: {
      max: 0,
      min: 3000,
    },
    symbolizers: [{
      kind: 'Mark',
      wellKnownName: 'circle',
      fillOpacity: 1,
      color: '#000000',
      radius: 6,
      rotate: 0,
    }],
  }, {
    name: 'Min scale from layer only',
    scaleDenominator: {
      max: 50000,
      min: 6000,
    },
    symbolizers: [{
      kind: 'Mark',
      wellKnownName: 'circle',
      fillOpacity: 1,
      visibility: false,
      radius: 3,
      rotate: 0,
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
      wellKnownName: 'circle',
      fillOpacity: 1,
      color: '#000000',
      radius: 12,
      rotate: 0,
    }],
  }],
}];

export default pointStyle;
