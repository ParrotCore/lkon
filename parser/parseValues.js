const
    search = require("./get"),
    { existsSync: exists, readFileSync: read } = require("node:fs"),
    { values: regexps } = require("./regexps");

module.exports = function parseValues(str, variables, references)
{
    let parsed;
    if(regexps.string.test(str)){
        parsed = str
            .substr(1, str.length-2);

        for(let [key, value] of [
            ['\\n', '\n'],
            ['\\r', '\r'],
            ['\\t', '\t']
        ]) parsed = parsed.replace( new RegExp(key), value );

        if(regexps.template_string_variables.test(parsed))
        {
            tsv = parsed.match(regexps.template_string_variables)
            for(let variable of tsv)
            {
                try
                {
                    let res = module.exports(variable.substring(1, variable.length-1), variables);
                    parsed = parsed.replace(variable, res);
                } catch(error) {}
            }
        }
    }
    else if(regexps.number.test(str)) parsed = Number(str);
    else if(regexps.date.test(str)){
        const { date } = str.match(regexps.date).groups;
        parsed = new Date(date);
    }
    else if(regexps.file.test(str))
    {
        const { path, encoding } = str.match(regexps.file).groups;
        
        if(!Buffer.isEncoding(encoding) && encoding != 'bin') throw Error(`Cannot recognize '${encoding}' as supported encoding.`);
        if(!exists(path)) throw Error(`The file '${path}' does not exist.`);

        parsed = read(path, encoding != 'bin' ? encoding : undefined);
    }
    else if(regexps.regexp.test(str))
    {
        const { expression, flags } = str.match(regexps.regexp).groups;
        parsed = new RegExp(expression, flags);
    }
    else if(regexps.keywords.test(str))
    {
        parsed = {
            Undefined: undefined,
            False: false,
            True: true,
            NaN: NaN,
            Null: null
        }[str];
    }
    else if(regexps.variable.test(str)) parsed = search(str, variables)
    return parsed;
}