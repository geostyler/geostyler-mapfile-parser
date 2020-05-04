import { parse } from './mapfile2js/parse';
import { rgbToHex } from './Useful';
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
  WellKnownName,
  NegationOperator,
  ComparisonOperator,
  CombinationOperator,
  NegationFilter,
  CombinationFilter,
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
   * Get the GeoStyler-Style Filter from an Mapfile EXPRESSION and CLASSITEM.
   *
   * @param {object} mapfileClass The Mapfile Class
   * @return {Filter} The GeoStyler-Style Filter
   */
  getFilterFromClassItem(mapfileClass: any): Filter | null {
    const classItem: string = mapfileClass.classitem;
    console.assert(mapfileClass.classitem, 'Mapfile CLASSITEM undefined!');
    const expression: string = mapfileClass.expression;
    switch (expression.charAt(0)) {
    case '"':
      return ['==' as ComparisonOperator, mapfileClass.classitemclassItem, expression];
    case '/':
      return ['FN_strMatches', classItem, expression];
    case '{':
      return [
        'FN_strMatches',
        classItem,
        `/${expression.substring(1, expression.length - 1).replace(',', '|')}/`,
      ];
    }
    console.error(`Unable to get Filter from CLASSITEM: ${mapfileClass}`);
    return null;
  }

  /**
   * Get the GeoStyler-Style Filter from an Mapfile EXPRESSION.
   *
   * @param {string} attribute The Mapfile Expression Attribute
   * @param {string} operator The Mapfile Expression Operator
   * @param {string} value The Mapfile Expression Value
   * @return {Filter} The GeoStyler-Style Filter
   */
  getFilterFromAttributeValueComparison(attribute: string, operator: string, value: string): Filter | null {
    // substitude operator variations (may be rewritten using a map)
    operator = operator
      .replace(/^=$/, '==')
      .replace('eq', '==')
      .replace('ne', '!=')
      .replace('lt', '<')
      .replace('gt', '>')
      .replace('le', '<=')
      .replace('ge', '>=');

    // TODO: assert there are no qotes in strings, either of!

    switch (operator) {
    case '~': {
      const valueOrNumber: string | number = /^[-\d]/.test(value) ? parseFloat(value) : value;
      return ['FN_strMatches', attribute, valueOrNumber];
    }
    case '~*':
      return ['FN_strMatches', attribute, `${value}i`];
    case 'IN':
      return ['FN_strMatches', attribute, `/${value.substring(1, value.length - 1).replace(',', '|')}/`];
    case '==':
    case '!=':
    case '<':
    case '>':
    case '<=':
    case '>=': {
      const valueOrNumber: string | number = /^[-\d]/.test(value) ? parseFloat(value) : value;
      return [operator as ComparisonOperator, attribute, valueOrNumber];
    }
    default:
      console.error(`Unknow comparison operator: ${operator}`);
      return null;
    }
  }

  /**
   * Get the GeoStyler-Style Filter from an Mapfile EXPRESSION.
   *
   * @param {string} mapfileExpression The Mapfile Expression
   * @return {Filter} The GeoStyler-Style Filter
   */
  getFilterFromMapfileExpression(mapfileExpression: string): Filter | null {
    // remove surrounding parantheses
    if (/^\(.+\)$/.test(mapfileExpression)) {
      mapfileExpression = mapfileExpression.replace(/(^\(\s*|\s*\)$)/g, '');
    }

    // capture nested expressions
    if (/^\(/.test(mapfileExpression)) {
      // split up nested expression
      const nestedExpressions = this.splitNestedExpression(mapfileExpression);

      // extract operator
      let operator = mapfileExpression.substring(
        nestedExpressions[0].length,
        mapfileExpression.length - nestedExpressions[1].length
      );
      operator = operator.replace('AND', '&&').replace('OR', '||').trim();

      return [
        operator as CombinationOperator,
        this.getFilterFromMapfileExpression(nestedExpressions[0]),
        this.getFilterFromMapfileExpression(nestedExpressions[1]),
      ] as CombinationFilter;
    }

    // capture negation
    if (/^(!|NOT)/.test(mapfileExpression)) {
      mapfileExpression = mapfileExpression.replace(/^(!|NOT)\s*/, '');

      return [
        '!' as NegationOperator,
        this.getFilterFromMapfileExpression(mapfileExpression),
      ] as NegationFilter;
    }

    // get filter from common expression "[attribute] operator value"
    if (/^['"]?\[/.test(mapfileExpression)) {
      // get attribute
      const attributeMatch = mapfileExpression.match(/^['"]?\[([^\]]+)\]['"]?\s*/);
      mapfileExpression = mapfileExpression.replace(/^['"]?\[[^\]]+\]['"]?\s*/, '');
      // get operator
      const operator = mapfileExpression.split(/\s/)[0];
      mapfileExpression = mapfileExpression.replace(/^[^\s]+\s/, '');
      // get literal, number or regex
      const valueMatch = mapfileExpression.match(/^['"]?([^)'"]+)['"]?\s*/);
      mapfileExpression = mapfileExpression.replace(/^['"]?[^)'"]+['"]?\s*/, '');

      if (attributeMatch && operator && valueMatch) {
        return this.getFilterFromAttributeValueComparison(attributeMatch[1], operator, valueMatch[1]);
      } else {
        console.error(`Unable to parse common expression: ${attributeMatch}, ${operator}, ${valueMatch}`);
      }
    }

    // TODO: implement logical combination expression relying on operator precedence

    console.assert(mapfileExpression.length === 0, `Mapfile expression leftovers: ${mapfileExpression}`);

    return null;
  }

  /**
   * Get the GeoStyler-Style Filter from a Mapfile CLASS.
   *
   * @param {object} mapfileClass The Mapfile Class
   * @return {Filter} The GeoStyler-Style Filter
   */
  getFilterFromMapfileClass(mapfileClass: any): Filter | null {
    const expression: string = mapfileClass.expression;
    if (!expression) {
      return null;
    }

    // assert expression contains no string functions, arithmetic operations or spatial components
    if (/tostring \(|commify \(|upper \(|lower \(|initcap \(|firstcap \(|length \(/.test(expression)) {
      console.error(`Not able to parse string function: ${expression}`);
    } else if (/round \(| \+ | - | \* | \/ | \^ | % /.test(expression)) {
      console.error(`Not able to parse arithmetic operator or function: ${expression}`);
      return null;
    } else if (
      [
        'intersects (',
        'disjoint (',
        'touches (',
        'overlaps (',
        'crosses (',
        'within (',
        'contains (',
        'dwithin (',
        'beyond (',
        'area (',
        'fromtext (',
        'buffer (',
        'difference (',
      ].some((spatialComponent) => expression.includes(spatialComponent))
    ) {
      console.error(`Not able to parse spatial expression: ${expression}`);
      return null;
    } else if (expression.includes('´')) {
      console.error(`Not able to parse temporal expression: ${expression}`);
      return null;
    }

    // assert expression does not contain escaped quotes
    console.assert(
      !/\\'|\\"/.test(expression),
      `Mapfile expression may contain escaped quote: ${expression}`
    );

    // get filter from expression value targeting CLASSITEM
    if (/^["/{]/.test(expression)) {
      return this.getFilterFromClassItem(mapfileClass);
    }

    // assert expression starts and ends with a bracket
    console.assert(/^\(.+\)$/.test(expression), `Malformed expression! ${expression}`);

    // get filter by expression parsing
    return this.getFilterFromMapfileExpression(expression);
  }

  /**
   * Get the GeoStyler-Style ScaleDenominator from an Mapfile CLASS.
   *
   * @param {object} mapfileClass The Mapfile Class
   * @return {ScaleDenominator} The GeoStyler-Style ScaleDenominator
   */
  getScaleDenominatorFromClass(mapfileClass: any): ScaleDenominator | undefined {
    const scaleDenominator = {} as ScaleDenominator;

    scaleDenominator.min = parseFloat(mapfileClass.minscaledenom);

    scaleDenominator.max = parseFloat(mapfileClass.maxscaledenom);

    if (scaleDenominator.min || scaleDenominator.max) {
      return scaleDenominator;
    } else {
      return;
    }
  }

  /**
   * Get the GeoStyler-Style MarkSymbolizer from an Mapfile STYLE
   *
   * @param {object} styleParameters The Mapfile Style Parameters
   * @return {MarkSymbolizer} The GeoStyler-Style MarkSymbolizer
   */
  getMarkSymbolizerFromMapfileStyle(styleParameters: any): MarkSymbolizer {
    const markSymbolizer = { kind: 'Mark' } as MarkSymbolizer;

    markSymbolizer.color = rgbToHex(styleParameters.color);

    if (!markSymbolizer.color) {
      markSymbolizer.opacity = 0;
    } else {
      markSymbolizer.opacity = parseFloat(styleParameters.opacity) / 100;
    }

    // markSymbolizer.fillOpacity = TODO from symbol?;

    markSymbolizer.rotate = parseFloat(styleParameters.angle);

    markSymbolizer.radius = parseFloat(styleParameters.size) / 2;

    markSymbolizer.strokeColor = rgbToHex(styleParameters.color);

    markSymbolizer.strokeWidth = styleParameters.width;

    markSymbolizer.strokeOpacity = markSymbolizer.opacity;

    // TODO: Convert hack for demo to proper SYMBOL handling!
    const wellKnownName = styleParameters.symbol;
    switch (wellKnownName) {
    case 'circle':
    case 'square':
    case 'triangle':
    case 'star':
    case 'cross':
    case 'x': {
      const wkn = wellKnownName.charAt(0).toUpperCase() + wellKnownName.slice(1);
      markSymbolizer.wellKnownName = wkn as WellKnownName;
      break;
    }
    }

    return markSymbolizer;
  }

  /**
   * Get the GeoStyler-Style PointSymbolizer from an Mapfile STYLE.
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
   * Get the GeoStyler-Style LineSymbolizer from an Mapfile STYLE.
   *
   * @param {object} styleParameters The Mapfile Style Parameters
   * @return {LineSymbolizer} The GeoStyler-Style LineSymbolizer
   */
  getLineSymbolizerFromMapfileStyle(styleParameters: any): LineSymbolizer {
    const lineSymbolizer = { kind: 'Line' } as LineSymbolizer;

    lineSymbolizer.color = rgbToHex(styleParameters.color);

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
   * Get the GeoStyler-Style FillSymbolizer from an Mapfile STYLE.
   *
   * PolygonSymbolizer Stroke is just partially supported.
   *
   * @param {object} styleParameters The Mapfile Style Parameters
   * @return {FillSymbolizer} The GeoStyler-Style FillSymbolizer
   */
  getFillSymbolizerFromMapfileStyle(styleParameters: any): FillSymbolizer {
    const fillSymbolizer = { kind: 'Fill' } as FillSymbolizer;

    fillSymbolizer.color = rgbToHex(styleParameters.color);

    if (!fillSymbolizer.color) {
      fillSymbolizer.opacity = 0;
    } else {
      fillSymbolizer.opacity = parseFloat(styleParameters.opacity) / 100;
    }

    fillSymbolizer.outlineColor = rgbToHex(styleParameters.outlinecolor);

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
   * Get the GeoStyler-Style RasterSymbolizer from a Mapfile STYLE.
   *
   * @param {object} styleParameters The Mapfile Style
   */
  getRasterSymbolizerFromMapfileStyle(styleParameters: any): RasterSymbolizer {
    const rasterSymbolizer = { kind: 'Raster' } as RasterSymbolizer;

    rasterSymbolizer.opacity = parseFloat(styleParameters.opacity) / 100; // scale?

    return rasterSymbolizer;
  }

  /**
   * Get the GeoStyler-Style Symbolizers from an Mapfile STYLE.
   *
   * @param {object} mapfileStyle The Mapfile Style
   * @param {string} mapfileLayerType The Mapfile Layer Type
   * @return {Symbolizer[]} The GeoStyler-Style Symbolizer Array
   */
  getSymbolizersFromStyle(mapfileStyle: any, mapfileLayerType: string): Symbolizer[] {
    const symbolizers = [] as Symbolizer[];
    mapfileStyle.forEach((styleParameters: any) => {
      let symbolizer: any;
      switch (mapfileLayerType.toLowerCase()) {
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
      const mapfileLayerType: string = mapfileLayer.type;

      mapfileLayer.class.forEach((mapfileClass: any) => {
        const filter = this.getFilterFromMapfileClass(mapfileClass);
        const scaleDenominator = this.getScaleDenominatorFromClass(mapfileClass);
        const symbolizers = this.getSymbolizersFromStyle(mapfileClass.style, mapfileLayerType);
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


  /**
   * Splits up a Mapfile Expression into its two top level Expressions
   *
   * @param {string} mapfileExpression A Mapfile Expression.
   * @return {Array<string>} The two top level expressions.
   */
  private splitNestedExpression(mapfileExpression: string): Array<string> {
    // split up nested logical combination expression leveraging parantheses
    const nestedExpressions: Array<string> = [];
    
    let index = 0;
    let fromIndex = 0;
    let parantheseCount = 0;
    
    for (const char of mapfileExpression) {
      switch (char) {
      case '(':
        fromIndex = parantheseCount === 0 ? index : fromIndex;
        parantheseCount++;
        break;
      case ')':
        parantheseCount--;
        if (parantheseCount === 0) {
          const operators: string = nestedExpressions[0]
            ? mapfileExpression.substring(nestedExpressions[0].length, fromIndex)
            : mapfileExpression.substring(0, fromIndex);
          const negationOperator: string = operators.replace(/\s*(AND|&&|OR|\|\|)\s*/, '');
          nestedExpressions.push(negationOperator + mapfileExpression.substring(fromIndex, index + 1));
        }
        break;
      }
      index++;
    }
    return nestedExpressions;
  }
}

export default MapfileStyleParser;
