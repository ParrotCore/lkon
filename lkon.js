const parse = require("./parser.js"),
      stringify = require("./stringifier.js"),
      { version } = require("./package.json"),
      { readFileSync } = require('node:fs');

/**
 * 
 * @param {Object} initOptions - Options for module initialization.
 * @param {Boolean} initOptions.allowRequire - Set to true if you want to require files with .lkon extension.
 * @param {Boolean} initOptions.allowGlobal - Set to true if you want to have global LKON Object with parse, and stringify methods. 
 * @returns {Object} - LKON Object with parse and stringify methods, and also version string.
 */
function lkonInit({allowRequire, allowGlobal})
{
    if(allowRequire)
        require.extensions['.lkon'] = (mod,filename) => {
            try
            {
                const content = readFileSync(filename, 'utf8'),
                    parsedData = parse(content);
                mod.exports = parsedData;
            }
            catch(error)
            {
                throw new Error(`Error loading ${filename}: ${error.message}`)
            }
        };
    if(allowGlobal)
        global.LKON = {
            parse,
            stringify
        }
    return {parse, stringify, version}
}

module.exports = lkonInit;