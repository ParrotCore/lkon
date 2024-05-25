const
    {
        readFileSync: read,
        existsSync: exists
    } = require('node:fs'),
    {
        join: path_join
    } = require('node:path')
    get_path = require('./get-path'),
    regexps = [
        //0 - File
        [
            {
                reg: /"(?<path>((?<=\\)"|[^\n"])*)"(?<encoding>[A-Za-z0-9]+)/,
                test: (str) => {
                    if(!regexps[0][0].reg.test(str)) return false;

                    let {
                        path,
                        encoding
                    } = str.match(regexps[0][0].reg).groups;

                    path = path_join(process.mainModule.path, path);

                    if(!encoding?.length || encoding == 'date') return false;
                    if(!Buffer.isEncoding(encoding)) throw Error(`"${encoding}" is not an encoding.`);
                    if(!path) throw Error('Path to file was not given.')
                    if(!exists(path)) throw Error(`Could not find file "${path}".`)
                    return true;
                }
            },
            (__reg, str, variables, variable_path) => {
                let {
                    path,
                    encoding
                } = str.match(regexps[0][0].reg).groups;

                path = path_join(process.mainModule.path, path);

                if(variables?.Main) variables.Main.setVariable(variable_path, str);

                return read(path,encoding)
            }
        ],
        //1 - Date
        [
            {
                reg: /"(?<date>((?<=\\)"|[^\n"])*)"date/,
                test: (str) => {
                    if(!regexps[1][0].reg.test(str)) return;

                    const {
                        date
                    } = str.match(regexps[1][0].reg).groups;

                    if(!new Date(date)) throw Error(`Could not recognize "${date}" as date.`)
                    return true;
                }
            },
            (__reg, str) => {
                const {
                    date
                } = str.match(regexps[1][0].reg).groups;

                return new Date(date);
            }
        ],
        //2 - String regexp:
        [
            /"((?<=\\)"|[^"])*"/,
            (__reg, str, variables, variable_path) => {
                res = str
                    .replace(/^\s*"|"(?:;)?$/g, '')
                    .replace(
                        /\[(?<path>[^\n\]]+)\]/g,
                        function(original_value, path_string)
                        {
                            let 
                                path = path_string?.split('.'),
                                value;

                            if(path?.length) try
                            {
                                value = get_path(variables, path);
                            }
                            catch(err){}

                            if(!value && value !== null) return original_value;
                            return value;
                        }
                    )

                if(variables?.Main && str.replace(/^\s*"|"(?:;)?$/g, '') !== res) variables.Main.setVariable(variable_path, str);
                return res;
            }
        ],
        //3 - Number 'pseudo-regexp':
        [
            {
                test: (str) => !isNaN(str.substring(0, str.length-1))
            },
            (__reg, str, variables, variable_path) => {

                let res = Number(str.substring(0, str.length-1));

                // Keeping notation of number.
                if(variables?.Main && str.substring(0, str.length-1) !== res.toString()) variables.Main.setVariable(variable_path, str);

                return res;
            }
        ],
        //4 - Keywords
        [
            /True|False|Undefined|NaN|Null/,
            (__reg, str) => {
                return {
                    True: true,
                    False: false,
                    Undefined: undefined,
                    NaN: NaN,
                    Null: null
                }[str.substring(0, str.length-1)];
            }
        ],
        //5 - RegExp
        [
            /\/(?<expression>((?<=\\)\/|[^\n\/])+)\/(?<flags>[a-zA-Z0-9]*)/,
            (reg, str) => {
                const {
                    expression,
                    flags
                } = str.match(reg).groups;

                return new RegExp(expression,flags);
            }
        ]
    ];

function parse_value(str, replacer, path, variables)
{
    if(str == '[') return [];
    for(
        const [
            reg,
            method
        ] of regexps
    ) 
        if(reg.test(str)) 
            return method(reg, str, variables, path);

    let value;
    try
    {
        value = get_path(
            variables,
            str
                .substring(0, str.length-1)
                .split('.')
        );

        if(variables?.Main) variables.Main.setVariable(path, str);
    }
    catch(err){}

    if(!value && typeof replacer === 'function') value = replacer(str);

    if(!value && value !== false && value !== 0 && value !== null && value !== NaN) value = null;
    return value;
}

module.exports = parse_value;