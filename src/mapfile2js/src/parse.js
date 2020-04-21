
const obj = {
  "num": 1,
  "content": "MAP # aaa",
  "isEmpty": false,
  "isComment": false,
  "includesComment": true,
  "comment": "aaa",
  "contentWithoutComment": "MAP"
};

const checkComment = require(__dirname + '/parse/checkComment.js');
const checkKeyValue = require(__dirname + '/parse/checkKeyValue.js');
const checkBlockKey = require(__dirname + '/parse/checkBlockKey.js');
const checkBlockEndSum = require(__dirname + '/parse/checkBlockEndSum.js');
const determineDepth = require(__dirname + '/parse/determineDepth.js');

const regExpWhitespace = new RegExp('\\s');

const defaultOptions = {
  quotes: '"'
}

/**
 * Parses a MapServer Mapfile to a JavaScript object.
 * @param {string} c Content of a MapServer Mapfile
 * @returns {array}
 */
function parse(c) {

  let ret = [];

  // replace windows line breaks with linux line breaks
  let c1 = c.replace(new RegExp('[\r][\n]', 'g'), '\n');

  // split string to line array
  let c2 = c1.split('\n');

  for (let i = 0; i < c2.length; i++) {

    //line object
    let lo = {};

    // line
    let l = c2[i];

    // trim line
    let l1 = l.trim();

    // set line number
    lo.num = i + 1;

    // set original line
    lo.content = l1;

    // check empty line
    if (l1 === '') {
      lo.isEmpty = true;
    } else {
      lo.isEmpty = false;

      // check line comment
      if (l1.startsWith('#')) {
        lo.isComment = true;
        lo.comment = lo.content.substring(1,lo.content.length).trim();
      } else {
        lo.isComment = false;

        // Check included comments
        lo = Object.assign(lo, checkComment(l1));

        // check key value
        lo = Object.assign(lo, checkKeyValue(lo.contentWithoutComment));

        // check block key
        lo = Object.assign(lo, checkBlockKey(lo));
        
    
      }
    }

    //console.log(lo);

    ret.push(lo);
  }

  checkBlockEndSum(ret);
  determineDepth(ret);

  return ret;
}

module.exports = parse;