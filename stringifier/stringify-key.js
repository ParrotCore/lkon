function stringify_key(key)
{
    let res = key;
    if(!isNaN(res)) res = '*';

    return `@${res}`;
}

module.exports = stringify_key;