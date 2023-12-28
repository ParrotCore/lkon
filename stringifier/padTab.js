module.exports = function(val, space, nestingCount){
    if(!space) return val;
    if(typeof space == 'number') return val.padStart(val.length + space*nestingCount, " ");
    else return val.padStart(val.length + nestingCount, space);
}