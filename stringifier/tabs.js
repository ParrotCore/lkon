function get_mark(input)
{
    let 
        res = '';

    if(typeof input === 'number')
    {
        let
            num = Math.abs(input);

        for(let i = 0; i < num; i++) res += ' ';
    }
    else res = input;
    return res;
}

function tabs(spaces, iteration)
{
    if(
        typeof spaces !== 'number' && typeof spaces !== 'string' 
        ||
        typeof spaces === 'string' && !/^\s+$/.test(spaces)
    ) throw Error('\'spaces\' must be a number of spaces, or a whitespace character.');

    if(spaces === 0 || iteration === 0) return '';

    let
        res = '',
        mark = get_mark(spaces);

    for(let i = 0; i < iteration; i++) res += mark;

    return res;
}

module.exports = tabs;