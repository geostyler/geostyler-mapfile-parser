import { checkComment } from './parse/checkComment';
import { checkKeyValue } from './parse/checkKeyValue';
import { checkBlockKey } from './parse/checkBlockKey';
import { parseBlockKey } from './parse/parseBlockKey';
import { checkBlockEndSum } from './parse/checkBlockEndSum';
import { determineDepth } from './parse/determineDepth';
import { resolveSymbolset } from './parse/resolveSymbolset';

export interface LineObject {
  content: string;
  comment: string;
  contentWithoutComment: string;
  key: string;
  value: string;
  isBlockKey: boolean;
  isBlockLine: boolean;
  depth: number;
}

/**
 * A Mapfile can contain a MAP or SYMBOLSET block.
 */
export interface Mapfile {
  map: MapfileMap;
}


interface MapfileSymbolset {
  symbols: MapfileSymbol[];
}

interface MapfileMap {
  web: MapFileWeb;
  layers: MapfileLayer[];
  reference: MapFileReference;
  projection: MapFileProjection;
  querymap: MapFileQueryMap;
  scalebar: MapFileScaleBar;
  symbols: string[] | MapfileSymbol[];
  legend: MapFileLegend;
  /**
   * Filename of the symbolset to use. Can be a path relative to the mapfile, or a full path.
   */
  symbolset?: string;
  /**
   * Filename of fontset file to use. Can be a path relative to the mapfile, or a full path.
   */
  fontset?: string;
}

interface MapFileWeb {
  validation: MapFileValidation;
  metadata: MapFileMetadata;
}

export interface MapfileLayer {
  type: string;
  classitem: string;
  labelitem: string;
  name: string;
  group: string;
  cluster: MapFileCluster;
  validation: MapFileValidation;
  grid: MapFileGrid;
  projection: MapFileProjection;
  scaletoken: MapFileScaleToken;
  composite: MapFileComposite;
  join: MapFileJoin;
  metadata: MapFileMetadata;
  classes: MapfileClass[];
  feature: MapFileFeature;
}

interface MapFileReference {}

interface MapFileProjection {}

interface MapFileQueryMap {}

interface MapFileScaleBar {
  label: MapfileLabel;
}

export interface MapfileSymbol {
  type: string;
  points: string;
  /**
   * Image (GIF or PNG) to use as a marker or brush for type pixmap symbols.
   */
  image?: string;
  anchorpoint: string;
  name: string;
}

interface MapFileLegend {
  label: MapfileLabel;
}

interface MapFileValidation {}

interface MapFileMetadata {}

interface MapFileCluster {}

interface MapFileGrid {}

interface MapFileScaleToken {
  values: MapFileScaleTokenValue[];
}

interface MapFileComposite {}

interface MapFileJoin {}

export interface MapfileClass {
  minscaledenom?: number;
  maxscaledenom?: number;
  text: string;
  expression: string;
  name: string;
  styles: MapfileStyle[];
  validation: MapFileValidation;
  leader: MapFileLeader;
  labels: MapfileLabel[];
}

interface MapFileFeature {
  points: MapFilePoint[];
}

export interface MapfileLabel {
  text: string;
}

interface MapFileScaleTokenValue {}

export interface MapfileStyle {
  /**
   * Height, in layer SIZEUNITS, of the symbol/pattern to be used.
   */
  size: number;
  /**
   * WIDTH refers to the thickness of line work drawn, in layer SIZEUNITS. Default is 1.0.
   */
  width: number;
  /**
   * Sets the line cap type for lines. Default is round.
   */
  linecap?: 'butt' | 'round' | 'square';
  /**
   * Sets the line join type for lines. Default is round.
   */
  linejoin?: 'bevel' | 'round' | 'miter' | 'none';
  initialgap: number;
  symbol: MapfileSymbol;
  outlinecolor: string;
  outlinewidth: number;
  pattern: string;
  color: string;
  opacity: number;
  angle: number;
}

interface MapFileLeader {
  style: MapfileStyle;
}

interface MapFilePoint {}


/**
 * Parses the Mapfile content into a JavaScript object.
 * @param {string} content Content of a Mapfile
 * @returns {object} the parsed object
 */
function parseContent(content: string): object {
  const result = {};
  
  const lineObjects: Array<LineObject> = [];
  // stack to keep track of blocks
  const blocks: Array<any> = [result];
  // replace windows line breaks with linux line breaks
  content = content.replace(/[\r\n]/g, '\n');
  // split content into lines
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    // line object
    let lineObject: LineObject = { content: line.trim() } as any;
    // ommit empty lines and comments
    if (lineObject.content === '' || lineObject.content.startsWith('#')) {
      return;
    }
    // check included comments
    lineObject = Object.assign(lineObject, checkComment(lineObject));
    // check key value
    lineObject = Object.assign(lineObject, checkKeyValue(lineObject));
    // check block key
    lineObject = Object.assign(lineObject, checkBlockKey(lineObject));
    // store lineobjects
    lineObjects.push(lineObject);
    // current block
    const currentBlock: any = blocks[blocks.length - 1];
    // handle block keys
    if (lineObject.isBlockKey) {
      const newBlock = parseBlockKey(lineObject, index, currentBlock);
      if (newBlock) {
        blocks.push(newBlock as any);
      }
      return;
    }
    // handle block end
    if (lineObject.key.toUpperCase() === 'END' && !('projection' in currentBlock)) {
      // pop current block
      blocks.pop();
      return;
    }
    // work around projection imitating a block
    if (lineObject.key.toLowerCase().includes('init=')) {
      currentBlock.projection = lineObject.key.trim().replace(/"/g, '');
      return;
    }
    // some blocks are actually just an array
    if (Array.isArray(currentBlock)) {
      currentBlock.push(lineObject.contentWithoutComment);
      return;
    }
    // insert key value pair
    if (lineObject.key in currentBlock) {
      console.warn(`Duplicate key on line [${index + 1}]: ${lineObject.content}`);
      console.error('Overwriting existing key! consider an array!');
    }
    currentBlock[lineObject.key] = lineObject.value;
  });

  // basic syntax checks
  checkBlockEndSum(lineObjects);
  determineDepth(lineObjects);

  return result;
}


/**
 * Parses a MapServer Mapfile to a JavaScript object.
 * @param {string} content Content of a MapServer Mapfile
 * @returns {Mapfile} the parsed Mapfile
 */
export function parseMapfile(content: string): Mapfile {

  let result = parseContent(content);

  // add map bock for consistency if not exists
  result = ('map' in result)? result : { map: result };
    
  // resolve symbolset
  const mapfile = resolveSymbolset(result as Mapfile);
  
  return mapfile;
}


/**
 * Parses a MapServer Symbolsetfile to a JavaScript object.
 * @param {string} content Content of a MapServer Mapfile
 * @returns {MapfileSymbolset} the parsed Symbolset
 */
export function parseSymbolset(content: string): MapfileSymbolset {

  const result: any = parseContent(content);
  
  return result.symbolset as MapfileSymbolset;
}
