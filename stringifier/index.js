const 
    stringify_key = require('./stringify-key'),
    stringify_value = require('./stringify-value'),
    tabs = require('./tabs'),
    isObject = (obj) => {
        try
        {
            return obj.constructor === Object;
        }
        // Null or Undefined.
        catch(__error)
        {
            return false;
        }
    }

function stringify(object, replacer, space, iteration)
{   
    let
        arr = [];

    for(let key in object)
    {
        let
            value = object[key];

        key = stringify_key(key);

        if(isObject(value) || Array.isArray(value)) value = stringify(value, replacer, space, iteration+1);
        else value = stringify_value(value, replacer);

        arr.push(`${key} => ${value};`);
    };

    return [
        '[',
        ...arr
            .map(el => tabs(space, iteration+1) + el),
        tabs(space, iteration) + ']'
    ].join(space ? '\n' : '')
}

function lkonStringify(object, replacer, space)
{
    if(!replacer) replacer = () => 'Null';
    if(!space) space = 0;
    iteration = 0;

    return stringify(object, replacer, space, iteration);
}

module.exports = lkonStringify;