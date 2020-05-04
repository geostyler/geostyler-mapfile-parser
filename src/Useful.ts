/**
   * Convert a color in RGB (R G B) format to hexadecimal (#RRGGBB) format
   *
   * @param {string} s The string representing the color in RGB in the Mapfile file
   * @return {string} The same color in hexadecimal format
   */
export function rgbToHex(s: string): string {
  const rgb = s.split(' ').map(Number);
  // eslint-disable-next-line no-bitwise
  return '#' + ((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16).toUpperCase().slice(1);
}
