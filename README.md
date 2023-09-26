# About project...
Language for Konfiguration Object Notation was created to be something brand new, easy human-readable, auto-documented, and easy-changeable.
LKON lets you use variables and even read other files to access data from them to re-use them.
This makes configuration-files faster to write, use, and edit.

![LKON](./icon.png)

---

# Highlighting
Are you bored and tired of looking at LKON Syntax in the only one color? <br/>
Well, we have something special for you. <br/>
Thanks to my friend (**yobonez**) we now have special VSC addon with highlighter for LKON files. <br/>
The only thing you have to do is download it in VSC marketplace:
- Name of addon: `LKON Syntax Hightlighting`
- [GitHub](https://github.com/yobonez/vscode-lkon-highlighting)

---

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

---

# Remember
- Before you use it, you need to init this using require("lkon")({allowGlobal: true|false, allowRequire: true|false});
* If you set allowGlobal to true, LKON global object will be created.
* If you set allowRequire to true, you will be able to read files with ".lkon" extension using require method, e.g. require("./path/to/file.lkon").
- Every line (except empty ones, and the ones ending with `[`) of lkon code must end with `;`.
- Object keys must be followed by `@`;
- An assigment mark is `=>`;
- Object is set to an Array when it includes lines set to `*` key name;
- You can use single-line comments by following the text with `#`;
- You can read files with `bin` encoding, the output will be a Buffer;
- Now you can use variables by simply writing `use value as key;` (e.g. `use 10 as ten;`), at the top of the file (header), but remember variables cannot be objects;
- You can also import another lkon file and use its data by writing `import "./path/to/file.lkon"utf8 as key;`;
- Now you can use one variable in many places using `this` keyword representing current files' parsed content!

---

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
	];
*/
```