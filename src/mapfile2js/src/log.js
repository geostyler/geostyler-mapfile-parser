function log(level, msg, err) {
  const msg = `${level}': '${msg}`;
  console.log(msg);
}

module.exports = log;
