# geostyler-mapfile-parser

[![Build Status](https://travis-ci.com/geostyler/geostyler-mapfile-parser.svg?branch=master)](https://travis-ci.com/geostyler/geostyler-mapfile-parser)
[![Coverage Status](https://coveralls.io/repos/github/geostyler/geostyler-mapfile-parser/badge.svg?branch=master)](https://coveralls.io/github/geostyler/geostyler-mapfile-parser?branch=master)
[![npm version](https://badge.fury.io/js/geostyler-mapfile-parser.svg)](https://www.npmjs.com/package/geostyler-mapfile-parser)

[GeoStyler](https://github.com/geostyler/geostyler/) Style Parser implementation for Mapserver Mapfiles

## How to use

Not really useable now, wait on the first release.

## Prerequisite

  node v10+: https://nodejs.org/

## Run tests

```
  npm install
  npm run test
```

## Run MapServer to display features styles
  
Be sure you have:
  - GNU Make: https://www.gnu.org/software/make/
  - Docker: https://www.docker.com/
  - Docker-compoe: https://docs.docker.com/compose/

Then run simply: `make run`

You can now show predefined mapfiles at this url:

```
http://localhost:8380/mapserv?service=wms&version=1.3.0&request=getmap&bbox=46.4,6.4,47.2,7.8&layers=line_simple_line&width=1200&height=800&format=image/jpeg&CRS=EPSG:4326
```

Set the `layers` param to display other layers (from layers defined in /data/mapfiles).
