require("lkon")({allowGlobal: true})

const
    jsonData = {
        greeting: "Hello World"
    },
    lkonData = LKON.stringify(jsonData); 

console.log(
    lkonData,
    '\n',
    LKON.parse(lkonData)
)