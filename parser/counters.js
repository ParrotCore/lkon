module.exports = {
    counter: function(template)
    {
        let i = -1;
        return (show) => 
        {
            if(!show) i++;
            return (template ? template + i : i);
        }
    }
}