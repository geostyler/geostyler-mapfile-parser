import { checkComment } from './parse/checkComment';
import { checkKeyValue } from './parse/checkKeyValue';
import { checkBlockKey } from './parse/checkBlockKey';
import { parseBlockKey } from './parse/parseBlockKey';
import { checkBlockEndSum } from './parse/checkBlockEndSum';
import { determineDepth } from './parse/determineDepth';
import { resolveSymbolset } from './parse/resolveSymbolset';
import { Mapfile, MapfileSymbolset } from './mapfileTypes';

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
