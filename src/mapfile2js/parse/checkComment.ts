import { LineObject } from '../parseMapfile';

const regExpHexColor = new RegExp('["\']#[0-9a-f]{6,8}["\']|["\']#[0-9a-f]{3}["\']', 'gi');

/**
 *
 * @param {LineObject} lineObject A line object of a mapfile
 * @returns {LineObject} A line object
 */
export function checkComment(lineObject: LineObject): LineObject {
  lineObject.contentWithoutComment = lineObject.content;

  // check if the comment character is included
  if (lineObject.content.includes('#')) {
    // remove all hex colors
    const contentWithoutHex = lineObject.content.replace(regExpHexColor, '');

    // check if comment is included
    if (contentWithoutHex.includes('#')) {
      let comment = '';
      for (const char of contentWithoutHex) {
        if (char === '#' || comment.length > 0) {
          comment += char;
        }
      }
      lineObject.contentWithoutComment = lineObject.content.replace(comment, '').trim();
      lineObject.comment = comment.substring(1).trim();
    }
  }

  return lineObject;
}
