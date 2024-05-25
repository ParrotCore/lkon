const
    {
        join: path_string
    } = require('node:path'),
    tabs = require('./tabs'),
    import_regexp = /import"(?<path>((?<=\\)"|[^\n"])+)"(?<encoding>[A-Za-z0-9-_]+)as(?<key>[^]+)/,
    use_regexp = /use(?<value>(\[|([^\[\n]+)(?=as)))(?:(?<!\[)(as(?<key>[^;]+)))?/;

function stringify_head(arr, space)
{
    let 
        nesting_count = 0;

    for(i in arr)
    {
        let expression = arr[i];
        
        if(expression.startsWith('import'))
        {
            if(expression.endsWith('['))
            {
                arr[i] = `import ${expression.slice(6, -3)} as [`;
                nesting_count = 1;
            }
            else
            {
                const
                    {
                        key,
                        path,
                        encoding
                    } = expression.match(import_regexp).groups;
                arr[i] = `import "${path_string(path)}"${encoding} as ${key};`;
            }
        }
        else
        if(expression.startsWith('use'))
        {
            if(expression === 'use[')
            {
                arr[i] = 'use [';
                nesting_count = 1;
            }
            else
            if(expression.endsWith('['))
            {
                arr[i] = `use ${expression.slice(3, -3)} as [`
                nesting_count = 1;
            }
            else
            {
                const
                    {
                        value,
                        key
                    } = expression.match(use_regexp).groups;

                arr[i] = `use ${value} as ${key};`
            }
        }
        else 
        if(expression.startsWith(']as'))
        {
            arr[i] = `] as ${expression.substring(3)}`;

            if(expression.endsWith('[')) nesting_count = 1;
            else
            {
                nesting_count = 0;
                if(space) arr[i] += '\n';
            }
        }
        else
        {
            if(expression.endsWith('[')) nesting_count++;
            else if(expression === '];')
            {
                nesting_count--;
                if(space) arr[i] += '\n';
            }
            
            if(expression.includes('=>')) arr[i] = `${expression.substring(0, expression.indexOf('=>'))} => ${expression.substring(expression.indexOf('=>')+2)}`;
            arr[i] = `${tabs(space, nesting_count - (expression.endsWith('[') ? 1 : 0))}${arr[i]}`;
        }
    }

    return space ? [...arr, '\n'].join('\n') : arr.join('');
}

module.exports = stringify_head;