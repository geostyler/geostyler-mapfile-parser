/**
 * The Mapfile is the root interface of a Mapfile.
 */
export interface Mapfile {
  map: MapfileMap;
}

/**
 * The MapfileSymbolset is the root interface of a Symbolset.
 */
export interface MapfileSymbolset {
  symbols: MapfileSymbol[];
}

interface MapfileMap {
  web: MapFileWeb;
  layers: MapfileLayer[];
  reference: MapFileReference;
  projection: MapFileProjection;
  querymap: MapFileQueryMap;
  scalebar: MapFileScaleBar;
  symbols: string[] | MapfileSymbol[];
  legend: MapFileLegend;
  /**
   * Filename of the symbolset to use. Can be a path relative to the mapfile, or a full path.
   */
  symbolset?: string;
  /**
   * Filename of fontset file to use. Can be a path relative to the mapfile, or a full path.
   */
  fontset?: string;
}

interface MapFileWeb {
  validation: MapFileValidation;
  metadata: MapFileMetadata;
}

export interface MapfileLayer {
  labelmaxscaledenom: number;
  labelminscaledenom: number;
  type: string;
  classitem: string;
  labelitem: string;
  name: string;
  group: string;
  cluster: MapFileCluster;
  validation: MapFileValidation;
  grid: MapFileGrid;
  projection: MapFileProjection;
  scaletoken: MapFileScaleToken;
  composite: MapFileComposite;
  join: MapFileJoin;
  metadata: MapFileMetadata;
  classes: MapfileClass[];
  feature: MapFileFeature;
}

interface MapFileReference {}

interface MapFileProjection {}

interface MapFileQueryMap {}

interface MapFileScaleBar {
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

interface MapFileLegend {
  label: MapfileLabel;
}

interface MapFileValidation {}

interface MapFileMetadata {}

interface MapFileCluster {}

interface MapFileGrid {}

interface MapFileScaleToken {
  values: MapFileScaleTokenValue[];
}

interface MapFileComposite {}

interface MapFileJoin {}

export interface MapfileClass {
  minscaledenom?: number;
  maxscaledenom?: number;
  text: string;
  expression: string;
  name: string;
  styles: MapfileStyle[];
  validation: MapFileValidation;
  leader: MapFileLeader;
  labels: MapfileLabel[];
}

interface MapFileFeature {
  points: MapFilePoint[];
}

export interface MapfileLabel {
  maxscaledenom: number;
  minscaledenom: number;
  text: string;
  angle: number;
  color: string;
}

interface MapFileScaleTokenValue {}

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
  pattern: string;
  color: string;
  opacity: number;
  angle: number;
  minscaledenom: number;
  maxscaledenom: number;
}

interface MapFileLeader {
  style: MapfileStyle;
}

interface MapFilePoint {}
