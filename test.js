const lkon = require('./lkon.js'),
	  { writeFileSync } = require('fs'),
	  object = {
		city: "Moscow",
		population: 17200000,
		alphabetRegexp: /^[\p{Script=Cyrillic}\p{P}]+$/u,
		monuments: [
			"St. Basil's Cathedral",
			"Kremlin",
			"Red Square"
		],
		dates: {
			first_mentioned: 1147
		},
		government: {
			body: [
				"City Duma"
			],
			mayors: [
				{
					name: "Sergey",
					surname: "Sobyanin",
					function: "main"
				},
				null
			],
		},
		metro: {
			operator: "Moskovskiy Metropoliten",
			lines: 15,
			since: 1935,
			length: 424.7,
			stations: 247
		},
		more: {
			capitalCity: "Russia",
			highestTemperature: 38.2,
			lowestTemperature: -42.1,
			coffeeConsuments: Infinity,
			color: 0xABCDEF,
			tobaccoConsuments: 5e+27,
			rate: .85,
			cityDefinition: undefined
		}
	  }

let stringifized,
	parsed;
console.time("json");
	stringifized = JSON.stringify(object,null,"\t");
	parsed = JSON.parse(stringifized);
console.timeEnd("json");
console.time("lkon");
	stringifized = lkon.stringify(object);
	parsed = lkon.parse(stringifized);
console.timeEnd("lkon");
console.log("JSON --> LKON && LKON --> JSON\n\n",stringifized,"\n\n",parsed);
writeFileSync('./file.lkon',stringifized,'utf8');