const 
    stringify_key = require('./stringify-key'),
    stringify_value = require('./stringify-value'),
    stringify_head = require('./stringify-head'),
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
    },
    LKON_Objects = [
        require('../parser/classes/lkon-array'),
        require('../parser/classes/lkon-object')
    ];

function stringify(object, replacer, space, iteration, path, variables)
{   
    let
        arr = [];

    if(!variables) variables = object instanceof LKON_Objects[0] || object instanceof LKON_Objects[1] ? object.getVariables() : {};
    if(!path && path === undefined) path = [];

    for(let key in object)
    {
        let
            value = object[key];

        path.push(
            structuredClone(
                key
            )
        );

        key = stringify_key(key);

        if(isObject(value) || Array.isArray(value)) value = stringify(value, replacer, space, iteration+1, path, variables);
        else value = stringify_value(value, replacer, path, variables);

        arr.push(`${key} => ${value}${value.endsWith(';') ? "" : ";"}`);
        path.pop();
    };

    arr = [
        '[',
        ...arr
            .map(el => tabs(space, iteration+1) + el),
        tabs(space, iteration) + '];'
    ];

    if(object instanceof LKON_Objects[0] || object instanceof LKON_Objects[1])
    {
        const
            head = object.getHead();

        if(head.length > 0) arr.unshift(
            stringify_head(
                head,
                space
            )
        )
    }
    
    return arr.join(space ? '\n' : '')
}

function lkonStringify(object, replacer, space)
{
    if(!replacer) replacer = () => 'Null';
    if(!space) space = 0;
    iteration = 0;

    return stringify(object, replacer, space, iteration);
}

module.exports = lkonStringify;