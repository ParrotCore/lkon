function commentRemover(str)
{
    if(!/'''|#/.test(str)) return str;

    let insideString,
        insideRegex,
        insideComment,
        res = str.replace(/\s*#[^\r\n]*/g, '').split("");

    for(let i = 0; i < res.length; i++)
    {
        if(res[i] == '"' && res[i-1] != '\\' && !insideRegex && !insideComment) insideString = !insideString;
        else if(res[i] == '/' && res[i-1] != '\\' && !insideString && !insideComment) insideRegex = !insideRegex;
        else if(res[i] + res[i+1] + res[i+2] == "'''" && res[i-1] != '\\' && !insideString && !insideRegex)
        {
            insideComment = !insideComment;

            let j = i;
            for(; j <= i + 2; j++) res[j] = "to_remove";
            i = j-1;
        }
        else if(insideComment) res[i] = "to_remove";
    }
    
    return res.filter(el => el != "to_remove").join("");
}

module.exports = function minify(str)
{
    let 
        replaced = commentRemover(str)
            .replace(/\s+(?=(?:[^"]*"[^"]*")*[^"]*$)/g, ""),
        splitPoints = [0],
        insideString,
        insideRegex,
        res = [];

    for (let i in replaced)
    {
        if(replaced[i] == '"' && replaced[i-1] != '\\' && !insideRegex) insideString = !insideString;
        else if(replaced[i] == '/' && replaced[i-1] != '\\' && !insideString) insideRegex = !insideRegex;
        else if((replaced[i] == ';' || replaced[i] == '[') && !insideString && !insideRegex) splitPoints.push(Number(i)+1);
    }

    for(let i = 0; i < splitPoints.length; i++)
    {
        const string = replaced.substr(
            splitPoints[i],
            splitPoints[i+1] - splitPoints[i]
        )

        if(string.length > 0) res.push( replaced.substr( splitPoints[i], splitPoints[i+1] - splitPoints[i]) );
    }
    return res;
}