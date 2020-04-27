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
  WellKnownName,
} from 'geostyler-style';
import { assert } from 'console';

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
   * @param {object} mapfileClass The Mapfile Class
   * @return {Filter} The GeoStyler-Style Filter
   */
  getFilterFromExpression(mapfileClass: any): Filter | undefined {
    let expression = mapfileClass.expression;
    if (!expression) {
      return;
    }

    // substitute expression value targeting CLASSITEM
    if (expression.startsWith('"')) {
      assert(mapfileClass.classitem, 'Mapfile CLASSITEM undefined!');
      expression = `( "[${mapfileClass.classitem}]" = ${expression} )`;
    }

    if (expression.startsWith('/')) {
      assert(mapfileClass.classitem, 'Mapfile CLASSITEM undefined!');
      expression = `( "[${mapfileClass.classitem}]" ~ ${expression} )`;
    }

    if (expression.startsWith('{')) {
      assert(mapfileClass.classitem, 'Mapfile CLASSITEM undefined!');
      expression = `( "[${mapfileClass.classitem}]" IN ${expression} )`;
    }

    // assert expression has no escaped quote
    assert(!/\\'|\\"/.test(expression), `Mapfile expression may contain escaped quote: ${expression}`);

    // assert expression contains no string functions
    assert(
      !/tostring \(|commify \(|upper \(|lower \(|initcap \(|firstcap \(|length \(/.test(expression),
      `Mapfile expression may contain string function: ${expression}`
    );

    // assert expression contains no arithmetic operators and functions
    assert(
      !/round \(| \+ | - | \* | \/ | \^ | % /.test(expression),
      `Mapfile expression may contain arithmetic operator or function: ${expression}`
    );

    // assert expression has no spatial component
    if (
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
      return;
    }

    // assert expression contains no temporal component
    if (expression.includes('´')) {
      console.error(`Not able to parse temporal expression: ${expression}`);
      return;
    }

    assert(expression.startsWith('('), `Malformed expression! ${expression}`);

    // begin expression parsing
    console.log(`Parsing expresssion: ${expression}`);

    const expressionTree: any = {};
    const expressionStack: Array<any> = [expressionTree];

    while (expression.length > 0) {
      let currentNode = expressionStack[expressionStack.length - 1];

      // capture negation
      if (/^(! |NOT )/.test(expression)) {
        const operator = expression.split(/\s/)[0];
        expression = expression.replace(/^[^(\s)]\s/, '');
        if (currentNode.operator) {
          currentNode.right = { operator: operator };
          expressionStack.push(currentNode.right);
        } else {
          currentNode.operator = operator;
        }
      }

      // expression starts with a bracket exept in the case ( expression AND expression )
      if (/^(\( |AND )/.test(expression)) {
        const side = currentNode.operator ? 'right' : 'left';
        currentNode[side] = {};
        expressionStack.push(currentNode[side]);
        currentNode = expressionStack[expressionStack.length - 1];
        expression = expression.replace(/^(\( |AND )/, '');
      }

      if (/^['"]?\[/.test(expression)) {
        // get attribute name
        currentNode.left = expression.match(/^['"]?\[([^[\]]+)\]['"]?\s/)[1];
        expression = expression.replace(/^['"]?\[([^[\]]+)\]['"]?\s/, '');
        // get operator
        const expressionParts = expression.split(/\s/);
        currentNode.operator = expressionParts[0];
        expression = expression.replace(/^[^\s]+\s/, '');
        // get literal or number
        currentNode.right = expression.match(/^['"]?([^)'"]+)['"]?\s/)[1];
        // convert to number if necessary
        if (/^[-\d]/.test(currentNode.right)) {
          currentNode.right = parseFloat(currentNode.right);
        }
        // TODO: assert there are no qotes in strings, either of!
        expression = expression.replace(/^['"]?[^)'"]+['"]?\s/, '');
      }

      // expression ends with a bracket exept in the case ( expression AND expression )
      if (/^(AND|\))/.test(expression)) {
        expressionStack.pop();
        expression = expression.replace(/^\)\s?/, '');
        currentNode = expressionStack[expressionStack.length - 1];
      }

      // get nesting operator
      if (/^(AND|&&|OR|\|\|)/.test(expression)) {
        currentNode.operator = expression.split(/\s/)[0];
        expression = expression.replace(/^[^(\s|AND)]+\s/, '');
      }
    }

    console.log(`Expression tree:\n${JSON.stringify(expressionTree, null, 2)}`);

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

    // hack for demo!
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
    default:
      break;
    }

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
        const filter: Filter | undefined = this.getFilterFromExpression(mapfileClass);
        const scaleDenominator: ScaleDenominator | undefined = this.getScaleDenominatorFromClass(
          mapfileClass
        );
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
