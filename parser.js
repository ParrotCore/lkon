const 
    regExps = {
        keywordTest: /^(this|import|use|as)$/,
        variableKeyTest: /[^a-zA-Z_][^a-zA-Z0-9_]*/,
        headerVariable: /[\t ]*use( )+(?<value>(.+))( )+as( )+(?<key>(.+))( )*;[\t ]*/i,
        headerImport: /[\t ]*import( )+\"(?<path>(.+))\"(?<encoding>(\w+))( )+as( )+(?<key>(.)+)( )*;[\t ]*/i,
        lineTest: /^[\t ]*@(?<key>(\*|[a-z_][a-z0-9_]*))( )+\=\>( )+(?<value>((.)+;|\[))[\t ]*$/i,
        lineMultiTest: /([\t ]*@(\*|[a-z_][a-z0-9_]*)( )+\=\>( )+((.)+;|\[)[\t ]*){2,}/i,
        fileTest: /^\"(?<file>(.)+)\"(?<encoding>(\w+))$/,
        stringTest: /^\"(?<string>(.)+)\"$/,
        regexpTest: /\/(?<expression>(.+))\/(?<flags>([a-z]*))/,
        thisTest: /^this(?<path>((\.[a-zA-Z0-9_]+))*)$/,
        importTest: /^(?<object>([a-zA-Z_][a-zA-Z0-9_]*))(?<path>(\.[a-zA-Z0-9_]+))$/,
        numberTest: {test: (str) => !isNaN(str)},
        keyTest: /__variables|__imports/g,
        reservedProperties: /__path|__type|__original/g,
        assignmentMark: /^[\t ]*[^\t ]+( )+(?<mark>(.+))( )+[^\t ]+[\t ]*$/
    },
    possibleValues = {
        undefined: undefined,
        False: false,
        True: true,
        null: null,
        NaN: NaN
    },
    possibleValuesKeys = Object.keys(possibleValues),
    errors = {
        missingSemicolon: (line, position) => new SyntaxError(`Missing ';' at ${line+1}:${position}`),
        missingKeyPrefix: (line, position) => new SyntaxError(`Missing key prefix '@' at ${line+1}:${position}`),
        missingAssignmentMark: (line, position) => new SyntaxError(`Missing assignment mark '=>' at ${line+1}:${position}`),
        wrongAssignmentMark: (line, position, name) => new SyntaxError(`Wrong assignment mark '${name}' at ${line+1}:${position}`),
        unexpectedToken: (line, position, token) => new SyntaxError(`Unexpected token '${token}' at ${line+1}:${position}`),
        wrongSyntax: (line, position) => new SyntaxError(`Something is wrong with syntax at ${line+1}:${position}`),
        unexpectedValue: (line, position, value) => new TypeError(`Unexpected '${value}' value at ${line+1}:${position}`),
        unexpectedEnd: (line, position) => new SyntaxError(`Unexpected end of LKON at ${line+1}:${position}`),
        keywordError: (line, position, name) => new SyntaxError(`Name '${name}' is reserved for keywords at ${line+1}:${position}`),
        keyError: (line, position, name) => new TypeError(`Key name '${name}' is reserved for LKON ${name.replace(/^__/, '')} object at ${line+1}:${position}.`),
        reservedProperty: (line, position, name) => new TypeError(`Key name '${name}' is reserved for LKON data-${name.replace(/^__/, '')} property at ${line+1}:${position}`),
        variablesConflict: (line, position, name, type) => new Error(`'${name}' key has already been reserved for ${["variable","import"][type]} at ${line+1}:${position}`),
        headerVariableInBody: (line, position) => new SyntaxError(`Cannot use 'use' statement inside of object body, at: ${line+1}:${position}`),
        importInBody: (line, position) => new SyntaxError(`Cannot use 'import' statement inside of object body, at: ${line+1}:${position}`)
    },
    {readFileSync, existsSync} = require("node:fs"),
    {inspect} = require('node:util');

function parseString(value)
{
    let val = value.substring(1, value.length-1).replace(/\\n/g, "\n");
    for(
        let [reg, change] of [
            [/\\n/g, "\n"],
            [/\\t/g, "\t"],
            [/\\\"/g, "\""]
        ]
    ) val = val.replace(reg, change)
    return val;
};

function parseNumber(value)
{
    return Number(value);
}

function parseMore(value)
{
    return possibleValues[value];
}

function parseFile(value)
{
    let {file, encoding} = value.match(regExps.fileTest).groups;
    if(encoding == 'bin') encoding = undefined;
    else if(encoding && !Buffer.isEncoding(encoding)) throw Error(`Cannot recognize ${encoding} as encoding.`);
    if(!existsSync(file)) throw new Error(`There is no file at '${file}'.`);
    return Object.assign(readFileSync(file, encoding), {__path: `"${file}"${encoding || 'bin'}`, __type: !encoding ? 'file-buffer' : 'file-string'});
}

function parseRegexp(value)
{
    const {expression, flags} = value.match(regExps.regexpTest).groups;
    return new RegExp(expression, flags);
}

function getImport(line, lineNumber, imports, variables)
{
    let {path, encoding, key} = line.match(regExps.headerImport).groups;
    if(Object.keys(variables).includes(key)) throw errors.variablesConflict(lineNumber, line.indexOf(key), key, 0);
    if(regExps.keywordTest.test(key)) throw errors.keywordError(lineNumber, line.indexOf(key), key)
    if(regExps.variableKeyTest.test(key)){
        let [err] = key.match(regExps.variableKeyTest);
        throw errors.unexpectedToken(lineNumber, line.indexOf(err), err)
    }
    if(encoding == 'bin') throw TypeError(`Cannot parse binary file at ${Number(lineNumber)+1}:${line.indexOf('bin')}`);
    let value;
    try
    {
        value = lkonParse(parseFile(`"${path}"${encoding}`));
    }
    catch(error)
    {
        if(error.name == 'RangeError') throw SyntaxError(`One or more of imported files is causing "import-inception" that takes maximum call stack size and causes RangeError at ${Number(lineNumber)+1}:${line.indexOf(line.replace(/[\t ]+/g, '')[0])}`);
        throw error;
    }
    imports[key] = Object.assign(value, {__path: `"${path}"${encoding}`});
}

function getVariable(line, lineNumber, variables, imports)
{
    let {value, key} = line.match(regExps.headerVariable).groups;
    if(Object.keys(imports).includes(key)) throw errors.variablesConflict(lineNumber, line.indexOf(key), key, 1);
    if(regExps.keywordTest.test(key)) throw errors.keywordError(lineNumber, line.indexOf(key), key)
    if(regExps.variableKeyTest.test(key)){
        let [err] = key.match(regExps.variableKeyTest).groups
        throw errors.unexpectedToken(lineNumber, line.indexOf(err), err)
    }
    if(regExps.stringTest.test(value)) value = parseString(value);
    else if(regExps.numberTest.test(value)) value = parseNumber(value);
    else if(possibleValuesKeys.includes(value)) value = parseMore(value);
    else if(regExps.fileTest.test(value)) value = parseFile(value)
    else if(regExps.regexpTest.test(value)) value = parseRegexp(value);
    else throw errors.unexpectedValue(lineNumber, line.indexOf(value), value)

    variables[key] = value;
}

function getThis(obj, path, [line, lineNumber])
{
    if(typeof path == 'string')
    {
        path = path.match(regExps.thisTest).groups.path.split(".");
        path.shift();
    }
    
    if(!Object.keys(obj).includes(path[0])) throw Error(`Cannot read property '${path[0]}' at ${lineNumber}:${line.indexOf(path[0])}`);
    if(path.length > 1 && (typeof obj[path[0]] != 'object' || obj[path[0]] == null)) throw Error(`Cannot read property of '${typeof obj}' at ${lineNumber}:${line.indexOf(path[0])}`)

    if(path.length > 1) return getThis(obj[path[0]], path.slice(1, path.length), [line, lineNumber]);
    
    return obj[path[0]];
}

function getImportValue(obj, path, [line, lineNumber])
{
    if(typeof path == 'string')
    {
        matches = path.match(regExps.importTest).groups;
        path = matches.path.length ? [matches.object, ...matches.path.split('.').slice(1)] : [matches.object];
        if(!Object.keys(obj).includes(path[0])) throw Error(`'${path[0]}' was not imported at ${lineNumber}:${line.indexOf(path[0])}`)
    }
    if(!Object.keys(obj).includes(path[0])) throw Error(`Cannot read property '${path[0]}' at ${lineNumber}:${line.indexOf(path[0])}`);
    if(path.length > 1 && (typeof obj[path[0]] != 'object' || obj[path[0]] == null)) throw Error(`Cannot read property of '${typeof obj}' at ${lineNumber}:${line.indexOf(path[0])}`)

    if(path.length > 1) return getThis(obj[path[0]], path.slice(1, path.length), [line, lineNumber]);
        return obj[path[0]];
}

function addValue(obj, path, value)
{
    if (path.length === 0) {
        return value;
    }

    const key = path[0];
    if (Array.isArray(obj)) {
        const index = path.length > 1 ? obj.length-1 : obj.length;
        obj[index] = addValue(obj[index], path.slice(1), value);
    } else {
        obj[key] = addValue(obj[key], path.slice(1), value);
    }

    return obj;
}

/**
*
* @param {String} lkonData - string with lkon data.
* @returns {Object} - lkon data parsed to js object.
*/
function lkonParse(lkonData)
{
    const lines = lkonData.replace(/\r/g, '').split(/\n/).map(el => el.replace(/#(.)*$/g, ''))

    /* Mode *******
    * 0 - Header; *
    * 1 - Body;   *
    * 2 - End;    *
    **************/

    let
        mode = 0,
        variables = {},
        variablesKeys,
        imports = {},
        importsKeys,
        output = {},
        path = [];
    for(let i = 0; i < lines.length; i++) if(lines[i])
    {
        const clearLine = lines[i].replace(/^[\t ]+|[\t ]+$/g, '');
        switch(mode)
        {
            case 0:
            {
                if(clearLine == '[')
                {
                    if(lines[i+1]?.match(regExps.lineTest)?.groups?.key == '*') output = [];
                    mode = 1;
                }
                else if(clearLine == '[];') mode = 2;
                else if(clearLine != '')
                {
                    if(regExps.headerVariable.test(lines[i])) getVariable(lines[i], i, variables, imports);
                    else if(regExps.headerImport.test(lines[i])) getImport(lines[i], i, imports, variables);
                    else
                    {
                        if(!lines[i].endsWith(';')) throw errors.missingSemicolon(i, lines[i].length);
                        else throw errors.wrongSyntax(i, lines[i].indexOf(clearLine[0]))
                    }
                }
            }
            break;
            case 1:
            {
                if(clearLine == '];')
                {
                    if(!path.length) mode = 2;
                    else path.pop();
                }
                else if(clearLine.length)
                {
                    if(regExps.lineMultiTest.test(lines[i])) throw errors.unexpectedToken(i, clearLine.replace("@", '').indexOf('@'), '@');
                    if(regExps.lineTest.test(lines[i]))
                    {
                        if(!variablesKeys) variables ? variablesKeys = Object.keys(variables) : [];
                        if(!importsKeys) imports ? importsKeys = Object.keys(imports) : [];
                        
                        let {key, value} = lines[i].match(regExps.lineTest).groups,
                            oldValue = value;
                        if(value.endsWith(";")) value = value.substring(0, value.length-1);

                        if(regExps.stringTest.test(value)) value = parseString(value);
                        else if(regExps.numberTest.test(value)) value = parseNumber(value);
                        else if(possibleValuesKeys.includes(value)) value = parseMore(value);
                        else if(regExps.fileTest.test(value)) value = parseFile(value)
                        else if(regExps.regexpTest.test(value)) value = parseRegexp(value);
                        else if(value == '['){
                            if(lines[i+1]?.match(regExps.lineTest).groups.key == '*')
                                value = [];
                            else
                                value = {};
                        }
                        else if(value == '[]'){
                            value = {};
                        }
                        else if(regExps.thisTest.test(value)) value = Object.assign(getThis(output, value, [lines[i], i]), {__path: value, __type: 'this-variable'});
                        else if(variablesKeys.includes(value))
                        {
                            try 
                            {
                                value = Object.assign(variables[value], {__type: 'variable', __path: value});
                            }
                            catch(error)
                            {
                                value = Object.assign(false, {__type: 'variable', __path: value, __original: inspect(variables[value])});
                            }
                        }
                        else if(regExps.importTest.test(value)) value = Object.assign(getImportValue(imports, value, [lines[i], i]), {__path: value, __type: 'import-variable'});
                        else throw errors.unexpectedValue(i, lines[i].indexOf(value), value)

                        if(!path.length && regExps.keyTest.test(key)) throw errors.keyError(i, lines[i].indexOf(key), key);
                        if(regExps.reservedProperties.test(key)) throw errors.reservedProperty(i, lines[i].indexOf(key), key);
                        path.push(key)
                        addValue(output, path, value)
                        if(oldValue != '[') path.pop();
                    }
                    else
                    {
                        if(regExps.headerImport.test(lines[i])) throw errors.importInBody(i, lines[i].indexOf(clearLine[0]));
                        if(regExps.headerVariable.test(lines[i])) throw errors.headerVariableInBody(i, lines[i].indexOf(clearLine[0]));
                        if(!clearLine.endsWith(';') && !clearLine.endsWith('[')) throw errors.missingSemicolon(i, lines[i].length)
                        if(!clearLine.startsWith('@') && !clearLine == '];') throw errors.missingKeyPrefix(i, lines[i].indexOf(clearLine[0]));
                        if(!clearLine.includes('=>') && clearLine != '];')
                        {
                            if(regExps.assignmentMark.test(lines[i])) {
                                let {mark} = lines[i].match(regExps.assignmentMark).groups;
                                throw errors.wrongAssignmentMark(i, lines[i].indexOf(mark), mark);
                            }
                            else throw errors.missingAssignmentMark(i, lines[i].indexOf(clearLine[0]))
                        }
                        throw SyntaxError(`Something is wrong with LKON Syntax at ${i}:${lines[i].length}`)
                    };
                }
            }
            break;
            case 2:
            {
                if(clearLine.length) throw errors.unexpectedEnd(i, lines[i].indexOf(clearLine[0]));
            }
            break;
        }
    }
    output.__variables = variables;
    output.__imports = imports;
    return output;
}

module.exports = lkonParse;