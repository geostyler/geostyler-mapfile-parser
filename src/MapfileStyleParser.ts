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
   * Get the name for the Style from the Mapfile LAYER. Returns the GROUP value of the LAYER
   * if defined or the NAME value of the LAYER if defined or an empty string.
   *
   * @param {object} mapfileLayer The Mapfile Layer representation (created with xml2js)
   * @return {string} The name to be used for the GeoStyler Style Style
   */
  getStyleNameFromMapfileLayer(mapfileLayer: any): string {
    const layerGroup: string = mapfileLayer.group;
    const layerName: string = mapfileLayer.name;
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
   * Get the GeoStyler-Style ScaleDenominator from an Mapfile element (layer, class or style).
   * Returns null if there is no defined ScaleDenominator in the element.
   * @param {object} mapfileElement The Mapfile layer, class or style.
   * @return {ScaleDenominator} The GeoStyler-Style ScaleDenominator or null.
   */
  getScaleDenominator(mapfileElement: any): ScaleDenominator | null {
    const scaleDenominator = {} as ScaleDenominator;

    const maxScale = parseFloat(mapfileElement.maxscaledenom);
    if (!isNaN(maxScale)) {
      scaleDenominator.max = maxScale;
    }

    const minScale = parseFloat(mapfileElement.minscaledenom);
    if (!isNaN(minScale)) {
      scaleDenominator.min = minScale;
    }

    return (scaleDenominator.max !== undefined || scaleDenominator.min !== undefined) ? scaleDenominator : null;
  }

  /**
   * Update the given scaleDenominator with the scaleDenominator from the given mapfileElement;
   *
   * @param {object} mapfileElement The Mapfile layer, class or style.
   * @param {ScaleDenominator} scaleDenominator The scaleDenominator to try to override.
   * @return {scaleDenominator} A ScaleDenominator value or null.
   */
  updateScaleDenominator(mapfileElement: any,
                         scaleDenominator: ScaleDenominator | null): ScaleDenominator | null {
    const elementScaleDenominator = this.getScaleDenominator(mapfileElement);

    // No child scale - can't update, return the base scaleDenominator.
    if (!elementScaleDenominator) {
      return scaleDenominator;
    }

    // No parent scale - return the child scaleDenominator.
    if (!scaleDenominator) {
      return elementScaleDenominator;
    }

    const mergedScale = {} as ScaleDenominator;
    // Take max scale only if it's defined and take parent max scale only if it's bigger
    // (more restrictive) than the children one.
    if (scaleDenominator.max === undefined && elementScaleDenominator.max !== undefined) {
      mergedScale.max = elementScaleDenominator.max;
    } else if (scaleDenominator.max !== undefined && elementScaleDenominator.max === undefined) {
      mergedScale.max = scaleDenominator.max;
    } else if (scaleDenominator.max !== undefined && elementScaleDenominator.max !== undefined) {
      mergedScale.max = (scaleDenominator.max || 0) > (elementScaleDenominator.max || 0) ?
        scaleDenominator.max : elementScaleDenominator.max;
    }

    // Take mix scale only if it's defined and take parent min scale only if it's lesser
    // (more restrictive) than the children one.
    if (scaleDenominator.min === undefined && elementScaleDenominator.min !== undefined) {
      mergedScale.min = elementScaleDenominator.min;
    } else if (scaleDenominator.min !== undefined && elementScaleDenominator.min === undefined) {
      mergedScale.min = scaleDenominator.min;
    } else if (scaleDenominator.min !== undefined && elementScaleDenominator.min !== undefined) {
      mergedScale.min = (scaleDenominator.min || 0) < (elementScaleDenominator.min || 0) ?
        scaleDenominator.min : elementScaleDenominator.min;
    }

    return mergedScale;
  }

  /**
   * Get the GeoStyler-Style MarkSymbolizer from an Mapfile STYLE
   *
   * @param {object} styleParameters The Mapfile Style Parameters
   * @return {MarkSymbolizer} The GeoStyler-Style MarkSymbolizer
   */
  getMarkSymbolizerFromMapfileStyle(styleParameters: any): MarkSymbolizer {
    const markSymbolizer = { kind: 'Mark' } as MarkSymbolizer;

    if (!styleParameters.color) {
      markSymbolizer.visibility = false;
    }

    // markSymbolizer.fillOpacity = TODO from symbol?;

    if (styleParameters.size) {
      markSymbolizer.radius = parseFloat(styleParameters.size) / 2;
    }

    if (styleParameters.outlinecolor) {
      markSymbolizer.strokeColor = rgbToHex(styleParameters.outlinecolor);
      if (styleParameters.opacity) {
        markSymbolizer.strokeOpacity = parseFloat(styleParameters.opacity) / 100;
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

    if (styleParameters.size) {
      iconSymbolizer.size = parseFloat(styleParameters.size);
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
   * Get the GeoStyler-Style TextSymbolizer from an Mapfile LABEL/STYLE.
   *
   * @param {object} styleParameters The Mapfile Label/Style Parameters
   * @return {TextSymbolizer} The GeoStyler-Style TextSymbolizer
   */
  getTextSymbolizerFromMapfileStyle(styleParameters: any): TextSymbolizer {
    const textSymbolizer: TextSymbolizer = { kind: 'Text' } as TextSymbolizer;

    const label = styleParameters.text ? styleParameters.text : styleParameters.symbol.character;
    if (label) {
      textSymbolizer.label = label.replace('[', '{{').replace(']', '}}');
    }

    if (styleParameters.offset) {
      textSymbolizer.offset = styleParameters.offset.split(' ').map((a: string) => parseFloat(a));
    }

    if (styleParameters.align) {
      textSymbolizer.justify = styleParameters.align;
    }

    if (styleParameters.buffer) {
      textSymbolizer.padding = parseFloat(styleParameters.buffer);
    }

    if (styleParameters.position) {
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
      textSymbolizer.anchor = anchorpointMap[styleParameters.position.toLowerCase()];
    }

    if (styleParameters.font) {
      // TODO: map fonts from FONTSET
      textSymbolizer.font = [styleParameters.font];
    }

    if (styleParameters.size) {
      // TODO: deal with bitmap font sizes
      if (!(styleParameters.size in ['tiny', 'small', 'medium', 'large', 'giant'])) {
        textSymbolizer.size = parseFloat(styleParameters.size);
      }
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

    if (!styleParameters.color && !styleParameters.symbol) {
      lineSymbolizer.visibility = false;
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
      lineSymbolizer.graphicStroke = Object.assign(
        this.getPointSymbolizerFromMapfileStyle(styleParameters),
        this.getBaseSymbolizerFromStyle(styleParameters)
      );
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

    if (!styleParameters.color && !styleParameters.symbol) {
      fillSymbolizer.visibility = false;
    } else if (styleParameters.symbol) {
      fillSymbolizer.graphicFill = this.getPointSymbolizerFromMapfileStyle(styleParameters);
    }

    if (styleParameters.outlinecolor) {
      fillSymbolizer.outlineColor = rgbToHex(styleParameters.outlinecolor);
    }

    if (styleParameters.outlinewidth) {
      fillSymbolizer.outlineWidth = parseFloat(styleParameters.outlinewidth);
    }

    if (styleParameters.opacity) {
      fillSymbolizer.outlineOpacity = parseFloat(styleParameters.opacity) / 100;
    }

    if (styleParameters.pattern) {
      fillSymbolizer.outlineDasharray = styleParameters.pattern.split(' ').map((a: string) => parseFloat(a));
    }

    return fillSymbolizer;
  }

  /**
   * Get the GeoStyler-Style Basic Symbolizer Parameter from an Mapfile STYLE.
   *
   * @param {object} styleParameters The Mapfile Style
   * @return {Symbolizer} The GeoStyler-Style Symbolizer Parameters
   */
  getBaseSymbolizerFromStyle(styleParameters: any): any {
    const symbolizer: any = {};

    if (styleParameters.color) {
      symbolizer.color = rgbToHex(styleParameters.color);
    }
    if (styleParameters.opacity) {
      symbolizer.opacity = parseFloat(styleParameters.opacity) / 100;
    }
    if (styleParameters.angle) {
      symbolizer.rotate = parseFloat(styleParameters.angle);
    }
    return symbolizer;
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
    mapfileLayerLabelItem: string,
  ): Symbolizer[] {
    const symbolizers = [] as Symbolizer[];
    // Mapfile STYLE
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
          symbolizer = { kind: 'Raster' } as RasterSymbolizer;
          break;
        case 'query':
          // layer can be queried but not drawn
          break;
        case 'chart':
        case 'circle':
        default:
          throw new Error('Unable to parse Symbolizer from Mapfile');
        }
        const baseSymbolizer: any = this.getBaseSymbolizerFromStyle(styleParameters);
        symbolizers.push(Object.assign(symbolizer, baseSymbolizer));

        this.checkWarnDropRule('MINSCALEDENOM', 'STYLE', styleParameters.minscaledenom);
        this.checkWarnDropRule('MAXSCALEDENOM', 'STYLE', styleParameters.maxscaledenom);
      });
    }

    // Mapfile LABEL
    // FIXME it can have multiple label in a class.
    if (mapfileClass.label) {
      mapfileLayerLabelItem = mapfileClass.text ? mapfileClass.text : mapfileLayerLabelItem;
      mapfileClass.label.text = mapfileClass.label.text ? mapfileClass.label.text : mapfileLayerLabelItem;
      const symbolizer = Object.assign(
        this.getTextSymbolizerFromMapfileStyle(mapfileClass.label),
        this.getBaseSymbolizerFromStyle(mapfileClass.label)
      );
      symbolizers.push(symbolizer);

      this.checkWarnDropRule('MINSCALEDENOM', 'LABEL', mapfileClass.label.minscaledenom);
      this.checkWarnDropRule('MAXSCALEDENOM', 'LABEL', mapfileClass.label.maxscaledenom);
    }

    return symbolizers;
  }

  /**
   * Get the GeoStyler-Style Rule from an Mapfile Object.
   *
   * @param {object} mapfileLayer The Mapfile LAYER representation
   * @return {Rule} The GeoStyler-Style Rule
   */
  getRulesFromMapfileLayer(mapfileLayer: any): Rule[] {
    const rules: Rule[] = [];
    const mapfileLayerType: string = mapfileLayer.type;
    const mapfileLayerClassItem: string = mapfileLayer.classitem;
    const mapfileLayerLabelItem: string = mapfileLayer.labelitem;
    const layerScaleDenominator = this.getScaleDenominator(mapfileLayer);

    mapfileLayer.class.forEach((mapfileClass: any) => {
      const name = mapfileLayer.group ? `${mapfileLayer.group}.${mapfileClass.name}` : mapfileClass.name;
      const filter = this.getFilterFromMapfileClass(mapfileClass, mapfileLayerClassItem);
      const classScaleDenominator = this.updateScaleDenominator(mapfileClass, layerScaleDenominator);
      const symbolizers = this.getSymbolizersFromClass(
        mapfileClass,
        mapfileLayerType,
        mapfileLayerLabelItem,
      );

      const rule = { name } as Rule;
      if (filter) {
        rule.filter = filter;
      }
      if (classScaleDenominator) {
        rule.scaleDenominator = classScaleDenominator;
      }
      if (symbolizers) {
        rule.symbolizers = symbolizers;
      }
      rules.push(rule);
    });

    this.checkWarnDropRule('LABELMINSCALEDENOM', 'LAYER', mapfileLayer.Labelminscaledenom);
    this.checkWarnDropRule('LABELMAXSCALEDENOM', 'LAYER', mapfileLayer.Labelmaxscaledenom);

    return rules;
  }

  /**
   * Get the GeoStyler-Style Style from an Mapfile Object.
   *
   * @param {object} mapfileLayer The Mapfile layer object representation
   * @return {Style} The GeoStyler-Style Style
   */
  mapfileLayerToGeoStylerStyle(mapfileLayer: object): Style {
    const rules = this.getRulesFromMapfileLayer(mapfileLayer);
    const name = this.getStyleNameFromMapfileLayer(mapfileLayer);
    return {
      name,
      rules,
    };
  }

  /**
   * The readStyle implementation of the GeoStyler-Style StyleParser interface.
   * It reads one mapfile LAYER as a string and returns a Promise.
   * If there are multiple LAYER, only the first will be read and returned.
   * The Promise itself resolves with a GeoStyler-Style Style.
   *
   * @param  {string} mapfileString A Mapfile as a string.
   * @return {Promise} The Promise resolving with the GeoStyler-Style Style
   */
  readStyle(mapfileString: string): Promise<Style> {
    return new Promise<Style>((resolve, reject) => {
      try {
        const mapfileObject: any = parse(mapfileString);
        const mapfileLayers = mapfileObject?.map?.layer || [];
        if (mapfileLayers.length > 1) {
          throw new Error('Can not read multiple LAYER in one file. Use method readMultiStyle instead.');
        }
        const geoStylerStyle: Style = this.mapfileLayerToGeoStylerStyle(mapfileLayers[0]);
        resolve(geoStylerStyle);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Same as readStyle but read mutliple LAYER in a mapfile.
   *
   * @param  {string} mapfileString A Mapfile as a string.
   * @return {Promise} The Promise resolving with an array of GeoStyler-Style Style
   */
  readMultiStyles(mapfileString: string): Promise<Style[]> {
    return new Promise<Style[]>((resolve, reject) => {
      try {
        const mapfileObject: any = parse(mapfileString);
        const mapfileLayers = mapfileObject?.map?.layer || [];
        const geoStylerStyles: Style[] = mapfileLayers.map((layer: any) => {
          return this.mapfileLayerToGeoStylerStyle(layer);
        });
        resolve(geoStylerStyles);
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

  /**
   * Generic error message for not supported rules.
   * @param {string} notSupported The not supported avoided element. Printed in the warning message.
   * @param {string} mapfileParentElement The mapfile parent element name. Printed in the warning message.
   * @param {any} mapfileElement the value to test if it existing.
   */
  private checkWarnDropRule(notSupported: string, mapfileParentElement: string, mapfileElement: any): void {
    if (mapfileElement !== undefined) {
      console.warn(`Geostyler style does not support ${notSupported} operator
        in ${mapfileParentElement}. This rule is dropped.`);
    }
  }
}

export default MapfileStyleParser;
