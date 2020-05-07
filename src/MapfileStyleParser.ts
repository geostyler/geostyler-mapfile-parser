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
  IconSymbolizer,
  TextSymbolizer,
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
   * @param {string} mapfileClassItem The Mapfile Class
   * @return {Filter} The GeoStyler-Style Filter
   */
  getFilterFromClassItem(mapfileClass: any, mapfileClassItem: string): Filter | null {
    console.assert(mapfileClassItem, 'Mapfile CLASSITEM undefined!');

    const expression: string = mapfileClass.expression;
    switch (expression.charAt(0)) {
    case '"':
      return ['==' as ComparisonOperator, mapfileClassItem, expression.substring(1, expression.length - 1)];
    case '/':
      return ['*=', ['FN_strMatches', mapfileClassItem, expression], true];
    case '{':
      return [
        '*=',
        [
          'FN_strMatches',
          mapfileClassItem,
          `/(${expression.substring(1, expression.length - 1).replace(/,/g, '|')})/`,
        ],
        true,
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
      return ['*=', ['FN_strMatches', attribute, valueOrNumber], true];
    }
    case '~*':
      return ['*=', ['FN_strMatches', attribute, `${value}i`], true];
    case 'IN':
      return [
        '*=',
        ['FN_strMatches', attribute, `/${value.substring(1, value.length - 1).replace(',', '|')}/`],
        true,
      ];
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
  getFilterFromMapfileClass(mapfileClass: any, mapfileLayerClassItem: string): Filter | null {
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
      return this.getFilterFromClassItem(mapfileClass, mapfileLayerClassItem);
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
    } else if (styleParameters.opacity) {
      markSymbolizer.opacity = parseFloat(styleParameters.opacity) / 100;
    }

    // markSymbolizer.fillOpacity = TODO from symbol?;
    if (styleParameters.angle) {
      markSymbolizer.rotate = parseFloat(styleParameters.angle);
    }

    if (styleParameters.size) {
      markSymbolizer.radius = parseFloat(styleParameters.size) / 2;
    }

    if (styleParameters.outlinecolor) {
      markSymbolizer.strokeColor = rgbToHex(styleParameters.outlinecolor);
      if (markSymbolizer.opacity) {
        markSymbolizer.strokeOpacity = markSymbolizer.opacity;
      }
    }

    if (styleParameters.width) {
      markSymbolizer.strokeWidth = parseFloat(styleParameters.width);
    }

    // TODO: Abstract to SVG and drop WellKnownName!
    const symbolType = styleParameters.symbol.type.toLowerCase();
    switch (symbolType) {
    case 'ellipse': {
      const xy = styleParameters.symbol.points[0].split(' ');
      if (xy[0] === xy[1]) {
        markSymbolizer.wellKnownName = 'Circle' as WellKnownName;
      }
      break;
    }
    case 'square':
    case 'triangle':
    case 'star':
    case 'cross':
    case 'x': {
      break;
    }
    }

    return markSymbolizer;
  }

  /**
   * Get the GeoStyler-Style IconSymbolizer from an Mapfile Style
   *
   * @param {object} styleParameters The Mapfile Style
   * @return {IconSymbolizer} The GeoStyler-Style IconSymbolizer
   */
  getIconSymbolizerFromMapfileStyle(styleParameters: any): IconSymbolizer {
    const iconSymbolizer: IconSymbolizer = {
      kind: 'Icon',
      image: styleParameters.symbol.image,
    } as IconSymbolizer;

    if (styleParameters.opacity) {
      iconSymbolizer.opacity = styleParameters.opacity;
    }
    if (styleParameters.size) {
      iconSymbolizer.size = parseFloat(styleParameters.size);
    }
    if (styleParameters.angle) {
      iconSymbolizer.rotate = parseFloat(styleParameters.angle);
    }
    if (styleParameters.symbol.anchorpoint) {
      const anchorpoint: Array<number> = styleParameters.symbol.anchorpoint
        .split(' ')
        .map((a: string) => Math.round(parseFloat(a) * 2) / 2);
      const anchorpointMap = {
        '0.5 0.5': 'center',
        '0 0.5': 'left',
        '1 0.5': 'right',
        '0.5 0': 'top',
        '0.5 1': 'bottom',
        '0 0': 'top-left',
        '1 0': 'top-right',
        '0 1': 'bottom-left',
        '1 1': 'bottom-right',
      };
      iconSymbolizer.anchor = anchorpointMap[`${anchorpoint[0]} ${anchorpoint[1]}`];
    }

    return iconSymbolizer;
  }

  /**
   * Get the GeoStyler-Style TextSymbolizer from an Mapfile LABEL.
   *
   * @param {object} mapfileLabel The Mapfile Label Parameters
   * @return {TextSymbolizer} The GeoStyler-Style TextSymbolizer
   */
  getTextSymbolizerFromMapfileLabel(labelParameters: any): TextSymbolizer {
    const textSymbolizer: TextSymbolizer = { kind: 'Text' } as TextSymbolizer;

    const label = labelParameters.text;
    if (label) {
      textSymbolizer.label = label.replace('[', '{{').replace(']', '}}');
    }
    if (labelParameters.color) {
      textSymbolizer.color = rgbToHex(labelParameters.color);
    }
    if (labelParameters.offset) {
      textSymbolizer.offset = labelParameters.offset.split(' ').map((a: string) => parseFloat(a));
    }
    if (labelParameters.angle) {
      textSymbolizer.rotate = parseFloat(labelParameters.angle);
    }

    if (labelParameters.align) {
      textSymbolizer.justify = labelParameters.align;
    }

    if (labelParameters.buffer) {
      textSymbolizer.padding = parseFloat(labelParameters.buffer);
    }

    if (labelParameters.position) {
      const anchorpointMap = {
        cc: 'center',
        auto: 'center', // TODO: fixme
        cl: 'left',
        cr: 'right',
        uc: 'top',
        lc: 'bottom',
        ul: 'top-left',
        ur: 'top-right',
        ll: 'bottom-left',
        lr: 'bottom-right',
      };
      textSymbolizer.anchor = anchorpointMap[labelParameters.position.toLowerCase()];
    }

    if (labelParameters.font) {
      // TODO: map fonts from FONTSET
      textSymbolizer.font = [labelParameters.font];
    }

    if (labelParameters.size) {
      // TODO: deal with bitmap font sizes
      if (!(labelParameters.size in ['tiny', 'small', 'medium', 'large', 'giant'])) {
        textSymbolizer.size = parseFloat(labelParameters.size);
      }
    }

    return textSymbolizer;
  }

  /**
   * Get the GeoStyler-Style TextSymbolizer from an Mapfile STYLE.
   *
   * @param {object} styleParameters The Mapfile Style Parameters
   * @return {TextSymbolizer} The GeoStyler-Style TextSymbolizer
   */
  getTextSymbolizerFromMapfileStyle(styleParameters: any): TextSymbolizer {
    const textSymbolizer: TextSymbolizer = { kind: 'Text' } as TextSymbolizer;

    const label = styleParameters.symbol.character;
    if (label) {
      textSymbolizer.label = label;
    }
    if (styleParameters.color) {
      textSymbolizer.color = styleParameters.color;
    }
    if (styleParameters.offset) {
      textSymbolizer.offset = styleParameters.offset.split(' ').map((a: string) => parseFloat(a));
    }
    if (styleParameters.angle) {
      textSymbolizer.rotate = parseFloat(styleParameters.angle);
    }
    if (styleParameters.font) {
      // TODO: map fonts from FONTSET
      textSymbolizer.font = [styleParameters.font];
    }

    return textSymbolizer;
  }

  /**
   * Get the GeoStyler-Style PointSymbolizer from an Mapfile STYLE.
   *
   * @param {object} styleParameters The Mapfile Style Parameters
   * @return {PointSymbolizer} The GeoStyler-Style PointSymbolizer
   */
  getPointSymbolizerFromMapfileStyle(styleParameters: any): PointSymbolizer {
    let pointSymbolizer = {} as PointSymbolizer;

    if (typeof styleParameters.symbol === 'object') {
      const symbolType = styleParameters.symbol.type;
      switch (symbolType) {
      case 'ellipse':
        // TODO: fixme handle as svg and drop WellKnownMark
        pointSymbolizer = this.getMarkSymbolizerFromMapfileStyle(styleParameters);
        break;
      case 'vector':
      case 'svg':
        // TODO: handle as svg
        break;
      case 'hatch':
        // TODO
        break;
      case 'pixmap':
        pointSymbolizer = this.getIconSymbolizerFromMapfileStyle(styleParameters);
        break;
      case 'truetype':
        pointSymbolizer = this.getTextSymbolizerFromMapfileStyle(styleParameters);
        break;
      default:
        break;
      }
    } else if (typeof styleParameters.symbol === 'string') {
      if (/^['"]?[^[]/.test(styleParameters.symbol)) {
        styleParameters.symbol = { image: styleParameters.symbol };
        pointSymbolizer = this.getIconSymbolizerFromMapfileStyle(styleParameters);
      } else {
        // TODO: handle attribute pixmaps
        console.error('Not able to deal with attribute pixmaps');
      }
    }
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

    if (styleParameters.color) {
      lineSymbolizer.color = rgbToHex(styleParameters.color);
    }

    if (!lineSymbolizer.color) {
      lineSymbolizer.opacity = 0;
    } else if (styleParameters.opacity) {
      lineSymbolizer.opacity = parseFloat(styleParameters.opacity) / 100;
    }

    if (styleParameters.width) {
      lineSymbolizer.width = parseFloat(styleParameters.width);
    }

    const linejoin = styleParameters.linejoin;
    if (!linejoin) {
      lineSymbolizer.join = 'round'; //  mapserver default
    } else if (linejoin !== 'none') {
      lineSymbolizer.join = linejoin;
    }

    if (styleParameters.linecap) {
      lineSymbolizer.cap = styleParameters.linecap;
    }

    if (styleParameters.pattern) {
      lineSymbolizer.dasharray = styleParameters.pattern.split(' ').map((a: string) => parseFloat(a));
    }

    if (styleParameters.initialgap) {
      lineSymbolizer.dashOffset = parseFloat(styleParameters.initialgap);
    }

    if (styleParameters.symbol) {
      lineSymbolizer.graphicStroke = this.getPointSymbolizerFromMapfileStyle(styleParameters);
    }

    // TODO: does Mapfile offer such a treat?
    // lineSymbolizer.graphicFill = this.getPointSymbolizerFromMapfileStyle(styleParameters);

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
    } else if (styleParameters.opacity) {
      fillSymbolizer.opacity = parseFloat(styleParameters.opacity) / 100;
    }

    if (styleParameters.outlinecolor) {
      fillSymbolizer.outlineColor = rgbToHex(styleParameters.outlinecolor);
    }

    if (styleParameters.outlinewidth) {
      fillSymbolizer.outlineWidth = parseFloat(styleParameters.outlinewidth);
    }

    if (fillSymbolizer.opacity) {
      fillSymbolizer.outlineOpacity = fillSymbolizer.opacity;
    }

    if (styleParameters.pattern) {
      fillSymbolizer.outlineDasharray = styleParameters.pattern.split(' ').map((a: string) => parseFloat(a));
    }

    if (styleParameters.symbol) {
      fillSymbolizer.graphicFill = this.getPointSymbolizerFromMapfileStyle(styleParameters);
    }

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
   * Get the GeoStyler-Style Symbolizers from an Mapfile CLASS.
   *
   * @param {object} mapfileClass The Mapfile Class
   * @param {string} mapfileLayerType The Mapfile Layer Type
   * @param {string} mapfileLayerLabelItem The Mapfile Layer Label Item
   * @return {Symbolizer[]} The GeoStyler-Style Symbolizer Array
   */
  getSymbolizersFromClass(
    mapfileClass: any,
    mapfileLayerType: string,
    mapfileLayerLabelItem: string
  ): Symbolizer[] {
    const symbolizers = [] as Symbolizer[];
    if (mapfileClass.style) {
      mapfileClass.style.forEach((styleParameters: any) => {
        let symbolizer: any;
        switch (mapfileLayerType.toLowerCase()) {
        case 'point':
          symbolizer = this.getPointSymbolizerFromMapfileStyle(styleParameters);
          break;
        case 'line':
          symbolizer = this.getLineSymbolizerFromMapfileStyle(styleParameters);
          break;
        case 'polygon':
          symbolizer = this.getFillSymbolizerFromMapfileStyle(styleParameters);
          break;
        case 'raster':
          symbolizer = this.getRasterSymbolizerFromMapfileStyle(styleParameters);
          break;
        case 'query':
          // layer can be queried but not drawn
          break;
        case 'chart':
        case 'circle':
        default:
          throw new Error('Unable to parse Symbolizer from Mapfile');
        }
        symbolizers.push(symbolizer);
      });
    }

    // TODO: Mapfile LABEL
    if (mapfileClass.label) {
      mapfileLayerLabelItem = mapfileClass.text ? mapfileClass.text : mapfileLayerLabelItem;
      mapfileClass.label.text = mapfileClass.label.text ? mapfileClass.label.text : mapfileLayerLabelItem;
      const symbolizer = this.getTextSymbolizerFromMapfileLabel(mapfileClass.label);
      symbolizers.push(symbolizer);
    }

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
      const mapfileLayerClassItem: string = mapfileLayer.classitem;
      const mapfileLayerLabelItem: string = mapfileLayer.labelitem;

      mapfileLayer.class.forEach((mapfileClass: any) => {
        const filter = this.getFilterFromMapfileClass(mapfileClass, mapfileLayerClassItem);
        const scaleDenominator = this.getScaleDenominatorFromClass(mapfileClass);
        const symbolizers = this.getSymbolizersFromClass(
          mapfileClass,
          mapfileLayerType,
          mapfileLayerLabelItem
        );
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
        // console.log(JSON.stringify(mapfileObject, null, 2));
        const geoStylerStyle: Style = this.mapfileObjectToGeoStylerStyle(mapfileObject);
        // console.log(JSON.stringify(geoStylerStyle, null, 2));
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
