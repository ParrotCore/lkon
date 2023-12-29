const {readFileSync:read} = require("node:fs"),
      {stringify, parse} = require("../")({allowRequire:true});

let content = read("./test/moscow.lkon", "utf8"),
    parsed,
    stringified,
    required,
    times = [];

for(let i = 0; i < 3; i++) times[i] = [];

times[0].push(new Date().getTime());
parsed = parse(content);
times[0].push(new Date().getTime());
times[1].push(new Date().getTime());
stringified = stringify(parsed, null, '\t');
times[1].push(new Date().getTime());
times[2].push(new Date().getTime());
required = require("./warsaw.lkon");
times[2].push(new Date().getTime());

times = times.map((el,i) => {
    let key = ["Parsing", "Stringifying", "Requiring"][i],
        value = el.reduce((a,b) => b-a) + ' ms';

    return { operation: key, time: value }
});

console.table(times)
console.log(
    "\n\nParsed:\n",parsed,
    "\n\nStringified:\n",stringified,
    "\n\nRequired:\n",required
);