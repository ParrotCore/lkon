require('./lkon.js')({allowRequire:true, allowGlobal:true}),

console.log("Requiring time:")
console.time("requiring");

const required = require("./file.lkon");

console.timeEnd("requiring");
console.log(required,"\nParsing time:")
console.time("parsing");

const parsed = LKON.parse(
`#startlkon
[ 
	@username => "Lena Krukov";
	@age => 1.9e+28;
	@eyes => [
		@* => 2311679;
		@* => 5518079;
	];
	@email => undefined;
	@access => 0.9;
];
#endlkon`
	  );

console.timeEnd("parsing");
console.log(parsed,"\nStringifying time:")
console.time("stringifying");

const stringifized = LKON.stringify(parsed);

console.timeEnd("stringifying");
console.log(stringifized);