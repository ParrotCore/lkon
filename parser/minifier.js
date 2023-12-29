module.exports = function minify(str)
{
    let 
        replaced = str
            .replace(/(#[^\n\r]*|'''[^]+''')(?=(?:[^"]*"[^"]*")*[^"]*$)/g, "")
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