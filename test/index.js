require("../")({allowGlobal:true, allowRequire:true});

const parsed = require("./moscow.lkon");

console.log(`File: ./moscow.lkon\nParsed to:`);
console.log(parsed);
console.log(LKON.stringify(parsed, null, '\t'));