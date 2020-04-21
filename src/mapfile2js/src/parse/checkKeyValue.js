
const regExpWhitespace = new RegExp('\\s');
const switchQuotes = require(__dirname + '/switchQuotes.js');

/**
 * 
 * @param {string} line Line without comment
 */
function checkKeyValue(line){

  let lo = {};
  
  if (line.match(regExpWhitespace)) {
    // Check key value
    lo.isKeyOnly = false;

    let l1 = line.split(regExpWhitespace);
    lo.key = switchQuotes(l1[0]);
    lo.value = switchQuotes(line.replace(l1[0],'').trim());

  } else {
    // key only
    lo.isKeyOnly = true;
    lo.key = line;
  }

  return lo;
}

module.exports = checkKeyValue;