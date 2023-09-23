const { inspect } = require("util"),
      errors = {
        wrongInput: () => new TypeError(`Wrong type of data was given.`)
      };

function tabs(counter)
{
    let out = '';
    for(let i = 0; i < counter; i++) out += '\t';
    return out;
}

function writeBody(json, out, tabsCount)
{
    for(let i in json) if(!["__variables", "__imports"].includes(i))
    {
        let str = `${tabs(tabsCount)}@${!isNaN(i) ? '*' : i} => `
        if(json[i]?.__path) str += `${json[i].__path};`;
        else
        {
            if(typeof json[i] == 'string') str += `"${json[i].replace(/\n/g, "\\n")}";`;
            else if(typeof json[i] == 'number') str += json[i] + ';';
            else if(typeof json[i] == 'boolean') str += inspect(json[i])[0].toUpperCase() + inspect(json[i]).substring(1) + ';';
            else if(json[i] instanceof RegExp) str += json[i].toString() + ';';
            else if(inspect(json[i]) == 'undefined') str += "undefined;";
            else if(json[i] === null) str += "null;";
            else if(inspect(json[i]) == 'NaN') str += 'NaN;';
            else if(typeof json[i] == 'object') {
                str += '[';
                out.push(str);
                str = false;
                writeBody(json[i], out, tabsCount+1);
                out.push(`${tabs(tabsCount)}];`);
            }
        }
        if(str) out.push(str);
    }
    return out;
}

/**
 * 
 * @param {Object|Array} json - Json data to stringify.
 * @returns {String} Stringified lkon data ready to save.
 */

function lkonStringify(json)
{
    if(json?.toString() != '[object Object]' && !Array.isArray(json)) return errors.wrongInput();
    let output = [];
    for(let key in json.__imports)
        output.push(`import ${json.__imports[key].__path} as ${key};`);
    for(let key in json.__variables)
        output.push(`use ${json.__variables[key]} as ${key};`)
    output.push('[');    
    writeBody(json, output, 1);
    output.push('];');
    return output.join("\n");
}

module.exports = lkonStringify;