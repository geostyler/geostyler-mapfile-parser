/**
 * Determines the spaces between key and value
 * @param {array} obj Array of line objects
 * @param {number} tabSize Tab size in spaces
 */
function determineKeyValueSpaces(obj, tabSize) {
  let lastDepth = 0;
  let spacesIndex = 0;

  let spaces = [];

  //iterate over all lines
  obj.forEach((line) => {
    if (lastDepth !== line.depth) {
      spacesIndex++;
    }

    //key found
    if (line.key) {
      //value found
      if (line.value) {
        //block line found
        if (line.isBlockLine) {
          line.keyValueSpaces = " ";
        } else {
          if (!spaces[spacesIndex]) {
            spaces[spacesIndex] = {
              maxKeyLength: 1,
            };
          }

          //determine maxKeyLength
          if (spaces[spacesIndex].maxKeyLength < line.key.length) {
            if (spaces[spacesIndex].maxKeyLength < line.key.length) {
              spaces[spacesIndex].maxKeyLength = line.key.length;
            }
          }
        }
      }
    }

    lastDepth = line.depth;
  });

  // reset the counters
  lastDepth = 0;
  spacesIndex = 0;

  //iterate over all lines
  obj.forEach((line) => {
    if (lastDepth !== line.depth) {
      spacesIndex++;
    }

    //key found
    if (line.key) {
      //value found
      if (line.value) {
        //block line found
        if (!line.isBlockLine) {
          if (spaces[spacesIndex]) {
            let numSpaces =
              spaces[spacesIndex].maxKeyLength - line.key.length + tabSize;
            line.keyValueSpaces = "";
            for (let i = 0; i < numSpaces; i++) {
              line.keyValueSpaces += " ";
            }
          }
        }
      }
    }

    lastDepth = line.depth;
  });

  console.log(obj);

  return obj;
}

module.exports = determineKeyValueSpaces;
