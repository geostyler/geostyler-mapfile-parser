import { parse } from './mapfile2js/parse';
import {
  StyleParser,
  Style,
  Rule,
  Symbolizer,
  PointSymbolizer,
  MarkSymbolizer,
  Filter,
  ScaleDenominator,
  LineSymbolizer,
  FillSymbolizer,
  RasterSymbolizer,
} from 'geostyler-style';

export type ConstructorParams = {};

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
   * Get the name for the Style from the Mapfile Object. Returns the GROUP value of the LAYER
   * if defined or the NAME value of the LAYER if defined or an empty string.
   *
   * @param {object} mapfileObject The Mapfile object representation (created with xml2js)
   * @return {string} The name to be used for the GeoStyler Style Style
   */
  getStyleNameFromMapfileObject(mapfileObject: any): string {
    const layerGroup: string = mapfileObject.map.layer[0].group;
    const layerName: string = mapfileObject.map.layer[0].name;
    return layerGroup ? layerGroup : layerName ? layerName : '';
  }

  /**
   * Get the GeoStyler-Style Filter from an Mapfile Expression.
   *
   * @param {string} mapfileExpression The Mapfile Expression
   * @return {Filter} The GeoStyler-Style Filter
   */
  getFilterFromExpression(mapfileExpression: string): Filter | undefined {
    // TODO: expression tokenizer, lexer, parser ???
    if (mapfileExpression) {
      console.warn(`Not able to parse expression: ${mapfileExpression}`);
    }

    return;
  }

  /**
   * Get the GeoStyler-Style ScaleDenominator from an Mapfile Class.
   *
   * @param {object} mapfileClass The Mapfile Class
   * @return {ScaleDenominator} The GeoStyler-Style ScaleDenominator
   */
  getScaleDenominatorFromClass(mapfileClass: any): ScaleDenominator | undefined {
    const scaleDenominator: ScaleDenominator = {} as ScaleDenominator;

    scaleDenominator.min = parseFloat(mapfileClass.minscaledenom);

    scaleDenominator.max = parseFloat(mapfileClass.maxscaledenom);

    if (scaleDenominator.min || scaleDenominator.max) {
      return scaleDenominator;
    } else {
      return;
    }
  }

  /**
   * Get the GeoStyler-Style MarkSymbolizer from an Mapfile Style
   *
   * @param {object} styleParameters The Mapfile Style Parameters
   * @return {MarkSymbolizer} The GeoStyler-Style MarkSymbolizer
   */
  getMarkSymbolizerFromMapfileStyle(styleParameters: any): MarkSymbolizer {
    const markSymbolizer: MarkSymbolizer = {
      kind: 'Mark',
    } as MarkSymbolizer;

    markSymbolizer.color = styleParameters.color;

    if (!markSymbolizer.color) {
      markSymbolizer.opacity = 0;
    } else {
      markSymbolizer.opacity = parseFloat(styleParameters.opacity) / 100;
    }

    // markSymbolizer.fillOpacity = TODO from symbol?;

    markSymbolizer.rotate = parseFloat(styleParameters.angle);

    markSymbolizer.radius = parseFloat(styleParameters.size) / 2;

    markSymbolizer.strokeColor = styleParameters.color;

    markSymbolizer.strokeWidth = styleParameters.width;

    markSymbolizer.strokeOpacity = markSymbolizer.opacity;

    return markSymbolizer;
  }

  /**
   * Get the GeoStyler-Style PointSymbolizer from an Mapfile Style.
   *
   * @param {object} styleParameters The Mapfile Style Parameters
   * @return {PointSymbolizer} The GeoStyler-Style PointSymbolizer
   */
  getPointSymbolizerFromMapfileStyle(styleParameters: any): PointSymbolizer {
    let pointSymbolizer = {} as PointSymbolizer;

    // if (externalGraphic) {

    //   pointSymbolizer = this.getIconSymbolizerFromMapfileStyle(mapfileSymbolizer);

    // } else {

    pointSymbolizer = this.getMarkSymbolizerFromMapfileStyle(styleParameters);
    // }
    return pointSymbolizer;
  }

  /**
   * Get the GeoStyler-Style LineSymbolizer from an Mapfile Style.
   *
   * @param {object} styleParameters The Mapfile Style Parameters
   * @return {LineSymbolizer} The GeoStyler-Style LineSymbolizer
   */
  getLineSymbolizerFromMapfileStyle(styleParameters: any): LineSymbolizer {
    const lineSymbolizer: LineSymbolizer = {
      kind: 'Line',
    } as LineSymbolizer;

    lineSymbolizer.color = styleParameters.color;

    if (!lineSymbolizer.color) {
      lineSymbolizer.opacity = 0;
    } else {
      lineSymbolizer.opacity = parseFloat(styleParameters.opacity) / 100;
    }

    lineSymbolizer.width = parseFloat(styleParameters.width);

    const linejoin = styleParameters.linejoin;
    if (!linejoin) {
      lineSymbolizer.join = 'round'; //  mapserver default
    } else if (linejoin !== 'none') {
      lineSymbolizer.join = linejoin;
    }

    const linecap = styleParameters.linecap;
    lineSymbolizer.cap = linecap;

    const pattern = styleParameters.pattern;
    if (pattern) {
      lineSymbolizer.dasharray = pattern.split(' ').map((a: string) => parseFloat(a));
    }

    const initialgap = styleParameters.initialgap;
    if (initialgap) {
      lineSymbolizer.dashOffset = parseFloat(initialgap);
    }

    // TODO: derive from Symbol
    // lineSymbolizer.graphicStroke = this.getPointSymbolizerFromMapfileStyle(
    //   styleParameters.Stroke[0].GraphicStroke[0]
    // );

    // lineSymbolizer.graphicFill = this.getPointSymbolizerFromMapfileStyle(
    //   styleParameters.Stroke[0].GraphicFill[0]
    // );

    return lineSymbolizer;
  }

  /**
   * Get the GeoStyler-Style FillSymbolizer from an Mapfile Style.
   *
   * PolygonSymbolizer Stroke is just partially supported.
   *
   * @param {object} styleParameters The Mapfile Style Parameters
   * @return {FillSymbolizer} The GeoStyler-Style FillSymbolizer
   */
  getFillSymbolizerFromMapfileStyle(styleParameters: any): FillSymbolizer {
    const fillSymbolizer: FillSymbolizer = {
      kind: 'Fill',
    } as FillSymbolizer;

    fillSymbolizer.color = styleParameters.color;

    if (!fillSymbolizer.color) {
      fillSymbolizer.opacity = 0;
    } else {
      fillSymbolizer.opacity = parseFloat(styleParameters.opacity) / 100;
    }

    fillSymbolizer.outlineColor = styleParameters.outlinecolor;

    fillSymbolizer.outlineWidth = parseFloat(styleParameters.outlinewidth);

    fillSymbolizer.outlineOpacity = fillSymbolizer.opacity;

    const pattern = styleParameters.pattern;
    if (pattern) {
      fillSymbolizer.outlineDasharray = pattern.split(' ').map((a: string) => parseFloat(a));
    }

    // TODO: const graphicFill;

    // if (styleParameters.symbol) {
    //   fillSymbolizer.graphicFill = this.getPointSymbolizerFromMapfileStyle(
    //     graphicFill
    //   );
    // }

    return fillSymbolizer;
  }

  /**
   * Get the GeoStyler-Style RasterSymbolizer from a Mapfile Style.
   *
   * @param {object} styleParameters The Mapfile Style
   */
  getRasterSymbolizerFromMapfileStyle(styleParameters: any): RasterSymbolizer {
    const rasterSymbolizer: RasterSymbolizer = {
      kind: 'Raster',
    } as RasterSymbolizer;

    rasterSymbolizer.opacity = parseFloat(styleParameters.opacity) / 100; // scale?

    return rasterSymbolizer;
  }

  /**
   * Get the GeoStyler-Style Symbolizers from an Mapfile Style.
   *
   * @param {object} mapfileStyle The Mapfile Style
   * @return {Symbolizer[]} The GeoStyler-Style Symbolizer Array
   */
  getSymbolizersFromStyle(mapfileStyle: any, mapfileLayerType: any): Symbolizer[] {
    const symbolizers = [] as Symbolizer[];
    mapfileStyle.forEach((styleParameters: any) => {
      let symbolizer: any;
      switch (mapfileLayerType) {
      case 'point':
        symbolizer = this.getPointSymbolizerFromMapfileStyle(styleParameters);
        break;
      case 'line':
        symbolizer = this.getLineSymbolizerFromMapfileStyle(styleParameters);
        break;
        // case 'TextSymbolizer':
        // TODO: Mapfile LABEL
        //   symbolizer = this.getTextSymbolizerFromMapfileLable(labelParameters);
        // break;
      case 'polygon':
        symbolizer = this.getFillSymbolizerFromMapfileStyle(styleParameters);
        break;
      case 'raster':
        symbolizer = this.getRasterSymbolizerFromMapfileStyle(styleParameters);
        break;
      case 'chart':
        // maybe not used by swisstopo
        break;
      case 'circle':
        // maybe not used by swisstopo
        break;
      case 'query':
        // maybe not used by swisstopo
        break;
      default:
        throw new Error('Failed to parse SymbolizerKind from MapfileStyle');
      }
      symbolizers.push(symbolizer);
    });

    return symbolizers;
  }

  /**
   * Get the GeoStyler-Style Rule from an Mapfile Object.
   *
   * @param {object} mapfileObject The Mapfile object representation
   * @return {Rule} The GeoStyler-Style Rule
   */
  getRulesFromMapfileObject(mapfileObject: any): Rule[] {
    const mapfileLayers = mapfileObject.map.layer;

    const rules: Rule[] = [];
    mapfileLayers.forEach((mapfileLayer: any) => {
      const mapfileLayerType = mapfileLayer.type.toLowerCase();
      mapfileLayer.class.forEach((mapfileClass: any) => {
        const filter: Filter | undefined = this.getFilterFromExpression(mapfileClass.expression);
        const scaleDenominator: ScaleDenominator | undefined = this.getScaleDenominatorFromClass(mapfileClass);
        const symbolizers: Symbolizer[] = this.getSymbolizersFromStyle(mapfileClass.style, mapfileLayerType);
        const name = mapfileLayer.group ? `${mapfileLayer.group}.${mapfileClass.name}` : mapfileClass.name;
        const rule = { name } as Rule;
        if (filter) {
          rule.filter = filter;
        }
        if (scaleDenominator) {
          rule.scaleDenominator = scaleDenominator;
        }
        if (symbolizers) {
          rule.symbolizers = symbolizers;
        }
        rules.push(rule);
      });
    });

    return rules;
  }

  /**
   * Get the GeoStyler-Style Style from an Mapfile Object.
   *
   * @param {object} mapfileObject The Mapfile object representation
   * @return {Style} The GeoStyler-Style Style
   */
  mapfileObjectToGeoStylerStyle(mapfileObject: object): Style {
    const rules = this.getRulesFromMapfileObject(mapfileObject);
    const name = this.getStyleNameFromMapfileObject(mapfileObject);
    return {
      name,
      rules,
    };
  }

  /**
   * The readStyle implementation of the GeoStyler-Style StyleParser interface.
   * It reads a mapfile as a string and returns a Promise.
   * The Promise itself resolves with a GeoStyler-Style Style.
   *
   * @param  {string} mapfileString A Mapfile as a string.
   * @return {Promise} The Promise resolving with the GeoStyler-Style Style
   */
  readStyle(mapfileString: string): Promise<Style> {
    return new Promise<Style>((resolve, reject) => {
      try {
        const mapfileObject: object = parse(mapfileString);
        const geoStylerStyle: Style = this.mapfileObjectToGeoStylerStyle(mapfileObject);
        console.log(JSON.stringify(geoStylerStyle, null, 2));
        resolve(geoStylerStyle);
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
}

export default MapfileStyleParser;
