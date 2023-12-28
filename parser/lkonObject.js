module.exports = {
    object: class LKONObject extends Object {
        constructor()
        {
            super();
            this.#variables.Main = this;
            return this;
        }

        #variables = {};

        setVariable(key, value)
        {
            this.#variables[key] = value;
            return this;
        }

        getVariable(key)
        {
            if(!key || !this.#variables[key]) return this.#variables;
            return this.#variables[key];
        }
    },
    array: class LKONArray extends Array {
        constructor()
        {
            super();
            this.#variables.Main = this;
            return this;
        }

        #variables = {};

        setVariable(key, value)
        {
            this.#variables[key] = value;
            return this;
        }

        getVariable(key)
        {
            if(!key || !this.#variables[key]) return this.#variables;
            return this.#variables[key];
        }
    }
}