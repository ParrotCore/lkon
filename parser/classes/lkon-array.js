class LKON_Array extends Array
{
    constructor(...args)
    {
        super(...args);
    }

    /************************************
    | Variables private property        |
    | will store data about original    |
    | values of currently parsed object |
    | Keys: path.join('.'),             |
    | Values: variable_name             |  
    ************************************/
    #variables = {};
    #head = [];

    getVariables()
    {
        return this.#variables;
    }

    setVariable(path, value)
    {
        this.#variables[path.join('.')] = value;
        return this;
    }

    setHead(arg)
    {
        this.#head = arg;
        return this;
    }

    getHead()
    {
        return this.#head;
    }
}

module.exports = LKON_Array;