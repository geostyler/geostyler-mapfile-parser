import * as fs from 'fs';

import MapfileParser from './MapfileStyleParser';
import SLDParser from "geostyler-sld-parser";
import QGISParser from "geostyler-qgis-parser";


const mapfileParser = new MapfileParser();
const sldParser = new SLDParser();
const qgisParser = new QGISParser();


const mfToSld = async (mf: any) => {
    const geostylerStyle = await mapfileParser.readMultiStyles(mf);
    const sldStyle = await sldParser.writeStyle(geostylerStyle[1]);
    console.log(sldStyle);
    return sldStyle;
};

const mfToQgis = async (mf: any) => {
    const geostylerStyle = await mapfileParser.readMultiStyles(mf);
    const qgisStyle = await qgisParser.writeStyle(geostylerStyle[1]);
    console.log(qgisStyle);
    return qgisStyle;
};

const mapfile = fs.readFileSync('./data/mapfiles/real_samples/ch.bazl.luftfahrthindernis_point.map', 'utf8');

mfToSld(mapfile);
mfToQgis(mapfile);

//console.log(qgisFile);
