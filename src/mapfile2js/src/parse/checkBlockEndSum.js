/**
 *
 * @param {array} lines Array of line objects
 */
function checkBlockEndSum(lines) {
  let blockCounter = 0;
  let endCounter = 0;

  lines.forEach((line) => {
    if (line.isBlockLine) {
      blockCounter++;
      endCounter++;
    } else {
      if (line.isBlockKey) {
        blockCounter++;
      } else {
        if (line.key) {
          if (line.key.toUpperCase() === "END") {
            endCounter++;
          }
        }
      }
    }
  });

  //endCounter += 1; // account for removed END of PROJECTION

  if (blockCounter !== endCounter) {
    if (blockCounter < endCounter) {
      throw new Error(
        `Too many ends (blocks: ${blockCounter}, ends: ${endCounter}).`
      );
    } else {
      throw new Error(
        `Too few ends (blocks: ${blockCounter}, ends: ${endCounter}).`
      );
    }
  }
}

module.exports = checkBlockEndSum;
