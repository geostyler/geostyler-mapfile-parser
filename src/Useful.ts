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
  export function rgbRangeToHexArray(s: string): string[] {
    const rgbrgb = s.split(' ').map(Number);
    const lowerBoundColor = '#' + ((1 << 24) + (rgbrgb[0] << 16) + (rgbrgb[1] << 8) + rgbrgb[2]).toString(16).toUpperCase().slice(1);
    const upperBoundColor = '#' + ((1 << 24) + (rgbrgb[3] << 16) + (rgbrgb[4] << 8) + rgbrgb[5]).toString(16).toUpperCase().slice(1);
    return [lowerBoundColor, upperBoundColor]
  }
  