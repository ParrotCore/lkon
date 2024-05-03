// TODO: Syntax Analyzis with errors.

function minify(str)
{
    const
        lines = str.split(/\n/),
        split_points = [0],
        res = [];

    let
        minified = '',
        COMMENT_S = false,
        COMMENT_M = false,
        STRING = false,
        REGEXP = false;

    for(let i = 0; i < lines.length; i++) 
    {
        const line = lines[i];
        if(line) for(let j = 0; j < lines[i].length; j++)
        {
            if(!COMMENT_S && !COMMENT_M && !STRING && !REGEXP)
            {
                if(/\s/.test(line[j])) continue;
                else
                if(line[j] === '#') COMMENT_S = true;
                else
                if(line[j] + line[j+1] + line[j+2] == '\'\'\'')
                {
                    COMMENT_M = true;
                    j+=2;
                    continue;
                }
                else
                if(line[j] == '"') STRING = true;
                else
                if(line[j] == '/') REGEXP = true;
                else
                if(line[j] == '[' || line[j] == ';')
                {
                    split_points.push(minified.length+1);
                }
            }
            else
            {
                if(COMMENT_S && j+1 == line.length)
                {
                    COMMENT_S = false;
                    continue;
                }
                else
                if(COMMENT_M && line[j-2] + line[j-1] + line[j] == '\'\'\'' && line[j+1] !== '\'')
                {
                    COMMENT_M = false;
                    continue;
                }
                else
                if(STRING)
                {
                    if(line[j] == '"' && line[j-1] !== '\\') STRING = false;
                }
                else
                if(REGEXP && line[j] == '/' && line[j-1] !== '\\') REGEXP = false;
            }
            if(!COMMENT_M && !COMMENT_S)
            {
                minified += line[j]
                if(STRING && j+1 == line.length) minified += '\n';
            }
        }
        else if(STRING) minified += '\n';
    }
    
    for(let i = 1; i < split_points.length; i++) res.push(
        minified.substring(
            split_points[i-1], 
            split_points[i]
        )
    )
    
    return res;
}

module.exports = minify;