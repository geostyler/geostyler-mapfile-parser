# mapfile2js

MapServer Mapfile parser and builder for Node.js
Started by stadt-bielefeld : https://github.com/stadt-bielefeld/mapfile2js

## Getting started

```js
const fs = require("fs");
const parse = require("mapfile2js").parse;
const build = require("mapfile2js").build;

let content = fs.readFileSync("my_mapfile.map", { encoding: "utf8" });

// parse
let obj = parse(content);

console.log(obj);

// build
let map = build(obj, {
  tabSize: 2,
  comments: true,
  commentPrefix: " ",
  emptyLines: true,
});

console.log(map);
```

## License

MIT
