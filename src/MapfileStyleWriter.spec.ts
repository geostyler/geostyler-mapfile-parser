import { describe, expect, it } from 'vitest';
import { FillSymbolizer, Style } from 'geostyler-style';
import { fillToMapfileStyle, styleToMapfileLayer } from './MapfileStyleWriter';

describe('MapfileStyleWriter', () => {
  describe('#styleToMapfileLayer', () => {
    it('converts a style into a LAYER with one CLASS and one STYLE', () => {
      const style: Style = {
        name: 'buildings',
        rules: [{ name: 'all', symbolizers: [{ kind: 'Fill', color: '#ff0000' }] }],
      };
      expect(styleToMapfileLayer(style)).toEqual({
        name: 'buildings',
        classes: [{ name: 'all', styles: [{ color: '#FF0000' }] }],
      });
    });
  });

  describe('#fillToMapfileStyle', () => {
    it('W1: converts an opaque color to #RRGGBB', () => {
      const fill: FillSymbolizer = { kind: 'Fill', color: '#ff0000' };
      expect(fillToMapfileStyle(fill)).toEqual({ color: '#FF0000' });
    });

    it('W1: converts a transparent color to #RRGGBBAA', () => {
      const fill: FillSymbolizer = { kind: 'Fill', color: '#ff0000', fillOpacity: 0.5 };
      expect(fillToMapfileStyle(fill)).toEqual({ color: '#FF000080' });
    });

    it('W1: multiplies opacity and fillOpacity', () => {
      const fill: FillSymbolizer = {
        kind: 'Fill',
        color: '#73b2ff',
        opacity: 0.5,
        fillOpacity: 0.5,
      };
      // 0.25 * 255 = 63.75, rounded to 64 = 0x40
      expect(fillToMapfileStyle(fill)).toEqual({ color: '#73B2FF40' });
    });

    it('W2: converts the outline with the alpha of opacity and outlineOpacity', () => {
      const fill: FillSymbolizer = {
        kind: 'Fill',
        color: '#ff0000',
        opacity: 0.5,
        outlineColor: '#000000',
        outlineOpacity: 0.5,
        outlineWidth: 2,
      };
      expect(fillToMapfileStyle(fill)).toEqual({
        color: '#FF000080',
        outlinecolor: '#00000040',
        width: 2,
        linecap: 'butt',
        linejoin: 'miter',
      });
    });

    it('W2: gives no color for an outline-only fill', () => {
      const fill: FillSymbolizer = {
        kind: 'Fill',
        outlineColor: '#000000',
        outlineWidth: 2,
      };
      expect(fillToMapfileStyle(fill)).toEqual({
        outlinecolor: '#000000',
        width: 2,
        linecap: 'butt',
        linejoin: 'miter',
      });
    });

    it('W2: uses the fill color for the outline when only outlineWidth is set', () => {
      const fill: FillSymbolizer = {
        kind: 'Fill',
        color: '#ff0000',
        fillOpacity: 0.5,
        outlineWidth: 2,
      };
      // fillOpacity does not apply to the outline, so the outline is opaque.
      expect(fillToMapfileStyle(fill)).toEqual({
        color: '#FF000080',
        outlinecolor: '#FF0000',
        width: 2,
        linecap: 'butt',
        linejoin: 'miter',
      });
    });

    it('W2: writes no outline when neither outlineColor nor outlineWidth is set', () => {
      const fill: FillSymbolizer = { kind: 'Fill', color: '#ff0000' };
      expect(fillToMapfileStyle(fill)).toEqual({ color: '#FF0000' });
    });

    it('W4: writes the outlineCap and outlineJoin of the style', () => {
      const fill: FillSymbolizer = {
        kind: 'Fill',
        outlineColor: '#000000',
        outlineCap: 'round',
        outlineJoin: 'bevel',
      };
      expect(fillToMapfileStyle(fill)).toEqual({
        outlinecolor: '#000000',
        linecap: 'round',
        linejoin: 'bevel',
      });
    });
  });
});
