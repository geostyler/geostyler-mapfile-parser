/**
 * Parse block keys.
 * @param {Object} lo Line Object
 * @param {number} index Current lines index
 * @param {array} lines Array of line strings
 * @param {array} blocks Block stack
 */

// there can be multiple layer, class and style block siblings
const multi_block_keys = ["layer", "class", "style"];

function parseBlockKey(lo, index, lines, blocks) {
  const current_block = blocks[blocks.length - 1];

  // can not handle block lines
  if (lo.isBlockLine) {
    console.warn(`Block line [${i + 1}]: ${lo.content}`);
    console.error("Not able to deal with block line yet!");
    return;
  }

  // work around projection imitating a block
  if (lo.key.toUpperCase() === "PROJECTION") {
    current_block[lo.key] = lines[index + 1].trim().replace(/"/g, "");
    lines.splice(index + 1, 2); // hack to jump over end, fails if projection is multiline
    return;
  }

  // handle multi block keys
  if (multi_block_keys.includes(lo.key)) {
    if (!(lo.key in current_block)) {
      // add list
      current_block[lo.key] = [];
    }
    // add block to list
    current_block[lo.key].push({});

    // push to stack
    blocks.push(current_block[lo.key][current_block[lo.key].length - 1]);
  } else {
    // check for duplicate block key
    if (lo.key in current_block) {
      console.error(`Overwriting block! Add '${lo.key}' to multi block keys!`);
    }
    // create block
    current_block[lo.key] = {};
    // push to stack
    blocks.push(current_block[lo.key]);
  }
  return;
}

module.exports = parseBlockKey;
