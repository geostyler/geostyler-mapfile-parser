import { checkComment } from './parse/checkComment';
import { checkKeyValue } from './parse/checkKeyValue';
import { checkBlockKey } from './parse/checkBlockKey';
import { parseBlockKey } from './parse/parseBlockKey';
import { checkBlockEndSum } from './parse/checkBlockEndSum';
import { determineDepth } from './parse/determineDepth';
import { resolveSymbolset } from './parse/resolveSymbolset';
import { Mapfile, MapfileSymbolset } from './mapfileTypes';

// some blocks are actually a key value pair
const pseudoBlockKeys = ['projection', 'pattern', 'points'];
// some keys are reused to specify an array of values
const listKeys = ['formatoption', 'include', 'processing'];

/**
 * Object representation of a Mapfile line.
 */
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
 * Parses a Mapfile line into a JavaScript object.
 * @param {string} line Content of a Mapfile
 * @returns {object} the parsed object
 */
function parseLine(line: string): LineObject {
  let lineObject: LineObject = { content: line } as any;

  // check included comments
  lineObject = Object.assign(lineObject, checkComment(lineObject));
  // check key value
  lineObject = Object.assign(lineObject, checkKeyValue(lineObject));
  // check block key
  lineObject = Object.assign(lineObject, checkBlockKey(lineObject));

  return lineObject;
}

/**
 * Parses the Mapfile content into a JavaScript object.
 * @param {string} content Content of a Mapfile
 * @returns {object} the parsed object
 */
function parseContent(content: string): Record<string, unknown> {
  const result = {};
  const lineObjects: Array<LineObject> = [];
  // stack to keep track of blocks
  const blocks: Array<any> = [result];
  let pseudoBlockKey: any;
  // split content into trimmed lines like Van Damme
  const lines = content.split(/\s*(?:\r\n?|\n)\s*/g);
  // iterate over lines
  lines.forEach((line, index) => {
    // ommit empty lines and comments
    if (line === '' || line.startsWith('#')) {
      return;
    }
    // line object
    const lineObject = parseLine(line);
    // store lineobjects
    lineObjects.push(lineObject);
    // current block
    const currentBlock = blocks[blocks.length - 1];

    // handle pseudo blocks
    if (pseudoBlockKeys.includes(lineObject.key)) {
      if (lineObject.value) {
        currentBlock[lineObject.key] = lineObject.value.replace(/\s*END$/i, '');
        if (lineObject.value.match(/\s*END$/i)) {
          return;
        }
      }
      pseudoBlockKey = lineObject.key;
      return;
    }
    if (pseudoBlockKey && lineObject.key !== 'end') {
      const value = lineObject.contentWithoutComment.replace(/"/g, '');
      if (currentBlock[pseudoBlockKey]) {
        currentBlock[pseudoBlockKey] = `${currentBlock[pseudoBlockKey]} ${value}`;
      } else {
        currentBlock[pseudoBlockKey] = value;
      }
      return;
    }

    // handle block & list keys
    if (lineObject.isBlockKey || listKeys.includes(lineObject.key)) {
      const newBlock = parseBlockKey(lineObject, currentBlock);
      if (newBlock) {
        blocks.push(newBlock as any);
      }
      return;
    }

    // handle block end
    if (lineObject.key === 'end') {
      if (pseudoBlockKey) {
        pseudoBlockKey = undefined;
      } else {
        blocks.pop();
      }
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
 * @param {string} symbolsPath path of the symbols.sym file if no symbolset is defined in the Mapfile.
 * @returns {Mapfile} the parsed Mapfile
 */
export function parseMapfile(content: string, symbolsPath: string): Mapfile {
  let result: any = parseContent(content);

  // add map bock for consistency if not exists
  result = 'map' in result ? result : { map: result };

  // resolve symbolset
  const mapfile = resolveSymbolset(result as Mapfile, symbolsPath);

  return mapfile;
}

/**
 * Parses a MapServer Symbolsetfile to a JavaScript object.
 * @param {string} content Content of a MapServer Mapfile
 * @returns {MapfileSymbolset} the parsed Symbolset
 */
export function parseSymbolset(content: string): MapfileSymbolset {
  const result: any = parseContent(content);

  // A Mapfile symbolset begins with SYMBOLSET and ends with END
  console.assert('symbolset' in result);

  return result.symbolset as MapfileSymbolset;
}
