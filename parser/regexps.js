module.exports = {
    header:
    {
        import: /^import"(?<path>[^"]+)"(?<encoding>\w+)as(?<key>(\w+(?=;$)|\[$))/,
        use: /^use(?<value>(\[$|[^;]+(?=as(?<key>(\[$|\w+(?=;$))))))/,
        destructuring: /^(?<variable_key>\w+)=>(?<variable_name>\w+);$/,
    },
    body:
    {
        line: /^@(?<key>(\w+|\*))=>(?<value>([^]+(?=;$)|\[$))/
    },
    values:
    {
        string: /^"(?<content>[^"]*)"$/,
        number: {
            test: function isNumber(str)
            {
                return !isNaN(str)
            }
        },
        regexp: /\/(?<expression>.+)\/(?<flags>\w*)/,
        variable: /\w+(\.\w+)*/,
        file: /"(?<path>[^"]+)"(?<encoding>\w+)/,
        date: /^"(?<date>([0-9]{1,2}-[0-9]{1,2}-[0-9]{1,4}(?:\, [0-9]{1,2}\:[0-9]{1,2}(?:\:[0-9]{1,2}(?:\.[0-9]{1,3})?)?)?))"date$/,
        template_string_variables: /\[(?<path>(\w+(\.\w+)*))\]/g,
        keywords: /^(True|False|Null|Undefined|NaN)$/g
    }
}