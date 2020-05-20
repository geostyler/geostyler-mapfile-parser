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

/**
 * Convert a color range in RGB (R G B R G B) format to hexadecimal (#RRGGBB) array
 *
 * @param {string} s The strings representing the range of colors in RGB in the Mapfile file
 * @return {string[]} The same colors as an array of strings in hexadecimal format
*/
export default function rgbRangeToHexArray(s: string): string[] {
  const rgbRange = s.split(' ').map(Number);
  const lowerBoundColor = '#' + ((1 << 24) + (rgbRange[0] << 16) + (rgbRange[1] << 8) + rgbRange[2]).toString(16).toUpperCase().slice(1);
  const upperBoundColor = '#' + ((1 << 24) + (rgbRange[3] << 16) + (rgbRange[4] << 8) + rgbRange[5]).toString(16).toUpperCase().slice(1);
  return [lowerBoundColor, upperBoundColor]
}
