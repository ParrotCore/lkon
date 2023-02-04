/* TO DO:
    - RegExp
    - Optimalization
*/

var iterator=0;

function writeTabs(num){
    let res = [];
    for(let i = 0; i<num; i++) res[i] = '\t'; 
    return res.join('');
}

function lineMaker(key, value, iteration){
    const line = [],
          tabs = writeTabs(iteration);

    line.push(`${tabs}@${key} => `);
    if(typeof value == 'object' && value !== null){
        line[0] += '[';
        for(let k of Object.keys(value)) line.push(lineMaker(Array.isArray(value) ? '*' : k, value[k], iteration+1));
        line.push(tabs + '];')
    }
    else if(typeof value == 'string') line[0] += `"${value.replace(/"/g, '\\"')}";`
    else line[0] += (typeof value == 'boolean' ? value.toString().substring(0,1).toUpperCase() + value.toString().substring(1) : value) + ';';
    return line.join("\n");
}

/**
 * 
 * @param {Object} jsonData 
 */
module.exports.stringify = function lkonStringify(jsonData){
    if(!jsonData || jsonData == null) throw Error("'jsonData' parameter was not given.");
	if(typeof jsonData !== 'object' || jsonData == null) throw TypeError("'jsonData' parameter must be type of Object");
    res = ["["];
    for(let key of Object.keys(jsonData))
        res.push(lineMaker(Array.isArray(jsonData) ? '*' : key, jsonData[key], 1));
    res.push("];");
    return res.join("\n");
}

function readLines(lines, parent){
    while(iterator < lines.length){
        const line = lines[iterator];
        if(line[0] == ']'){
            iterator++;
            return parent;
        }
        if(line[0] == '*' && !Array.isArray(parent)){
            if(Object.keys(parent).length > 0) throw SyntaxError("Unexpected '*' token at line " + (iterator+1));
            parent = [];
        }
        val = line[1];
        if(val == '[') {
            iterator++;
            val = readLines(lines,{})
            iterator--;
        }
        else if(/"(.)*"/.test(val)) val = val.substring(1, val.length-1);
        else if(!isNaN(val)) val = Number(val);
        else if(/^(True|False|null|undefined|NaN)$/.test(val)) val = {True: true, False: false, null: null, undefined: undefined, NaN: NaN}[val];
        else throw TypeError("Could not recognize '" + val + "' of any type at line " + (iterator+1) + ".")

        if(Array.isArray(parent)) parent.push(val);
        else parent[line[0]] = val;
        iterator++;
    }
    return parent;
}
/**
 * 
 * @param {string} lkonData 
 */
module.exports.parse = function lkonParse(lkonData){
    if(!lkonData) throw Error("'lkonData' parameter was not given.");
    if(typeof lkonData != 'string') throw TypeError("'lkonData' parameter must be of type string.");
    if(!/^\[|\](?:\;)?'$/.test(lkonData)) throw SyntaxError("All the data in LKON must be closed in [].")
    iterator = 0;
    let lines = lkonData.replace(/[\r]|[\t]+/g, '').split(/\n/).filter(el => !/^\#/.test(el));
    for(let i = 1; i < lines.length-1; i++){
        const line = lines[i];
        if(i == 1 && line.startsWith("*")) res = [];
        if(!/^(\[|\]\;|@(\*|[A-Z]([0-Z|\_]+))( )*\=\>( )*(\[|[A-Z]+\;|(?:\-)Infinity?|\"(.)*\"\;|(?:\-)?[0-9]+(?:\.[0-9]+)?\;|(?:\-)?[0-9]+(?:\.[0-9]+)?e\+[0-9]+\;|(?:\-)?0x[0-F]+\;|\.[0-9]+\;))$/i.test(line)) {
            if(!/\;$/.test(line)) throw SyntaxError("Unexpected token '" + line[line.length-1] + "', expecting ';'\nAt line " + (Number(i)+1) + '\n' + line);
            throw SyntaxError("Something is wrong with your LKON syntax at line: " + (Number(i)+1) + "\n" + line);
        }
        lines[i] = line.split(/@|( )*\=\>( )*|\;/).filter(el => el && !/^[ ]+$/.test(el));
    };
    return readLines(lines.slice(1, lines.length-1), {});
}