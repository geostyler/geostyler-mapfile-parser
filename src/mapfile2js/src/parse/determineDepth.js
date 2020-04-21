
/**
 * Determines the depth of every line of mapfile.
 * @param {array} obj Array of line objects
 */
function determineDepth(obj){

  let depth = 0;

  obj.forEach((line)=>{
    
    line.depth = depth;
    
    if(line.isBlockKey){
      depth++;
    }else{
      if(line.key){
        if(line.key.toUpperCase() === 'END'){
          depth--;
          line.depth = depth;
        }
      }
    }
  });

  return obj;
}

module.exports = determineDepth;