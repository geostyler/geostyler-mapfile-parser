import {
  MapfileClassOutput,
  MapfileLayerOutput,
  MapfileStyleOutput,
} from './mapfileTypes';

const INDENT = '  ';

/**
 * The content of a block: a line, no line (undefined), or a list of child blocks.
 * A child block is a list of lines.
 */
type BlockContent = string | undefined | string[][];

/**
 * Converts a Mapfile LAYER object into Mapfile text.
 *
 * @param {MapfileLayerOutput} layer The LAYER object.
 * @return {string} The LAYER block.
 */
export function stringifyMapfileLayer(layer: MapfileLayerOutput): string {
  const lines = buildBlock('LAYER', [
    buildKeyValue('NAME', quote(layer.name)),
    layer.classes.map((mapfileClass) => stringifyClass(mapfileClass)),
  ]);
  return lines.join('\n') + '\n';
}

/**
 * @param {MapfileClassOutput} mapfileClass The CLASS object.
 * @return {string[]} The lines of the CLASS block.
 */
function stringifyClass(mapfileClass: MapfileClassOutput): string[] {
  return buildBlock('CLASS', [
    buildKeyValue('NAME', quote(mapfileClass.name)),
    mapfileClass.styles.map((style) => stringifyStyle(style)),
  ]);
}

/**
 * @param {MapfileStyleOutput} style The STYLE object.
 * @return {string[]} The lines of the STYLE block.
 */
function stringifyStyle(style: MapfileStyleOutput): string[] {
  return buildBlock('STYLE', [
    buildKeyValue('COLOR', quote(style.color)),
    buildKeyValue('OUTLINECOLOR', quote(style.outlinecolor)),
    buildKeyValue('WIDTH', style.width),
    buildKeyValue('LINECAP', style.linecap?.toUpperCase()),
    buildKeyValue('LINEJOIN', style.linejoin?.toUpperCase()),
  ]);
}

/**
 * @param {string} keyword The block keyword, for example `CLASS`.
 * @param {BlockContent[]} children The content inside the block. Undefined lines are dropped.
 * @return {string[]} The block lines, with the children indented.
 */
function buildBlock(keyword: string, children: BlockContent[]): string[] {
  //  Block goes from a nested structure to a flat list of lines.
  const lines = children.flat(2).filter((line) => line !== undefined);
  return [keyword, ...lines.map((line) => INDENT + line), 'END'];
}

/**
 * @param {string} keyword The Mapfile keyword.
 * @param {string | number} value The value.
 * @return {string | undefined} The line, or undefined when the value is undefined.
 */
function buildKeyValue(
  keyword: string,
  value: string | number | undefined,
): string | undefined {
  return value === undefined ? undefined : `${keyword} ${value}`;
}

/**
 * Wraps a text in double quotes and escapes the double quotes inside it (e.g., ``Type "A"`` becomes `"Type \"A\""`).
 *
 * @param {string} text The text to quote.
 * @return {string | undefined} The quoted text, or undefined when the text is empty.
 */
function quote(text: string | undefined): string | undefined {
  return text ? `"${text.replace(/"/g, '\\"')}"` : undefined;
}
