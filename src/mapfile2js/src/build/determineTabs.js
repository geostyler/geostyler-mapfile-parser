/**
 * Determines spaces for a line
 * @param {object} line Line object
 * @param {string} tab A tab in spaces
 * @returns {string} Returns a string of spaces
 */
function determineTabs(line, tab) {
  let tabs = "";
  for (let i = 0; i < line.depth; i++) {
    tabs += tab;
  }

  return tabs;
}

module.exports = determineTabs;
