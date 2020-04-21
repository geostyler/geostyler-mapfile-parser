


const determineTabs = require(__dirname + '/build/determineTabs.js');
const determineKeyValueSpaces = require(__dirname + '/build/determineKeyValueSpaces.js');


const defaultOptions = {
  "tabSize": 2,
  "lineBreak": "\n",
  "comments": true,
  "commentPrefix": " ",
  "emptyLines": true
};

/**
 * Builds a MapFiles from object.
 * @param {object} obj MapFile as JavaScript object.
 * @param {object} [options] Build options.
 * @param {number} [options.tabSize] Size of tabulator. Default is `2`.
 * @param {string} [options.lineBreak] Line break character. Default is `\n`.
 * @param {boolean} [options.comments] Build comments. Default is `true`.
 * @param {boolean} [options.commentPrefix] Build comments with a prefix. Default is ` `.
 * @param {boolean} [options.emptyLines] Build empty lines. Default is `true`.
 * @returns {string} MapServer Mapfile as string.
 */
function build(obj, options) {
  // options
  let opt = Object.assign(defaultOptions, options);

  // mapfile content
  let map = '';

  // determine one tab with spaces
  let tab = '';
  for (let i = 0; i < opt.tabSize; i++) {
    tab += ' ';
  }

  //determine key-value-spaces
  determineKeyValueSpaces(obj, opt.tabSize);

  //iterate over all lines
  obj.forEach((line) => {

    //Add empty lines
    if (line.isEmpty) {
      if (opt.emptyLines) {
        map += opt.lineBreak;
      }
    } else {
      //Add comment lines
      if (line.isComment) {
        if (opt.comments) {
          map += determineTabs(line, tab) + '#' + opt.commentPrefix + line.comment + opt.lineBreak;
        }
      } else {
        //Add key
        if (line.key) {
          //Key only
          if (line.isKeyOnly) {
            map += determineTabs(line, tab) + line.key + opt.lineBreak;
          } else {
            //Key with value
            map += determineTabs(line, tab) + line.key;

            //Add value
            if (line.value) {
              if (line.includesComment) {
                //Add comment
                map += line.keyValueSpaces + line.value;
                if (opt.comments) {
                  if (line.comment) {
                    map += tab + '#' + opt.commentPrefix + line.comment + opt.lineBreak;
                  } else {
                    map += opt.lineBreak;
                  }
                } else {
                  map += opt.lineBreak;
                }
              } else {
                //Without comments
                map += line.keyValueSpaces + line.value + opt.lineBreak;
              }

            }
          }
        }


      }
    }

  });


  return map;
}

module.exports = build;