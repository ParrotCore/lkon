const
    minify = require('./minifier'),
    parse_value = require('./parse-value'),
    get_path = require('./get-path.js'),
    destructurize = require('./destructurize');

function lkonParse(str)
{
    const
        variables = {},
        import_regexp = /import"(?<path>((?<=\\)"|[^\n"])+)"(?<encoding>[A-Za-z0-9-_]+)as(?<key>[^]+)/,
        use_regexp = /use(?<value>(\[|([^\[\n]+)(?=as)))(?:(?<!\[)(as(?<key>[^;]+)))?/

    let 
        res = [],
        expressions = minify(str),
        position = 0,
        path = [];

    variables.Main = res;
    imported = [];

    for(let i = 0; i < expressions.length; i++)
    {
        const expression = expressions[i];

        // Head handle.
        if(position === 0)
        {
            // End of Head.
            if(expression == '[')
            {
                position++;
                continue;
            }

            let 
                value,
                key;

            if(import_regexp.test(expression))
            {
                let
                    {
                        path,
                        encoding,
                        key: _key
                    } = expression.match(import_regexp).groups;

                value = parse_value(`"${path}"${encoding};`);
                key = _key;

                if(imported.some(el => el.content === value)) value = imported.find(el => el.content === value).parsed;
                else
                {
                    let oldContent = value;
                    value = lkonParse(value);
                    imported.push(
                        {
                            content: oldContent,
                            parsed: value
                        }
                    );
                }
            }
            else
            if(use_regexp.test(expression))
            {
                let
                    {
                        value: _value,
                        key: _key
                    } = expression.match(use_regexp).groups;

                value = _value;

                if(value == '[')
                {
                    coords = [
                        i+1,
                        i
                    ];

                    for(; coords[1] < expressions.length; coords[1]++) if(expressions[coords[1]].startsWith(']as')) break;

                    value = lkonParse('[\n'+expressions.slice(...coords).join('')+'\n];');
                    i = coords[1];
                    _key = expressions[i].replace(/^\]as|;$/g, '');
                }
                else value = parse_value(value);

                key = _key;
            }

            if(key === '[') destructurize(value, expressions, variables, i);
            else variables[key] = value;
        }
        // Main handle
        else if(position === 1)
        {
            //End of Main:
            if(path.length === 0 && expression == '];') break;
            // Closing objects and skipping ";":
            if(expression === '];' || expression === ';')
            {
                if(expression === '];') path.pop();
                continue;
            }
            
            let
                obj = get_path(res, path),
                [
                    key,,
                    value
                ] = expression.split(/(?<!"([^"]|\\")+)=>/);

            key = key.substring(1);

            if(key !== '*' && Array.isArray(obj) && obj.length === 0)
            {
                if(path.length > 0)
                {
                    let before_object = get_path(res, path.slice(0, path.length-1));
                    before_object[path[path.length-1]] = {};
                    obj = get_path(res, path);
                }
                else
                {
                    res = {};
                    obj = res;
                    variables.Main = res;
                }
            }
            
            if(key === '*')
            {
                if(Array.isArray(obj)) key = obj.length;
                else key = (
                        Object.keys(obj)
                            .filter(k => !isNaN(k))
                            .sort((a,b) => b-a)[0]
                        ??
                        -1
                    ) + 1;
            }

            if(value === '[') path.push(key);
            value = parse_value(value, variables);
            obj[key] = value;
        }
    }

    return res;
}

module.exports = lkonParse;