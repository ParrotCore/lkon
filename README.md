# Hello Everyone!
I'm glad to see all these downloads in statistics.
Here I come with some new functionalities for LKON
- ParrotCore, Language for Konfiguration Notation's Author

# Idea
Every project starts with just a simple idea!
I came up with an idea to create easy-readable configuration language, with special abilities, so there it is!

# Coming soon
New extension for Visual Studio Code will be available soon to let you all read colourized syntax of LKON!
We'll contain here more information about it as soon as possible!

# LKON Supports these types of data:
- Files - `"./path/to/file"encoding`;
- RegExps - `/your_expression_here/flags`;
- String - `"string"`;
- undefined - `undefined`;
- Boolean - `True` or `False`;
- null - `null`;
- Infinity - `Infinity`;
- Number - (every kind of notation!) `0x0001` or `1` or `1e+21` or `.1` or `-1`;
- NaN - `NaN`;

# Remember
- Before you use it, you need to init this by require("lkon")({allowGlobal: true|false, allowRequire: true|false});
* If you set allowGlobal to true, LKON global object will be created.
* If you set allowRequire to true, you will be able to read files with ".lkon" extension using require method, e.g. require("./path/to/file.lkon").
- Every line (except empty ones, and the ones ending with `[`) of lkon code must end with `;`.
- Object keys must be set with `@` at the beggining;
- An assigment mark is `=>`;
- Object is set an Array if it includes data with `*` keys;
- You can use single-line comments by following the text with `#`;
- You can read files with `bin` encoding, the output will be a Buffer;
- Now you can use variables by simply writing `use value as key;` (e.g. `use 10 as ten;`), at the top of the file, but remember variables cannot be objects;
- You can also import another lkon file and use its content by writing `import "./path/to/file.lkon"utf8 as key;`;
- Now you can use one variable in many places using `this` object which represents current files parsed content!

# How to use it?
Using this module is very simple:
```js
const lkon = require('lkon')();

lkon.parse(
`
use "./private.key"bin as privateKey;
use "./public.key"bin as publicKey;
use "v2.0.0" as version;
import "./database.lkon"utf8 as db;


[
  @version => version;
  @admin => [
    @username => "root";
    @password => "Q@wertyuiop";
  ];
  @keys => [
    @public => publicKey;
    @private => privateKey;
  ];
  @database => [
    @host => db.host;
    @port => db.port;
    @username => this.admin.username;
    @password => this.admin.password;
  ];
  @localhostDirectory => "./views";
  @maxPasswordLength => 128;
  @passwordRegex => /[^a-zA-Z0-9\!@#$%\^&\*\(\)\{\}\[\];"'\/\\\.,]/g;
];
`
)
/* Expecting:
	{
		version: "v2.0.0",
		admin: {
			username: "root",
			password: "Q@wertyuiop"
		},
		keys: {
			public: <Buffer A7 B2 C7 ...>,
			private: <Buffer C3 A1 B8 ...>
		},
		database: {
			host: "127.0.0.1",
			port: 80,
			username: "root",
			password: "Q@wertyuiop"
		},
		localhostDirectory: "./views",
		maxPasswordLength: 128,
		passwordRegex: /[^a-zA-Z0-9\!@#$%\^&\*\(\)\{\}\[\];"'\/\\\.,]/g
	}
*/

lkon.stringify(
	[
		{
			username: "JohnDoe",
			age: 24,
			email: "john.doe@example.com",
			password: "password",
			favRegexp: /[abc]+/
		},
		{
			username: "FooBar",
			age: 20,
			email: "foo.bar@example.com",
			password: "password",
			favRegexp: /[def]+/
		},
		{
			username: "CatSamson",
			age: 21,
			email: "cat.samson@example.com",
			password: "password",
			favRegexp: /[ghi]+/
		}
	]
)
/*Expecting:
	[
		@* => [
			@username => "JohnDoe";
			@age => 24;
			@email => "john.doe@example.com";
			@password => "password";
			@favRegexp => /[abc]+/;
		];
		@* => [
			@username => "FooBar";
			@age => 20;
			@email => "foo.bar@example.com";
			@password => "password";
			@favRegexp => /[def]+/;
		];
		@* => [
			@username => "CatSamson";
			@age => 21;
			@email => "cat.samson@example.com";
			@password => "password";
			@favRegexp => /[ghi]+/;
		];
	]
*/
```