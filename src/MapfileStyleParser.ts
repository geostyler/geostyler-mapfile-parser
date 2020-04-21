const mapfile2js = require('./mapfile2js/index'); // eslint-disable-line
const parse = mapfile2js.parse;
import {
  StyleParser,
  Style
} from 'geostyler-style';

export type ConstructorParams = {
};

/**
 * This parser can be used with the GeoStyler.
 * It implements the GeoStyler-Style StyleParser interface.
 *
 * @class MapfileStyleParser
 * @implements StyleParser
 */
export class MapfileStyleParser implements StyleParser {

  /**
   * The name of the Mapfile Style Parser.
   */
  public static title = 'Mapfile Style Parser';

  title = 'Mapfile Style Parser';

  constructor(opts?: ConstructorParams) {
    Object.assign(this, opts);
  }

  /**
   * The readStyle implementation of the GeoStyler-Style StyleParser interface.
   * It reads a mapfile as a string and returns a Promise.
   * The Promise itself resolves with a GeoStyler-Style Style.
   *
   * @param mapfile A Mapfile as a string.
   * @return The Promise resolving with the GeoStyler-Style Style
   */
  readStyle(mapfile: string): Promise<Style> {
    return new Promise<Style>((resolve, reject) => {
      try {
        const mapfileObject: { [s: string]: any }[] = parse(mapfile);
        const geostylerStyle = this.mapfileObjectToGeoStylerStyle(mapfileObject);
        resolve(geostylerStyle);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * The writeStyle implementation of the GeoStyler-Style StyleParser interface.
   * It reads a GeoStyler-Style Style and returns a Promise.
   * The Promise itself resolves with a Mapfile string.
   *
   * @param {Style} geoStylerStyle A GeoStyler-Style Style.
   * @return {Promise} The Promise resolving with the Mapfile as a string.
   */
  writeStyle(geoStylerStyle: Style): Promise<string> {
    return new Promise<any>((resolve, reject) => {
      try {
        const mapfileString = 'TODO';
        resolve(mapfileString);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * TODO
   */
  mapfileObjectToGeoStylerStyle(mapfileObject: { [s: string]: any }[]): Style {
    console.log(mapfileObject);
    const geostylerStyle: Style = {
      name: 'TODO',
      rules: []
    };
    return geostylerStyle;
  }
}

export default MapfileStyleParser;
