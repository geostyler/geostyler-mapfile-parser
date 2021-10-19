# geostyler-mapfile-parser

[![Build Status](https://travis-ci.com/geostyler/geostyler-mapfile-parser.svg?branch=master)](https://travis-ci.com/geostyler/geostyler-mapfile-parser)
[![Coverage Status](https://coveralls.io/repos/github/geostyler/geostyler-mapfile-parser/badge.svg?branch=master)](https://coveralls.io/github/geostyler/geostyler-mapfile-parser?branch=master)
[![npm version](https://badge.fury.io/js/geostyler-mapfile-parser.svg)](https://www.npmjs.com/package/geostyler-mapfile-parser)

[GeoStyler](https://github.com/geostyler/geostyler/) Style Parser implementation for Mapserver Mapfiles

## Prerequisite

[node v10+](https://nodejs.org/)

And install it with npm:

```sh
npm i geostyler-mapfile-parser
```

## How to use

If the aim is to transform a Mapfile to another format, your Mapfile must contains only one LAYER per file.

### ES6

```js
import * as fs from 'fs';
import MapfileParser from 'geostyler-mapfile-parser';

const parser = new MapfileParser();

// Load a Mapfile file
const mapfile = fs.readFileSync('./mapfiles_folder/my_mapfile.map', 'utf8');

const { output: geostylerStyle } = await parser.readStyle(mapfile);
console.log(geostylerStyle);
```

Writing a Mapfile from a Geostyler-Style object is currently not possible.

### Command line

To transforms a file to another Geostyler style, use [Geostyler-cli](https://github.com/geostyler/geostyler-cli)
Short example of usage - Install and transform a Mapfile to a QGIS qml file, specifying a custom directory
for symbols:

```
npm install -g geostyler-cli
geostyler -s sld -t qgis -o output.map input.qml mapfile-symbols-path=./symbols.sym
```

### Specify a symbols.sym file

If a symbolset tag is defined in your mapfile, this link will be followed to read symbols.
If it's not the case a `symbols.sym` should be located from where you call the transformation.

You can set the default path with:

```
const parser = new MapfileParser();
parser.symbolsPath = '<a/path/to/symbols.sym>'
```

Alternatively, if you use this library through a script, you can set the path by adding the 
command line option: `mapfile-symbols-path=`.

## Run tests

```sh
  npm install
  npm run test
```

## Run MapServer to display features styles

Be sure you have:

- [GNU Make](https://www.gnu.org/software/make/)
- [Docker](https://www.docker.com/)
- [Docker-compose](https://docs.docker.com/compose/)

Then run simply: `make run`

You can now show predefined mapfiles at this url:

<http://localhost:8380/mapserv?service=wms&version=1.3.0&request=getmap&bbox=46.4,6.4,47.2,7.8&layers=line_simple_line&width=1200&height=800&format=image/jpeg&CRS=EPSG:4326>

Set the `layers` param to display other layers (from layers defined in /data/mapfiles).
