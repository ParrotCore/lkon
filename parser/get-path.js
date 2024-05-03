function get_path(obj, path)
{
    let res = obj; 
    for(const pos of path)
        res = res[pos];
    return res;
}

module.exports = get_path;