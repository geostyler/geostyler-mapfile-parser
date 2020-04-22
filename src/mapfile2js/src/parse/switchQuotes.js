function switchQuotes(str) {
  if (str.startsWith("'") && str.endsWith("'")) {
    return `"${str.substring(1, str.length - 1)}"`;
  }

  return str;
}

module.exports = switchQuotes;
