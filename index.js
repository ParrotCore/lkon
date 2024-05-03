const 
    { version } = require('./package.json'),
    { 
        readFileSync: read
    } = require('node:fs'),
    parse = require('./parser')
    stringify = require('./stringifier');

/**
 * 
 * @param {object} options
 * @param {true|false} options.allowGlobal
 * @param {true|false} options.allowRequire 
 * @returns {Object}
 */
function init(options={ allowGlobal:false, allowRequire:false })
{
    if(typeof options !== 'object' || options === null || Array.isArray(options)) throw Error('\'options\' argument must be an object.');

    const {
        allowGlobal,
        allowRequire
    } = options;

    if(allowRequire) require.extensions['.lkon'] = (mod, filename) => {
        let
            parsed = read(filename, 'utf-8');
            
        parsed = parse(parsed);
        mod.exports = parsed
    }

    if(allowGlobal) global.LKON = {
        parse,
        stringify,
        version
    };

    return {
        parse, 
        stringify, 
        version
    }
}

module.exports = new Proxy(
    init,
    {
        get(__, prop)
        {
            if(['parse','stringify','version'].includes(prop?.toLowerCase()))
            {
                return {
                    parse,
                    stringify,
                    version
                }[prop.toLowerCase()];
            }
            else return null;
        }
    }
)