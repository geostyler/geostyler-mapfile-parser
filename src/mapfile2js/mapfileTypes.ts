/**
 * The MapfileSymbolset is the root interface of a Symbolset.
 */
export interface MapfileSymbolset {
  symbols: MapfileSymbol[];
}

/**
 * The Mapfile is the root interface of a Mapfile.
 */
export interface Mapfile {
  map: MapfileMap;
}

interface MapfileMap {
  web: MapfileWeb;
  layers: MapfileLayer[];
  reference: MapfileReference;
  projection: MapfileProjection;
  querymap: MapfileQueryMap;
  scalebar: MapfileScaleBar;
  symbols: string[] | MapfileSymbol[];
  legend: MapfileLegend;
  /**
   * Filename of the symbolset to use. Can be a path relative to the mapfile, or a full path.
   */
  symbolset?: string;
  /**
   * Filename of fontset file to use. Can be a path relative to the mapfile, or a full path.
   */
  fontset?: string;
  /**
   * A map file may have zero, one or more OUTPUTFORMAT object declarations
   */
  outputformats?: MapfileOutputformat[];
}

interface MapfileWeb {
  validation: MapfileValidation;
  metadata: MapfileMetadata;
}

export interface MapfileLayer {
  labelmaxscaledenom: number;
  labelminscaledenom: number;
  type: string;
  classitem: string;
  labelitem: string;
  name: string;
  group: string;
  cluster: MapfileCluster;
  validation: MapfileValidation;
  grid: MapfileGrid;
  projection: MapfileProjection;
  scaletoken: MapfileScaleToken;
  composite: MapfileComposite;
  join: MapfileJoin;
  metadata: MapfileMetadata;
  classes: MapfileClass[];
  feature: MapfileFeature;
  processings: string[];
}

interface MapfileReference {}

interface MapfileProjection {}

interface MapfileQueryMap {}

interface MapfileScaleBar {
  label: MapfileLabel;
}

export interface MapfileSymbol {
  type: string;
  points: string;
  /**
   * Image (GIF or PNG) to use as a marker or brush for type pixmap symbols.
   */
  image?: string;
  anchorpoint: string;
  name: string;
}

interface MapfileLegend {
  label: MapfileLabel;
}

interface MapfileValidation {}

interface MapfileMetadata {}

interface MapfileCluster {}

interface MapfileGrid {}

interface MapfileScaleToken {
  values: MapfileScaleTokenValue[];
}

interface MapfileComposite {
  /**
   * Sets the opacity level of all classed pixels for a given layer.
   */
  opacity: number;
}

interface MapfileJoin {}

export interface MapfileClass {
  minscaledenom?: number;
  maxscaledenom?: number;
  text: string;
  expression: string;
  name: string;
  styles: MapfileStyle[];
  validation: MapfileValidation;
  leader: MapfileLeader;
  labels: MapfileLabel[];
}

interface MapfileFeature {
  points: string;
}

export interface MapfileLabel {
  maxscaledenom: number;
  minscaledenom: number;
  text: string;
  angle: number;
  color: string;
  outlinecolor: string;
  outlinewidth: number;
  styles?: MapfileStyle[];
}

interface MapfileScaleTokenValue {}

export interface MapfileStyle {
  /**
   * Height, in layer SIZEUNITS, of the symbol/pattern to be used.
   */
  size: number;
  /**
   * WIDTH refers to the thickness of line work drawn, in layer SIZEUNITS. Default is 1.0.
   */
  width: number;
  /**
   * Sets the line cap type for lines. Default is round.
   */
  linecap?: 'butt' | 'round' | 'square';
  /**
   * Sets the line join type for lines. Default is round.
   */
  linejoin?: 'bevel' | 'round' | 'miter' | 'none';
  initialgap: number;
  symbol: MapfileSymbol;
  outlinecolor: string;
  outlinewidth: number;
  /**
   * Used to define a dash pattern for line work (lines, polygon outlines, hatch lines, …).
   */
  pattern: string;
  color: string;
  opacity: number;
  angle: number;
  minscaledenom: number;
  maxscaledenom: number;
  /**
   * Defines two colors to correspond to the low and high ends of the DATARANGE values.
   */
  colorrange: string;
  /**
   * Defines two values, a low value and a high value, that are mapped to the colorrange.
   */
  datarange: string;
}

interface MapfileLeader {
  style: MapfileStyle;
}

interface MapfileOutputformat {
  name: string;
  driver: string;
  mimetype: string;
  imagemode: string;
  extension: string;
  fromatoptions: string[];
}
