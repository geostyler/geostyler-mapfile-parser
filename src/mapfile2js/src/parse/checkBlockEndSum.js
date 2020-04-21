/**
 * 
 * @param {array} lines Array of line objects
 */
function checkBlockEndSum(lines) {


  let blockCounter = 0;
  let endCounter = 0;

  for (let i = 0; i < lines.length; i++) {
    let l = lines[i];

    if (l.isBlockLine) {
      blockCounter++;
      endCounter++;
    } else {
      if (l.isBlockKey) {
        blockCounter++;
      } else {
        if (l.key) {
          if (l.key.toUpperCase() === 'END') {
            endCounter++;
          }
        }
      }
    }
  }

  if (blockCounter !== endCounter) {
    if (blockCounter < endCounter) {
      throw new Error('Too many ends (blocks: ' + blockCounter + ', ends: ' + endCounter + ').');
    } else {
      throw new Error('Too few ends (blocks: ' + blockCounter + ', ends: ' + endCounter + ').');
    }
  }

}

module.exports = checkBlockEndSum;