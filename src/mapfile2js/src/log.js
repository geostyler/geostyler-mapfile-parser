function log(level, msg, err) {
  let msg = `${level}': '${msg}`;
  console.log(msg);
}

module.exports = log;