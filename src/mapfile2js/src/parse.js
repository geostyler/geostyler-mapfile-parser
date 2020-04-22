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
  let lineobjects = [];

  // stack to keep track of blocks
  let blocks = [result];

  // replace windows line breaks with linux line breaks
  content = content.replace(new RegExp("[\r][\n]", "g"), "\n");

  // split content into lines
  let lines = content.split("\n");

  lines.forEach((line, index, lines) => {

    // line object
    let lo = {};

    // line content
    lo.content = line.trim();

    // remove qutes (TODO: may need to preserve? fuse with switchQotes.js)
    lo.content = lo.content.replace(/"/g, "");

    // omit empty lines and comments
    if (lo.content === "" || lo.content.startsWith("#")) {
      console.warn(`Omited line [${index + 1}]: ${lo.content}`);
      return;
    }

    // check included comments
    lo = Object.assign(lo, checkComment(lo.content));

    // check key value
    lo = Object.assign(lo, checkKeyValue(lo.contentWithoutComment));

    // check block key
    lo = Object.assign(lo, checkBlockKey(lo));

    // store lineobjects
    lineobjects.push(lo);

    // increase ergonomics (mapfile is case insensitive)
    lo.key = lo.key.toLowerCase();

    // handle block keys
    if (lo.isBlockKey) {
      parseBlockKey(lo, index, lines, blocks);
      return;
    }

    // handle block end
    if (lo.key === "end") {
      // pop current block
      blocks.pop();
      return;
    }

    // insert key value pair
    let current_block = blocks[blocks.length - 1];
    if (lo.key in current_block) {
      console.warn(`Duplicate key on line [${i + 1}]: ${lo.content}`);
      console.error("Overwriting existing key! consider an array!");
    }
    current_block[lo.key] = lo.value;
  });

  checkBlockEndSum(lineobjects);
  determineDepth(lineobjects);

  // insert MAP block if not existent for consistency
  result = !("map" in result) ? {map: result} : result

  return result;
}

module.exports = parse;
