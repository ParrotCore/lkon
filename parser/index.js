const minify = require("./minifier"),
      regexps = require("./regexps"),
      lkonObject = require("./lkonObject"),
      parseValues = require("./parseValues"),
      destructure = require("./destructuring"),
      search = require("./get"),
      imported = [],
      { readFileSync: read, existsSync: exists } = require("node:fs");

/**
 * 
 * @param {String} string LKON Data to parse. 
 * @returns {Object|Array} LKON data parsed to JS data. 
 */
module.exports = function parse(string)
{
    const expressions = minify(string),
          variables = {};

    let state = 0,
        path = [],
        output = new lkonObject.object(),
        array_counters = {"": 0};

    variables.Main = output;

    for(let i = 0; i < expressions.length; i++)
    {
        const expression = expressions[i];
        switch(state)
        {
            case 0:
            {
                if(expression === '['){
                    state++;
                }
                else if(regexps.header.import.test(expression))
                {
                        let {path, encoding, key} = expression.match(regexps.header.import).groups;
                            
                        if(!Buffer.isEncoding(encoding) && encoding != 'bin') throw Error(`Cannot recognize '${encoding}' as encoding.`);
                        if(encoding == 'bin') throw Error(`Cannot interprete file read with 'bin' encoding.`);
                        if(!exists(path)) throw Error(`File '${path}' not found.`);

                        let
                            file_content = read(path, encoding),
                            file;

                        if(imported.some(el => el[0] == file_content)) file = imported.find(el => el[0] == file_content)[1];
                        else
                        {
                            file = module.exports(file_content);
                            imported.push([file_content, file]);
                        }

                        if(key != '[') variables[key] = file;
                        else
                        {
                            let {variables: destructured} = destructure(expressions, i, file);
                            for(let k in destructured) variables[k] = destructured[k];
                        }
                }
                else if(regexps.header.use.test(expression))
                {
                    let {value, key} = expression.match(regexps.header.use).groups;
                    if(value != '[') value = parseValues(value, variables);
                    else
                    {
                        let start = i+1,
                            end;

                        for(end = structuredClone(start); end < expressions.length; end++) if(expressions[end].startsWith(']') && expressions[end] != '];') break;

                        value = module.exports(`[${expressions.slice(start,end).join("")}];`,variables);
                        i = end;
                    }
                    if(key && key != '[') variables[key] = value;
                    else {
                        if(!expressions[i].endsWith('['))
                        {
                            key = expressions[i].substring(3, expressions[i].length-1);
                            variables[key] = value;
                        }
                        else
                        {
                            let {variables: destructured, index} = destructure(expressions, i, value);
                            for(let k in destructured) variables[k] = destructured[k];
                            i = index;
                        }
                    }
                }
            }
            break;
            case 1:
            {
                if(expression === '];') 
                {
                    if(path.length > 0){
                        path.pop();
                    }
                    else state++;
                }
                else if(regexps.body.line.test(expression))
                {

                    let {key, value} = expression.match(regexps.body.line).groups;

                    if(key == '*')
                    {
                        key = array_counters[path.join(".")]++;
                        if(expressions[i-1]=='[') output = new lkonObject.array();
                    }

                    let current = path.length > 0 ? search(path.join("."), output) : output;
                    if(value != '[') value = parseValues(value,variables)
                    else
                    {
                        path.push(key);
                        array_counters[path.join(".")]=0;
                        if(expressions[i+1]?.startsWith('@*')) value = [];
                        else value = {};
                    }
                    current[key] = value;
                }
            }
            break;
        }
    }
    for(let k in variables) output.setVariable(k, variables[k]);
    return output;
}