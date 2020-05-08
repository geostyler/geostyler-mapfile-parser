import { checkComment } from './parse/checkComment';
import { checkKeyValue } from './parse/checkKeyValue';
import { checkBlockKey } from './parse/checkBlockKey';
import { parseBlockKey } from './parse/parseBlockKey';
import { checkBlockEndSum } from './parse/checkBlockEndSum';
import { determineDepth } from './parse/determineDepth';
import { resolveSymbolset } from './parse/resolveSymbolset';

/**
 * Parses a MapServer Mapfile to a JavaScript object.
 * @param {string} content Content of a MapServer Mapfile
 * @returns {Object}
 */
export function parse(content: string): object {
  let result = {};
  const lineObjects: Array<any> = [];

  // stack to keep track of blocks
  const blocks = [result];

  // replace windows line breaks with linux line breaks
  content = content.replace(/[\r\n]/g, '\n');

  // split content into lines
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // line object
    let lineObject: any = {};

    // line content
    lineObject.content = line.trim();

    // omit empty lines and comments
    if (lineObject.content === '' || lineObject.content.startsWith('#')) {
      // console.warn(`Omited line [${index + 1}]: ${lineObject.content}`);
      return;
    }

    // check included comments
    lineObject = Object.assign(lineObject, checkComment(lineObject.content));

    // check key value
    lineObject = Object.assign(lineObject, checkKeyValue(lineObject.contentWithoutComment));

    // check block key
    lineObject = Object.assign(lineObject, checkBlockKey(lineObject));

    // store lineobjects
    lineObjects.push(lineObject);

    // increase ergonomics (mapfile is case insensitive)
    lineObject.key = lineObject.key.toLowerCase();

    // current block
    const currentBlock: any = blocks[blocks.length - 1];

    // handle block keys
    if (lineObject.isBlockKey) {
      const newBlock = parseBlockKey(lineObject, index, currentBlock);
      if (newBlock) {
        blocks.push(newBlock);
      }

      return;
    }

    // handle block end
    if (lineObject.key === 'end' && !('projection' in currentBlock)) {
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

  // insert MAP block if not existent for consistency
  result = 'map' in result || 'symbolset' in result ? result : { map: result };

  checkBlockEndSum(lineObjects);
  determineDepth(lineObjects);

  // resolve symbolset
  if (!('symbolset' in result)) {
    result = resolveSymbolset(result);
  }
  
  return result;
}
