// hex color
const regExpHexColor = new RegExp('[\"\']#[0-9a-f]{6}[\"\']|[\"\']#[0-9a-f]{3}[\"\']','gi');

/**
 * 
 * @param {string} line A line of mapfile
 * @returns {object} {"includesComment": true, "comment": "comment string", "contentWithoutComment": "string without comment"} 
 */
function checkComment(line){
  
  let lo = {
    includesComment: false,
    comment: '',
    contentWithoutComment: line
  };

  // check if the comment character is included
  if(line.includes('#')){

    // remove all hex colors  
    let withoutHex = line.replace(regExpHexColor,''); 

    // check if comment is included
    if(withoutHex.includes('#')){

      lo.includesComment = true;

      let foundComment = false;
      let comment = '';
      for (let j = 0; j < withoutHex.length; j++) {
        if(foundComment){
          comment += withoutHex.charAt(j);
        }
        if(withoutHex.charAt(j) === '#'){
          foundComment = true
        }
      }
      lo.contentWithoutComment = line.replace('#' + comment,'').trim();
      lo.comment = comment.trim();
    }

  }

  return lo;
}

module.exports = checkComment;