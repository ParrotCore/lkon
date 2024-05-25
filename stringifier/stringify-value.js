function stringify_value(value, replacer, path, variables)
{
    switch(true)
    {
        case path.join('.') in variables:
            return variables[path.join('.')];

        case value === undefined:
            return 'Undefined';

        case value === null:
            return 'Null';

        case typeof value === 'string':
            return `"${value}"`;

        case value instanceof Date:
            return `"${value.toLocaleString()}"date`;

        case typeof value === 'number' || value instanceof RegExp:
            return value.toString();

        case value instanceof Boolean:
            let 
                res = value.toString();
            return res[0].toUpperCase() + res.substring(1);
        
        default:
            return replacer(value);
    }
}

module.exports = stringify_value;