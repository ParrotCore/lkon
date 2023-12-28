const inspect = require("./inspect"),
      padTab = require("./padTab");

function readObject(obj, replacer, space, res, nestingCount)
{
    for(let key in obj)
    {
        let expression = `@${(isNaN(key) ? key : '*')}${space ? ' => ' : '=>'}`,
            val = inspect(obj[key], replacer);

        if(val)
        {
            expression += val;
            if(val == '[')
            {
                if(!Object.keys(obj[key]).length)
                {
                    expression += '];';
                    res.push(padTab(expression, space, nestingCount));
                }
                else
                {
                    res.push(padTab(expression, space, nestingCount));
                    readObject(obj[key], replacer, space, res, nestingCount+1);
                    res.push(padTab('];', space, nestingCount));
                }
            }
            else
            {
                expression += ';';
                res.push(padTab(expression, space, nestingCount));
            }
        }
    }
    return res;
}

/**
 * 
 * @param {Object|Array} obj JS Object to turn into LKON Data String.
 * @param {Function} replacer Method that will turn LKON-Non-Readable to readable value. 
 * @param {Number|String} space Number, or a character that will be a tab in output. 
 * @returns {String} LKON Data String
 */
module.exports = function stringify(obj, replacer, space)
{
    let res = ['['],
        nesting = 1;

    if(!space && space !== 0) space = 0;
    if(!replacer) replacer = undefined;

    readObject(obj, replacer, space, res, nesting);
    res.push('];')

    if(!space) return res.join("").replace(/\r\n|\n|\r/g,"\\n").replace(/\t/g, "\\t");
    else return res.join("\n");
}