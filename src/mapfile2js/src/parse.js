const checkComment = require(`${__dirname}/parse/checkComment.js`);
const checkKeyValue = require(`${__dirname}/parse/checkKeyValue.js`);
const checkBlockKey = require(`${__dirname}/parse/checkBlockKey.js`);
const parseBlockKey = require(`${__dirname}/parse/parseBlockKey.js`);
const checkBlockEndSum = require(`${__dirname}/parse/checkBlockEndSum.js`);
const determineDepth = require(`${__dirname}/parse/determineDepth.js`);

/**
 * Parses a MapServer Mapfile to a JavaScript object.
 * @param {string} content Content of a MapServer Mapfile
 * @returns {Object}
 */
function parse(content) {
  let result = {};
  const lineObjects = [];

  // stack to keep track of blocks
  const blocks = [result];

  // replace windows line breaks with linux line breaks
  content = content.replace(/[\r][\n]/g, '\n');

  // split content into lines
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // line object
    let lineObject = {};

    // line content
    lineObject.content = line.trim();

    // remove qutes (TODO: may need to preserve? fuse with switchQotes.js)
    lineObject.content = lineObject.content.replace(/"/g, '');

    // omit empty lines and comments
    if (lineObject.content === '' || lineObject.content.startsWith('#')) {
      console.warn(`Omited line [${index + 1}]: ${lineObject.content}`);
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
    const currentBlock = blocks[blocks.length - 1];

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

    // insert key value pair
    if (lineObject.key in currentBlock) {
      console.warn(`Duplicate key on line [${index + 1}]: ${lineObject.content}`);
      console.error('Overwriting existing key! consider an array!');
    }
    currentBlock[lineObject.key] = lineObject.value;
  });

  checkBlockEndSum(lineObjects);
  determineDepth(lineObjects);

  // insert MAP block if not existent for consistency
  result = !('map' in result) ? { map: result } : result;

  return result;
}

module.exports = parse;
