const search = require("./get");

module.exports = function destructure(expressions, index, object)
{
    let start = index+1,
        end,
        path = [],
        array_counters = {}
        variables = {};
        
    for(end = structuredClone(start); end < expressions.length; end++)
    {
        if(expressions[end].endsWith('[')){
            if(expressions[end] == '[')
            {
                if(!array_counters[path.join(".")] && array_counters[path.join(".")] !== 0) array_counters[path.join(".")] = 0;
                else array_counters[path.join(".")]++;
                path.push(array_counters[path.join(".")]);
            }
            else path.push(expressions[end].split("=>")[0]);
        }
        else if(expressions[end] == '];')
        {
            if(path.length > 0) path.pop();
            else break;
        }
        else
        {
            const [k,n] = expressions[end].replace(/;$/, '').split("=>"),
                  parent = path.length ? search(path.join("."), object) : object;

            if(parent instanceof Array)
            {
                if(n) throw TypeError("Cannot destructurize array like object.");

                if(!array_counters[path.join(".")] && array_counters[path.join(".")] !== 0) array_counters[path.join(".")] = 0;
                else array_counters[path.join(".")]++;

                if(k || k === 0) variables[k] = parent[array_counters[path.join(".")]];
            }
            else variables[n || k] = parent[k];
        }
    }
    
    return { index:end, variables };
}