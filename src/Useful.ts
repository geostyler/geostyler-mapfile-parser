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
  const lowerBoundColor = rgbToHex(s.split(' ').slice(0, 3).join(' '));
  const upperBoundColor = rgbToHex(s.split(' ').slice(3, 6).join(' '));
  return [lowerBoundColor, upperBoundColor];
}

/**
 * Test weather an sequence of point coordinates are a closed sequence
 *
 * @param {Array<number>} points An array of x, y coordinates
 * @return {boolean}
 */
function isClosedSequence(points: number[]): boolean {
  return points[0] === points[points.length - 2] && points[1] === points[points.length - 1];
}

/**
 * Test weather an sequence of point coordinates represent a Square
 *
 * @param {Array<number>} points An array of x, y coordinates
 * @return {boolean}
 */
export function isSquare(points: number[]): boolean {
  // Squares should be represented by a closed sequence of 5 coordinate pairs
  if (points.length !== 10 || !isClosedSequence(points)) {
    return false;
  }

  // Dot product is 0 for each corner
  const pointsTwice = points.slice(0, 8).concat(points.slice(0, 8));
  for (const i of [0, 2, 4, 6]) {
    const dotProduct =
      (pointsTwice[i] - pointsTwice[i + 2]) * (pointsTwice[i + 4] - pointsTwice[i + 2]) +
      (pointsTwice[i + 1] - pointsTwice[i + 3]) * (pointsTwice[i + 5] - pointsTwice[i + 3]);
    if (dotProduct !== 0) {
      return false;
    }
  }

  // Two sides must have same length
  const sideOne = Math.sqrt(Math.pow(points[0] - points[2], 2) + Math.pow(points[1] - points[3], 2));
  const sideOther = Math.sqrt(Math.pow(points[4] - points[2], 2) + Math.pow(points[5] - points[3], 2));
  if (sideOne !== sideOther) {
    return false;
  }

  // Square must have horizontal and vertical sides
  if (points[0] !== points[2] && points[1] !== points[3]) {
    return false;
  }

  return true;
}

/**
 * Test weather an sequence of point coordinates represent a Triangle
 *
 * @param {Array<number>} points An array of x, y coordinates
 * @return {boolean}
 */
export function isTriangle(points: number[]): boolean {
  // Triangles should be represented by a closed sequence of 4 coordinate pairs
  if (points.length !== 8 || !isClosedSequence(points)) {
    return false;
  }

  // Should be vaguely isosceles like
  for (const i of [0, 2, 4]) {
    // Should have two horizontal adjacent points
    if (points[i + 1] === points[i + 3]) {
      const pointsTwice = points.slice(0, 6).concat(points.slice(0, 6));
      const middle = (points[i] + points[i + 2]) / 2;
      // The remaining corner should be vetically aligned with the middle and point upwards
      if (middle === pointsTwice[i + 4] && pointsTwice[i + 4] < points[i + 1]) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Test weather an sequence of point coordinates represent a Cross
 *
 * @param {Array<number>} points An array of x, y coordinates
 * @return {boolean}
 */
export function isCross(points: number[]): boolean {
  // Crosses should be represented by a sequence of 5 coordinate pairs
  if (points.length !== 10 || points[4] !== -99 || points[5] !== -99) {
    return false;
  }

  // Should consist of horizontal and vertical line
  if (
    !(
      (points[0] === points[2] && points[7] === points[9]) ||
      (points[1] === points[3] && points[6] === points[8])
    )
  ) {
    return false;
  }

  // Should intersect in the middle
  const middleOne = [(points[0] + points[2]) / 2, (points[1] + points[3]) / 2];
  const middleOther = [(points[6] + points[8]) / 2, (points[7] + points[9]) / 2];
  if (middleOne[0] !== middleOther[0] || middleOne[1] !== middleOther[1]) {
    return false;
  }

  return true;
}

