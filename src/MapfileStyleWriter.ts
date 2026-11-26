import { FillSymbolizer, Rule, Style, Symbolizer } from 'geostyler-style';
import {
  MapfileLineCap,
  MapfileClassOutput,
  MapfileLineJoin,
  MapfileLayerOutput,
  MapfileStyleOutput,
} from './mapfile2js/mapfileTypes';

// Allowed values for line caps and joins in Mapfile.
const CAPS: readonly MapfileLineCap[] = ['butt', 'round', 'square'];
const JOINS: readonly MapfileLineJoin[] = ['bevel', 'round', 'miter'];

/**
 * Converts a GeoStyler Style into one Mapfile LAYER object.
 *
 * @param {Style} style The GeoStyler Style.
 * @return {MapfileLayerOutput} The LAYER object.
 */
export function styleToMapfileLayer(style: Style): MapfileLayerOutput {
  return {
    name: style.name || undefined,
    classes: style.rules.map((rule) => ruleToMapfileClass(rule)),
  };
}

/**
 * Converts a GeoStyler Rule into one Mapfile CLASS object.
 *
 * @param {Rule} rule The GeoStyler Rule.
 * @return {MapfileClassOutput} The CLASS object.
 */
export function ruleToMapfileClass(rule: Rule): MapfileClassOutput {
  return {
    name: rule.name || undefined,
    styles: rule.symbolizers.flatMap((symbolizer) =>
      symbolizerToMapfileStyles(symbolizer),
    ),
  };
}

/**
 * Converts a GeoStyler symbolizer into Mapfile STYLE objects.
 * For now, it converts only Fill symbolizers. It skips the other kinds.
 *
 * @param {Symbolizer} symbolizer The GeoStyler symbolizer.
 * @return {MapfileStyleOutput[]} The STYLE objects. Empty for a kind that is not supported.
 */
export function symbolizerToMapfileStyles(symbolizer: Symbolizer): MapfileStyleOutput[] {
  switch (symbolizer.kind) {
    case 'Fill':
      return [fillToMapfileStyle(symbolizer)];
    default:
      return [];
  }
}

/**
 * Converts a GeoStyler Fill symbolizer into one Mapfile STYLE object.
 * - Opacity is the product of the fill or outline opacity and the overall opacity.
 * - The outline color defaults to the fill color if unspecified and an outline width is set.
 * - linecap and linejoin default to butt and miter.
 *
 * @param {FillSymbolizer} fill The GeoStyler Fill symbolizer.
 * @return {MapfileStyleOutput} The STYLE object.
 */
export function fillToMapfileStyle(fill: FillSymbolizer): MapfileStyleOutput {
  const opacity = asNumber(fill.opacity);
  const fillOpacity = asNumber(fill.fillOpacity);
  const color = toMapfileColor(asString(fill.color), [opacity, fillOpacity]);
  const outlineWidth = asNumber(fill.outlineWidth);

  let outlineHex = asString(fill.outlineColor);
  if (!outlineHex && outlineWidth) {
    outlineHex = asString(fill.color);
  }

  const outlineOpacity = asNumber(fill.outlineOpacity);
  const outlinecolor = toMapfileColor(outlineHex, [opacity, outlineOpacity]);
  
  // Only set WIDTH, LINECAP and LINEJOIN if there is an outline color.
  const hasOutline = outlinecolor !== undefined;
  const width = hasOutline ? outlineWidth : undefined;
  const linecap = hasOutline ? (ifAllowed(fill.outlineCap, CAPS) ?? 'butt') : undefined;
  const linejoin = hasOutline
    ? (ifAllowed(fill.outlineJoin, JOINS) ?? 'miter')
    : undefined;

  return removeUndefined({ color, outlinecolor, width, linecap, linejoin });
}

/**
 * Converts a GeoStyler hex color and opacities into a Mapfile color.
 * The alpha is the product of the opacities.
 * With no transparency, it returns `#RRGGBB`. Otherwise it returns `#RRGGBBAA`.
 *
 * @param {string} hex The color in the form `#RRGGBB`.
 * @param {number[]} opacities The symbolizer opacity and the part opacity, for example fillOpacity.
 * @return {string | undefined} The Mapfile color, or undefined when hex is not `#RRGGBB`.
 */
export function toMapfileColor(
  hex: string | undefined,
  opacities: [number | undefined, (number | undefined)?],
): string | undefined {
  if (hex === undefined || !/^#[0-9a-f]{6}$/i.test(hex)) {
    return undefined;
  }
  // A missing opacity counts as 1 (opaque).
  const alpha = (opacities[0] ?? 1) * (opacities[1] ?? 1);
  const alphaByte = Math.round(Math.min(Math.max(alpha, 0), 1) * 255);
  if (alphaByte === 255) {
    return hex.toUpperCase();
  }
  const alphaHex = alphaByte.toString(16).padStart(2, '0');
  return `${hex}${alphaHex}`.toUpperCase();
}

/**
 * Removes the keys with an undefined value, so that tests can compare objects with toEqual.
 *
 * @param {T} object The object.
 * @return {T} The object without the undefined values.
 */
function removeUndefined<T extends object>(object: T): T {
  return Object.fromEntries(
    Object.entries(object).filter(([, value]) => value !== undefined),
  ) as T;
}

/**
 * Returns the value when it is one of the allowed literal strings.
 *
 * @param {unknown} value The GeoStyler value.
 * @param {T[]} allowed The allowed values.
 * @return {T | undefined} The value, or undefined when it is not allowed.
 */
function ifAllowed<T extends string>(
  value: unknown,
  allowed: readonly T[],
): T | undefined {
  return allowed.includes(value as T) ? (value as T) : undefined;
}

/**
 * Returns the value when it is a literal number. A GeoStyler function is not supported yet.
 *
 * @param {unknown} value The GeoStyler value.
 * @return {number | undefined} The number.
 */
function asNumber(value: unknown): number | undefined {
  return typeof value === 'number' ? value : undefined;
}

/**
 * Returns the value when it is a literal string. A GeoStyler function is not supported yet.
 *
 * @param {unknown} value The GeoStyler value.
 * @return {string | undefined} The string.
 */
function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}
