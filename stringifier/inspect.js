const { inspect: utilInspect } = require("node:util");

function isAssociativeArray(obj) {
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) return false;
  
    for (const key in obj) {
      if(!obj.hasOwnProperty(key)) continue;
      if(typeof key !== 'string' && typeof key !== 'symbol') return false;
    }
  
    return true;
  }

module.exports = function inspect(val, replacer)
{
    switch(true)
    {
        case typeof val == 'string':
        {
            return `"${val}"`;
        }
        break;
        case val === NaN || val === undefined || val === null || typeof val == 'number' || typeof val == 'boolean' || val instanceof RegExp:
        {
            let str = utilInspect(val);
            if(['undefined', 'true', 'false', 'null'].includes(str)) return str[0].toUpperCase() + str.substring(1);
            return str;
        }
        break;
        case val instanceof Date:
        {
            let res = [
                [
                    val.getDate().toString().padStart(2, '0'),
                    (val.getMonth()+1).toString().padStart(2, '0'),
                    val.getFullYear().toString().padStart(2, '0')
                ],
                [],
                []
            ]
            
            switch(true)
            {
                case val.getMilliseconds() > 0: res[2].push(val.getMilliseconds().toString().padStart(3, '0'));
                case val.getSeconds() > 0: res[1].push(val.getSeconds().toString().padStart(2, '0'));
                case val.getMinutes() > 0 || val.getHours() > 0: res[1].unshift(val.getMinutes().toString().padStart(2, '0'), val.getHours().toString().padStart(2, '0'))
            }

            res = res.filter(el => el.length);
            res = '"' + res[0].join("-") + (res.length > 1 ? ', ' + res[1].join(":") + (res.length > 2 ? '.' + res[2][0] : '') : '') + '"date';
            return res
        };
        break;
        default:
        {
            if(isAssociativeArray(val) || Array.isArray(val)) return '[';
            else if(!replacer) return false;
            else inspect(replacer(val), false);
        }
        break;
    }
}