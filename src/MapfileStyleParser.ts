import { parseMapfile } from './mapfile2js/parseMapfile';
import { rgbToHex, isSquare, isTriangle, isCross, rgbRangeToHexArray, isHex } from './Useful';
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
  ColorMap,
  GrayChannel,
  RGBChannel,
} from 'geostyler-style';
import { Mapfile, MapfileClass, MapfileStyle, MapfileLabel, MapfileLayer } from './mapfile2js/mapfileTypes';
import logger from '@terrestris/base-util/dist/Logger';

export type ConstructorParams = Record<string, unknown>;

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

  symbolsPath = `${process.cwd()}/symbols.sym`;

  constructor(opts?: ConstructorParams) {
    Object.assign(this, opts);
  }

  /**
   * Get the name for the Style from the Mapfile LAYER. Returns the GROUP value of the LAYER
   * if defined or the NAME value of the LAYER if defined or an empty string.
   *
   * @param {MapfileLayer} mapfileLayer The Mapfile Layer object representation (created with mapfile2js)
   * @return {string} The name to be used for the GeoStyler Style Style
   */
  getStyleNameFromMapfileLayer(mapfileLayer: MapfileLayer): string {
    const layerName = mapfileLayer.name;
    return layerName ? layerName : '';
  }

  /**
   * Get the GeoStyler-Style Filter from an Mapfile EXPRESSION and CLASSITEM.
   *
   * @param {MapfileClass} mapfileClass The Mapfile Class
   * @param {string} mapfileClassItem The Mapfile Class
   * @return {Filter} The GeoStyler-Style Filter
   */
  getFilterFromClassItem(mapfileClass: MapfileClass, mapfileClassItem: string): Filter | null {
    if (!mapfileClassItem) {
      logger.error(mapfileClassItem, 'Mapfile CLASSITEM undefined!');
    }

    const expression = mapfileClass.expression;
    switch (expression.charAt(0)) {
      case '"':
        return ['==' as ComparisonOperator, mapfileClassItem, expression.substring(1, expression.length - 1)];
      case '/':
        return ['*=', ['FN_strMatches', mapfileClassItem, expression as unknown as RegExp], true];
      case '{':
        return [
          '*=',
          [
            'FN_strMatches',
            mapfileClassItem,
          `/(${expression.substring(1, expression.length - 1).replace(/,/g, '|')})/` as unknown as RegExp
          ],
          true,
        ];
      default:
        logger.error(`Unable to get Filter from CLASSITEM: ${mapfileClass}`);
    }
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
        return ['*=', ['FN_strMatches', attribute, valueOrNumber as any], true];
      }
      case '~*':
        return ['*=', ['FN_strMatches', attribute, `${value}i` as any], true];
      case 'IN':
        return [
          '*=',
          [
            'FN_strMatches',
            attribute,
          (`/${value
            .substring(1, value.length - 1)
            .replace(',', '|')}/` as unknown) as RegExp
          ],
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
        logger.error(`Unknow comparison operator: ${operator}`);
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
      let operator;
      if (mapfileExpression.includes('AND')) {
        operator = '&&';
      } else if (mapfileExpression.includes('OR')) {
        operator = '||';
      }
      const filterExpressions: any[] = [];
      nestedExpressions.forEach((nestedExpression) => {
        filterExpressions.push(this.getFilterFromMapfileExpression(nestedExpression));
      });

      return [
        operator as CombinationOperator,
        ...filterExpressions
      ] as unknown as CombinationFilter;
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
        logger.error(`Unable to parse common expression: ${attributeMatch}, ${operator}, ${valueMatch}`);
      }
    }

    // TODO: implement logical combination expression relying on operator precedence

    if (mapfileExpression.length > 0) {
      logger.warn(`Mapfile expression leftovers: ${mapfileExpression}`);
    }

    return null;
  }

  /**
   * Get the GeoStyler-Style Filter from a Mapfile CLASS.
   *
   * @param {MapfileClass} mapfileClass The Mapfile Class
   * @return {Filter} The GeoStyler-Style Filter
   */
  getFilterFromMapfileClass(mapfileClass: MapfileClass, mapfileLayerClassItem: string): Filter | null {
    const expression = mapfileClass.expression;
    if (!expression) {
      return null;
    }

    // assert expression contains no string functions, arithmetic operations or spatial components
    if (/tostring \(|commify \(|upper \(|lower \(|initcap \(|firstcap \(|length \(/.test(expression)) {
      logger.error(`Not able to parse string function: ${expression}`);
    } else if (/round \(| \+ | - | \* | \/ | \^ | % /.test(expression)) {
      logger.error(`Not able to parse arithmetic operator or function: ${expression}`);
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
      logger.error(`Not able to parse spatial expression: ${expression}`);
      return null;
    } else if (expression.includes('´')) {
      logger.error(`Not able to parse temporal expression: ${expression}`);
      return null;
    }

    // assert expression does not contain escaped quotes
    if (/\\'|\\"/.test(expression)) {
      logger.error(`Mapfile expression may contain escaped quote: ${expression}`);
    }

    // get filter from expression value targeting CLASSITEM
    if (/^["/{]/.test(expression)) {
      return this.getFilterFromClassItem(mapfileClass, mapfileLayerClassItem);
    }

    // assert expression starts and ends with a bracket
    if (!/^\(.+\)$/.test(expression)) {
      logger.error(`Malformed expression! ${expression}`);
    }

    // get filter by expression parsing
    return this.getFilterFromMapfileExpression(expression);
  }

  /**
   * Get the GeoStyler-Style ScaleDenominator from an Mapfile element (layer, class or style).
   * Returns null if there is no defined ScaleDenominator in the element.
   * @param {MapfileLayer | MapfileClass | MapfileStyle} mapfileElement The Mapfile layer, class or style.
   * @return {ScaleDenominator} The GeoStyler-Style ScaleDenominator or null.
   */
  getScaleDenominator(mapfileElement: MapfileLayer | MapfileClass | MapfileStyle): ScaleDenominator | null {
    const scaleDenominator = {} as ScaleDenominator;

    // TODO: fixme, should this fetch the layers layermaxscaledenom too?
    if ('maxscaledenom' in mapfileElement) {
      if (mapfileElement.maxscaledenom) {
        scaleDenominator.max = mapfileElement.maxscaledenom * 1;
      }
    }

    // TODO: fixme, should this fetch the layers layerminscaledenom too?
    if ('minscaledenom' in mapfileElement) {
      if (mapfileElement.minscaledenom) {
        scaleDenominator.min = mapfileElement.minscaledenom * 1;
      }
    }

    return scaleDenominator.max !== undefined || scaleDenominator.min !== undefined ? scaleDenominator : null;
  }

  /**
   * Update the given scaleDenominator with the scaleDenominator from the given mapfileElement;
   *
   * @param {MapfileLayer | MapfileClass | MapfileStyle} mapfileElement The Mapfile layer, class or style.
   * @param {ScaleDenominator} scaleDenominator The scaleDenominator to try to override.
   * @return {scaleDenominator} A ScaleDenominator value or null.
   */
  updateScaleDenominator(
    mapfileElement: MapfileLayer | MapfileClass | MapfileStyle,
    scaleDenominator: ScaleDenominator | null
  ): ScaleDenominator | null {
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
    // Take max scale only if it's defined and take children max scale if it's defined additionally (more specific)
    if (scaleDenominator.max === undefined && elementScaleDenominator.max !== undefined) {
      mergedScale.max = elementScaleDenominator.max;
    } else if (scaleDenominator.max !== undefined && elementScaleDenominator.max === undefined) {
      mergedScale.max = scaleDenominator.max;
    } else if (scaleDenominator.max !== undefined && elementScaleDenominator.max !== undefined) {
      mergedScale.max = elementScaleDenominator.max;
    }

    // Take min scale only if it's defined and take children min scale it's defined additionally (more specific)
    if (scaleDenominator.min === undefined && elementScaleDenominator.min !== undefined) {
      mergedScale.min = elementScaleDenominator.min;
    } else if (scaleDenominator.min !== undefined && elementScaleDenominator.min === undefined) {
      mergedScale.min = scaleDenominator.min;
    } else if (scaleDenominator.min !== undefined && elementScaleDenominator.min !== undefined) {
      mergedScale.min = elementScaleDenominator.min;
    }

    return mergedScale;
  }

  /**
   * Get the GeoStyler-Style MarkSymbolizer from an Mapfile STYLE
   *
   * @param {MapfileStyle} mapfileStyle The Mapfile Style Parameters
   * @return {MarkSymbolizer} The GeoStyler-Style MarkSymbolizer
   */
  getMarkSymbolizerFromMapfileStyle(mapfileStyle: MapfileStyle): MarkSymbolizer {
    const markSymbolizer = { kind: 'Mark' } as MarkSymbolizer;

    if (!mapfileStyle.color) {
      markSymbolizer.visibility = false;
    }

    if (mapfileStyle.symbol.filled) {
      markSymbolizer.fillOpacity = mapfileStyle.symbol.filled.toLowerCase() === 'true' ? 1 : 0;
    } else {
      markSymbolizer.fillOpacity = 0;
    }

    if (mapfileStyle.size) {
      markSymbolizer.radius = mapfileStyle.size / 2;
    }

    markSymbolizer.rotate = mapfileStyle.angle ? mapfileStyle.angle : 0;

    if (mapfileStyle.outlinecolor) {
      markSymbolizer.strokeColor = isHex(mapfileStyle.outlinecolor)
        ? mapfileStyle.outlinecolor
        : rgbToHex(mapfileStyle.outlinecolor);
      if (mapfileStyle.opacity) {
        markSymbolizer.strokeOpacity = mapfileStyle.opacity / 100;
      }
    }

    if (mapfileStyle.width) {
      markSymbolizer.strokeWidth = mapfileStyle.width * 1;
    }

    const symbolType = mapfileStyle.symbol.type.toLowerCase();
    if (mapfileStyle.symbol.points) {
      const points = mapfileStyle.symbol.points.split(' ').map((item) => parseFloat(item));
      if (symbolType === 'ellipse' && points[0] === points[1] && points.length === 2) { 
        markSymbolizer.wellKnownName = 'circle' as WellKnownName;
      } else {
        if (isSquare(points)) {
          markSymbolizer.wellKnownName = 'square' as WellKnownName;
        }
        if (isTriangle(points)) {
          markSymbolizer.wellKnownName = 'triangle' as WellKnownName;
        }
        if (isCross(points)) {
          markSymbolizer.wellKnownName = 'cross' as WellKnownName;
        }
      }
      if (!markSymbolizer.wellKnownName) {
        logger.warn(
          `Custom symbol not supported by MarkerSymbolyzer:\n${JSON.stringify(
            mapfileStyle.symbol,
            null,
            2
          )}`
        );
      }
    } else if (mapfileStyle.symbol.character) {
      const character = mapfileStyle.symbol.character.replace(/'|"/g, '');
      if (character.length === 1) {
        markSymbolizer.wellKnownName =
          'ttf://' + mapfileStyle.symbol.font + '#0x00' + character.charCodeAt(0).toString(16);
      } else {
        markSymbolizer.wellKnownName =
          'ttf://' +
          mapfileStyle.symbol.font +
          '#0x' +
          parseInt(character.replace(/&#|;/g, ''), 10).toString(16);
      }
    }
    return markSymbolizer;
  }

  /**
   * Get the GeoStyler-Style IconSymbolizer from an Mapfile Style
   *
   * @param {MapfileStyle} mapfileStyle The Mapfile Style
   * @return {IconSymbolizer} The GeoStyler-Style IconSymbolizer
   */
  getIconSymbolizerFromMapfileStyle(mapfileStyle: MapfileStyle): IconSymbolizer {
    const iconSymbolizer: IconSymbolizer = {
      kind: 'Icon',
      image: mapfileStyle.symbol.image,
    } as IconSymbolizer;

    if (mapfileStyle.size) {
      iconSymbolizer.size = mapfileStyle.size;
    }
    iconSymbolizer.rotate = mapfileStyle.angle ? mapfileStyle.angle * 1 : 0;

    if (mapfileStyle.symbol.anchorpoint) {
      const anchorpoint: Array<number> = mapfileStyle.symbol.anchorpoint
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
   * @param {MapfileLabel} labelParameters The Mapfile Label Parameters
   * @return {TextSymbolizer} The GeoStyler-Style TextSymbolizer
   */
  getTextSymbolizerFromMapfileStyle(labelParameters: MapfileLabel): TextSymbolizer {
    const textSymbolizer: TextSymbolizer = { kind: 'Text' } as TextSymbolizer;

    if (labelParameters.text) {
      textSymbolizer.label = labelParameters.text.replace('[', '{{').replace(']', '}}');
    }

    textSymbolizer.rotate = labelParameters.angle ? labelParameters.angle * 1 : 0;

    if (labelParameters.offset) {
      const offset = labelParameters.offset.split(' ').map((a: string) => parseFloat(a));
      textSymbolizer.offset = [offset[0], offset[1]];
    }

    if (labelParameters.align) {
      switch (labelParameters.align.replace(/'|"/g, '')) {
      case '1':
      case 'left':
        textSymbolizer.justify = 'left';
        break;
      case '2':
      case 'center':
        textSymbolizer.justify = 'center';
        break;
      case '3':
      case 'right':
        textSymbolizer.justify = 'right';
        break;
      }
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

    if (labelParameters.outlinecolor) {
      textSymbolizer.haloColor = isHex(labelParameters.outlinecolor)
        ? labelParameters.outlinecolor
        : rgbToHex(labelParameters.outlinecolor);
    }

    if (labelParameters.outlinewidth) {
      textSymbolizer.haloWidth = labelParameters.outlinewidth;
    }

    return textSymbolizer;
  }

  /**
   * Get the GeoStyler-Style PointSymbolizer from an Mapfile STYLE.
   *
   * @param {MapfileStyle} mapfileStyle The Mapfile Style Parameters
   * @return {PointSymbolizer} The GeoStyler-Style PointSymbolizer
   */
  getPointSymbolizerFromMapfileStyle(mapfileStyle: MapfileStyle): PointSymbolizer {
    let pointSymbolizer = {} as PointSymbolizer;

    if (typeof mapfileStyle.symbol === 'object') {
      const symbolType = mapfileStyle.symbol.type;
      switch (symbolType.toLowerCase()) {
        case 'ellipse':
        case 'vector':
        case 'truetype':
          pointSymbolizer = this.getMarkSymbolizerFromMapfileStyle(mapfileStyle);
          break;
        case 'svg':
        // TODO: handle as svg
          break;
        case 'hatch':
        // TODO
          break;
        case 'pixmap':
          pointSymbolizer = this.getIconSymbolizerFromMapfileStyle(mapfileStyle);
          break;
        default:
          break;
      }
    } else if (typeof mapfileStyle.symbol === 'string') {
      if (/^['"]?[^[]/.test(mapfileStyle.symbol)) {
        mapfileStyle.symbol = { image: mapfileStyle.symbol } as any;
        pointSymbolizer = this.getIconSymbolizerFromMapfileStyle(mapfileStyle);
      } else {
        // TODO: handle attribute pixmaps
        logger.error('Not able to deal with attribute pixmaps');
      }
    }
    return pointSymbolizer;
  }

  /**
   * Get the GeoStyler-Style LineSymbolizer from an Mapfile STYLE.
   *
   * @param {MapfileStyle} mapfileStyle The Mapfile Style Parameters
   * @return {LineSymbolizer} The GeoStyler-Style LineSymbolizer
   */
  getLineSymbolizerFromMapfileStyle(mapfileStyle: MapfileStyle): LineSymbolizer {
    const lineSymbolizer = { kind: 'Line' } as LineSymbolizer;

    if (!mapfileStyle.color && !mapfileStyle.symbol) {
      lineSymbolizer.visibility = false;
    }

    if (mapfileStyle.width) {
      lineSymbolizer.width = mapfileStyle.width * 1;
    } else if (mapfileStyle.symbol) {
      lineSymbolizer.width = mapfileStyle.size * 1;
    }

    if (mapfileStyle.symbol) {
      lineSymbolizer.graphicStroke = Object.assign(
        this.getBaseSymbolizerFromMapfileStyle(mapfileStyle),
        this.getPointSymbolizerFromMapfileStyle(mapfileStyle)
      );
    } else {
      const linejoin = mapfileStyle.linejoin;
      if (!linejoin) {
        lineSymbolizer.join = 'round'; //  mapserver default
      } else if (linejoin !== 'none') {
        lineSymbolizer.join = linejoin;
      }

      if (mapfileStyle.linecap) {
        lineSymbolizer.cap = mapfileStyle.linecap;
      } else {
        lineSymbolizer.cap = 'round';
      }

      if (mapfileStyle.pattern) {
        lineSymbolizer.dasharray = mapfileStyle.pattern.split(' ').map((a: string) => parseFloat(a));
      }

      if (mapfileStyle.initialgap) {
        lineSymbolizer.dashOffset = mapfileStyle.initialgap;
      }
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
   * @param {MapfileStyle} mapfileStyle The Mapfile Style Parameters
   * @return {FillSymbolizer} The GeoStyler-Style FillSymbolizer
   */
  getFillSymbolizerFromMapfileStyle(mapfileStyle: MapfileStyle): FillSymbolizer {
    const fillSymbolizer = { kind: 'Fill' } as FillSymbolizer;

    if (!(mapfileStyle.color || mapfileStyle.outlinecolor) && !mapfileStyle.symbol) {
      fillSymbolizer.visibility = false;
    } else if (mapfileStyle.symbol) {
      fillSymbolizer.graphicFill = this.getPointSymbolizerFromMapfileStyle(mapfileStyle);
    }

    if (mapfileStyle.outlinecolor) {
      fillSymbolizer.outlineColor = isHex(mapfileStyle.outlinecolor)
        ? mapfileStyle.outlinecolor
        : rgbToHex(mapfileStyle.outlinecolor);
    }

    if (mapfileStyle.outlinewidth) {
      fillSymbolizer.outlineWidth = mapfileStyle.outlinewidth;
    } else if (mapfileStyle.width) {
      fillSymbolizer.outlineWidth = mapfileStyle.width;
    }

    if (mapfileStyle.opacity) {
      fillSymbolizer.outlineOpacity = mapfileStyle.opacity / 100;
    }

    if (mapfileStyle.pattern) {
      fillSymbolizer.outlineDasharray = mapfileStyle.pattern.split(' ').map((a: string) => parseFloat(a));
    }

    return fillSymbolizer;
  }

  /**
   * Get the GeoStyler-Style ColorMap from an Mapfile LAYER.
   *
   * @param {MapfileLayer} mapfileLayer The Mapfile Layer object
   * @return {ColorMap} The GeoStyler-Style ColorMap
   */
  getColorMapFromMapfileLayer(mapfileLayer: MapfileLayer): ColorMap | undefined {
    // color map based on the style attributes colorrange and datarange of the first class if defined
    const mapfileClass = mapfileLayer.classes[0];

    if (mapfileLayer.classes.length === 1 && mapfileClass.styles) {
      const mapfileStyle = mapfileClass.styles[0];

      if (mapfileStyle.colorrange && mapfileStyle.datarange) {
        const colors = rgbRangeToHexArray(mapfileStyle.colorrange);
        const values = mapfileStyle.datarange.split(' ').map((element) => parseFloat(element));
        return {
          type: 'ramp',
          colorMapEntries: [
            { color: colors[0], quantity: values[0] },
            { color: colors[1], quantity: values[1] },
          ],
        } as ColorMap;
      }
    } else {
      logger.warn('Raster classification not implemented!');
    }
    return;
  }

  /**
   * Get the GeoStyler-Style RasterSymbolizer from an Mapfile LAYER.
   *
   * @param {MapfileLayer} mapfileLayer The Mapfile Layer object
   * @return {RasterSymbolizer} The GeoStyler-Style RasterSymbolizer
   */
  getRasterSymbolizersFromMapfileLayer(mapfileLayer: MapfileLayer): RasterSymbolizer {
    const rasterSymbolizer = { kind: 'Raster' } as RasterSymbolizer;

    if (mapfileLayer.classes[0]?.styles && Array.isArray(mapfileLayer.classes[0]?.styles)) {
      const opacity = mapfileLayer.composite?.opacity
        ? mapfileLayer.composite?.opacity
        : mapfileLayer.classes[0]?.styles[0]?.opacity;
      if (opacity) {
        rasterSymbolizer.opacity = opacity / 100;
      }
    }

    if (mapfileLayer.processings) {
      const processings: any = {};
      mapfileLayer.processings.forEach((element) => {
        const parts = element.split('=');
        processings[parts[0].toLowerCase()] = parts[1].toLowerCase();
      });

      switch (processings.resample) {
        case 'average':
        case 'bilinear':
          rasterSymbolizer.resampling = 'linear';
          break;
        case 'nearest':
          rasterSymbolizer.resampling = 'nearest';
          break;
        default:
          break;
      }

      if (processings.bands) {
        const bands = processings.bands.split(',');
        if (bands.length === 1) {
          rasterSymbolizer.channelSelection = { grayChannel: { sourceChannelName: bands[0] } } as GrayChannel;
        } else {
          rasterSymbolizer.channelSelection = {
            redChannel: { sourceChannelName: bands[0] },
            greenChannel: { sourceChannelName: bands[1] },
            blueChannel: { sourceChannelName: bands[2] },
          } as RGBChannel;
        }
      }
    }

    const colorMap = this.getColorMapFromMapfileLayer(mapfileLayer);
    if (colorMap) {
      rasterSymbolizer.colorMap = colorMap;
    }

    return rasterSymbolizer;
  }

  /**
   * Get the GeoStyler-Style Basic Symbolizer Parameter from an Mapfile STYLE.
   *
   * @param {MapfileStyle | MapfileLabel} styleParameters The Mapfile Style
   * @return {Symbolizer} The GeoStyler-Style Symbolizer Parameters
   */
  getBaseSymbolizerFromMapfileStyle(styleParameters: MapfileStyle | MapfileLabel): Symbolizer {
    const symbolizer: any = {};

    if (styleParameters.color) {
      symbolizer.color = isHex(styleParameters.color)
        ? styleParameters.color
        : rgbToHex(styleParameters.color);
    }
    if ('opacity' in styleParameters) {
      symbolizer.opacity = styleParameters.opacity / 100;
    }

    return symbolizer;
  }

  /**
   * Get the GeoStyler-Style Symbolizers from an Mapfile CLASS.
   *
   * @param {MapfileClass} mapfileClass The Mapfile Class
   * @param {string} mapfileLayerType The Mapfile Layer Type
   * @param {string} mapfileLayerLabelItem The Mapfile Layer Label Item
   * @return {Symbolizer[]} The GeoStyler-Style Symbolizer Array
   */
  getSymbolizersFromClass(
    mapfileClass: MapfileClass,
    mapfileLayerType: string,
    mapfileLayerLabelItem: string
  ): Symbolizer[] {
    const symbolizers = [] as Symbolizer[];
    // Mapfile STYLE
    if (mapfileClass.styles) {
      mapfileClass.styles.forEach((mapfileStyle) => {
        // jump to next style block if current block is empty
        if (Object.keys(mapfileStyle).length === 0 && mapfileStyle.constructor === Object) {
          return;
        }
        let symbolizer: any;
        switch (mapfileLayerType.toLowerCase()) {
          case 'point':
            symbolizer = this.getPointSymbolizerFromMapfileStyle(mapfileStyle);
            break;
          case 'line':
            symbolizer = this.getLineSymbolizerFromMapfileStyle(mapfileStyle);
            break;
          case 'polygon':
            symbolizer = this.getFillSymbolizerFromMapfileStyle(mapfileStyle);
            break;
          case 'query':
          // layer can be queried but not drawn
            break;
          case 'chart':
          case 'circle':
          default:
            throw new Error('Unable to parse Symbolizer from Mapfile');
        }
        const baseSymbolizer: any = this.getBaseSymbolizerFromMapfileStyle(mapfileStyle);
        symbolizers.push(Object.assign(baseSymbolizer, symbolizer));

        this.checkWarnDropRule('MINSCALEDENOM', 'STYLE', mapfileStyle.minscaledenom);
        this.checkWarnDropRule('MAXSCALEDENOM', 'STYLE', mapfileStyle.maxscaledenom);
      });
    }

    // Mapfile LABEL
    if (mapfileClass.labels) {
      mapfileLayerLabelItem = mapfileClass.text ? mapfileClass.text : mapfileLayerLabelItem;
      mapfileClass.labels.forEach((mapfileLabel) => {
        mapfileLabel.text = mapfileLabel.text ? mapfileLabel.text : mapfileLayerLabelItem;

        // Set Icons in front of the associated label
        const labelIcons = this.getIconsFromMapfileLabel(mapfileLabel);
        labelIcons.forEach(labelIcon => {
          symbolizers.push(labelIcon);
        });

        const symbolizer = Object.assign(
          this.getBaseSymbolizerFromMapfileStyle(mapfileLabel),
          this.getTextSymbolizerFromMapfileStyle(mapfileLabel)
        );
        symbolizers.push(symbolizer);

        this.checkWarnDropRule('MINSCALEDENOM', 'LABEL', mapfileLabel.minscaledenom);
        this.checkWarnDropRule('MAXSCALEDENOM', 'LABEL', mapfileLabel.maxscaledenom);
      });
    }

    return symbolizers;
  }

  /**
   * Collect icon data if defined within the label tag
   *
   * @param {MapfileLabel} mapfileLabel Mapfile label data
   * @return {IconSymbolizer[]} The IconSymbolizer
   */
  getIconsFromMapfileLabel(mapfileLabel: MapfileLabel): IconSymbolizer[] {
    const iconStyles: IconSymbolizer[] = [];
    mapfileLabel?.styles?.forEach((style: MapfileStyle) => {
      if (style.symbol) {
        iconStyles.push(this.getIconSymbolizerFromMapfileStyle(
          {symbol: {image: style.symbol}} as unknown as MapfileStyle
        ));
      }
    });
    return iconStyles;
  }

  /**
   * Get the GeoStyler-Style Rule from an Mapfile Object.
   *
   * @param {MapfileLayer} mapfileLayer The Mapfile LAYER representation
   * @return {Rule} The GeoStyler-Style Rule
   */
  getRulesFromMapfileLayer(mapfileLayer: MapfileLayer): Rule[] {
    const rules: Rule[] = [];
    const mapfileLayerType = mapfileLayer.type;
    const mapfileLayerClassItem = mapfileLayer.classitem;
    const mapfileLayerLabelItem = mapfileLayer.labelitem;
    const layerScaleDenominator = this.getScaleDenominator(mapfileLayer);

    if (mapfileLayerType.toLowerCase() === 'raster') {
      const symbolizer = this.getRasterSymbolizersFromMapfileLayer(mapfileLayer);

      const rule = { name: '' } as Rule;
      if (layerScaleDenominator) {
        rule.scaleDenominator = layerScaleDenominator;
      }
      if (symbolizer) {
        rule.symbolizers = [symbolizer];
      }
      rules.push(rule);
    } else {
      mapfileLayer.classes?.forEach((mapfileClass) => {
        const name = mapfileClass.name || '';
        const filter = this.getFilterFromMapfileClass(mapfileClass, mapfileLayerClassItem);
        const classScaleDenominator = this.updateScaleDenominator(mapfileClass, layerScaleDenominator);
        const symbolizers = this.getSymbolizersFromClass(
          mapfileClass,
          mapfileLayerType,
          mapfileLayerLabelItem
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
    }

    this.checkWarnDropRule('LABELMINSCALEDENOM', 'LAYER', mapfileLayer.labelminscaledenom);
    this.checkWarnDropRule('LABELMAXSCALEDENOM', 'LAYER', mapfileLayer.labelmaxscaledenom);

    return rules;
  }

  /**
   * Get the GeoStyler-Style Style from an Mapfile Object.
   *
   * @param {MapfileLayer} mapfileLayer The Mapfile layer object representation
   * @return {Style} The GeoStyler-Style Style
   */
  mapfileLayerToGeoStylerStyle(mapfileLayer: MapfileLayer): Style {
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
        const mapfile: Mapfile = parseMapfile(mapfileString, this.symbolsPath);
        const mapfileLayers = mapfile.map.layers || [];
        if (mapfileLayers.length > 1) {
          throw new Error('Cannot read multiple LAYER in one file. Use method readMultiStyles instead.');
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
        const mapfile: Mapfile = parseMapfile(mapfileString, this.symbolsPath);
        const mapfileLayers = mapfile.map.layers || [];
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
            nestedExpressions.push(mapfileExpression.substring(fromIndex, index + 1));
          }
          break;
        default:
          throw Error('Could not split mapfilExpression:' + mapfileExpression);
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
      logger.warn(`Geostyler style does not support ${notSupported} operator
        in ${mapfileParentElement}. This rule is dropped.`);
    }
  }
}

export default MapfileStyleParser;
