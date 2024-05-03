const
    get_path = require('./get-path');

function destructurize(obj, expressions, variables, i)
{
    let
        coords = [i+1, i+1],
        nesting_count = 0,
        destructuring_lines,
        path = [];

    for(; coords[1] < expressions.length; coords[1]++)
    {
        const expression = expressions[coords[1]];
        if(nesting_count === 0 && expression === ('];')) break;
        else
        {
            if(expression.endsWith('[')) nesting_count++;
            else if(expression == '];') nesting_count--;
        }
    }

    destructuring_lines = expressions
        .slice(...coords)
        .map((el) => {
            let res = el;

            if(res.endsWith(';')) res = res.substring(0, res.length-1);
            if(/([^]+)(?=\=\>)=>[^;]+/.test(res)) res = res.split('=>');
            
            return res;
        });
    i = coords[1];

    let current_object,
        counters = {};

    for(let line of destructuring_lines)
    {
        current_object = get_path(obj, path);
        if(Array.isArray(current_object))
        {
            if(!counters[path.join('.')] && counters[path.join('.')] !== 0) counters[path.join('.')] = -1;
            counters[path.join('.')]++;

            if(line === ']') path.pop();
            else
            if(line === '') continue;
            else
            {
                if(Array.isArray(line)) throw TypeError('Cannot destructurize Array like an Object.');

                const 
                    key = counters[path.join('.')],
                    variable_name = line;

                if(variable_name === '[') path.push(key);
                else variables[variable_name] = current_object[key];
            }
        }
        else
        {
            if(line == ']') path.pop();
            else
            {
                if(line !== '[' && typeof line === 'string') line = [line, line];

                const [ key, variable_name ] = line;

                if(!(key in current_object)) throw UnexpectedError(`There is no property '${key}' in object.`);
                if(variable_name === '[') path.push(key);
                else variables[variable_name] = current_object[key];
            }
        }
    }
}

module.exports = destructurize;