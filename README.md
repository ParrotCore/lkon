# About project...
LKON Parser was created to deliever brand new configuration language called `Language for Konfiguration Object Notation` to your Node.JS project.
**Current version of newer stringifier does not support variables and imports yet!**

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
# What's new?
Version 4.0.1:
- Fixed reading files

---

# LKON Supports these types of data:
- Files - `"./path/to/file"encoding`;
- RegExps - `/your_expression_here/flags`;
- String - `"string"`;
- Date - `"01-01-1970, 0:00:00.000"date`
- undefined - `Undefined`;
- Boolean - `True` or `False`;
- null - `Null`;
- Number - (every kind of notation!) `0x0001`, `1`, `1e+21`, `.1`, `-1`, or `Infinity`;
- NaN - `NaN`;
- Numeric Array:

```js
[
	@* => value;
];
```

- Associative Array:

```js
[
	@key => value;
];
```

---

# Remember
- Before you use it, you need to init this using require("lkon")({allowGlobal: true|false, allowRequire: true|false});
	+ If you set allowGlobal to true, LKON global object will be created.
	+ If you set allowRequire to true, you will be able to read files with ".lkon" extension using require method, e.g. require("./path/to/file.lkon").
- Variables & Imports can be set before `[`, in a `header` of the file;
	+ Import instruction examples:
		1. With destructuring: `import "./path/to/file.lkon"utf8 as [ key=>alias; ];`;
		2. Without destructuring: `import "./path/to/file.lkon"utf8 as key;`;
	+ Use instruction examples:
		 1. With destructuring `use [ @hello => "world"; ] as [ hello=>alias ];`
		 2. Without destructuring: `use "01-01-1970, 0:00:00.000"date as start;`;
- Single-line comments must be followed by `#`;
- Multi-line comments must begin and be followed by `'''` (three apostrophes);
- Every line/expression of LKON Code must end with `[`, or `;`;
- Object keys must begin with `@`;
- `*` (asterisk) mean numeric index, if first property of object has a `*` key, the object is set to an array;
- An assignment mark is `=>`;
- `True`, `False`, `Undefined`, `NaN` and `Null` are cases sensitive and must be started by upper case letter;
- Every string is multi-line, and template string. To put variables into string, you just need to put your variable into `[]` square brackets, e.g. `@string => "Hello, [users.0.username]";`, `@string => "Hello, [Main.users.0.username]";`;
- `Main` keyword is a reference to the global variable of the main object of file.

---

# Examples of using
Using this module is very simple:
```js
const lkon = require('lkon')();

lkon.parse(
`
use "v3.0.0" as version;
use [
	@privateKey => "./private.key"bin;
	@publicKey => "./public.key"bin;
] as keys;
import "./database.lkon"utf8 as [
	host => dbHost;
	port => dbPort;
];


[
  @version => version;
  @admin => [
    @username => "root";
    @password => "Q@wertyuiop";
  ];
  @keys => keys;
  @greeting => "Hello, [Main.admin.username]! The server is running on [dbHost]:[dbPort], its version is [version]."
  @database => [
    @host => dbHost;
    @port => dbPort;
    @username => Main.admin.username;
    @password => Main.admin.password;
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
		greeting: "Hello, root! The server is running on 127.0.0.1:80, its version is v2.0.0.",
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
	],
	null,
	'\t'
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