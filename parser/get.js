module.exports = function(pathString, obj)
{
    const path = pathString.split(/\./);
    let res = obj;
    for(const index of path) res = res[index];
    return res; 
}